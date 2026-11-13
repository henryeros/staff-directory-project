





















//@ts-ignore
//@ts-nocheck
// cryptoutils.ts
import forge from 'node-forge';
import { generateRSAKeyPair, exportPublicKey, importPublicKey, isForgeKey } from "@/lib/crypto";

interface EncryptedData {
  cipherText: string;
  key: Uint8Array;
  iv: string;
}

export interface EncryptedPayload {
  clientPublicKey: string;
  encryptedData: string;
  encryptedKey: string;
  iv: string;
}

export interface EncryptedServerResponse {
  EncryptedKey: string;
  EncryptedData: string;
  IV: string;
}

// Cache the availability check
let cryptoAvailable: boolean | null = null;

const isCryptoAvailable = (): boolean => {
  if (cryptoAvailable !== null) return cryptoAvailable;
  cryptoAvailable = typeof window !== 'undefined' && 
                    window.crypto && 
                    window.crypto.subtle !== undefined;
  return cryptoAvailable;
};

export const toBase64 = (buffer: ArrayBuffer | Uint8Array): string => {
  const view = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  const len = view.length;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(view[i]);
  }
  return btoa(binary);
};

export const fromBase64 = (base64: string): Uint8Array => {
  const binary = atob(base64.replace(/[^A-Za-z0-9+/=]/g, ""));
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export const encryptAES = async (data: object): Promise<EncryptedData> => {
  if (isCryptoAvailable()) {
    const aesKey = await window.crypto.subtle.generateKey(
      { name: "AES-CBC", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    const ivBytes = window.crypto.getRandomValues(new Uint8Array(16));
    const encoded = new TextEncoder().encode(JSON.stringify(data));

    const cipherBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-CBC", iv: ivBytes },
      aesKey,
      encoded
    );

    const rawKey = await window.crypto.subtle.exportKey("raw", aesKey);

    return {
      cipherText: toBase64(cipherBuffer),
      key: new Uint8Array(rawKey),
      iv: toBase64(ivBytes),
    };
  }
  
  // Fallback to node-forge
  console.warn('Using node-forge fallback. Consider HTTPS for better performance.');
  
  const key = forge.random.getBytesSync(32);
  const iv = forge.random.getBytesSync(16);
  
  const cipher = forge.cipher.createCipher('AES-CBC', key);
  cipher.start({ iv: iv });
  cipher.update(forge.util.createBuffer(JSON.stringify(data), 'utf8'));
  cipher.finish();
  
  const keyBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    keyBytes[i] = key.charCodeAt(i);
  }
  
  return {
    cipherText: forge.util.encode64(cipher.output.getBytes()),
    key: keyBytes,
    iv: forge.util.encode64(iv),
  };
};

export const encryptKeyWithRSA = async (
  key: Uint8Array,
  rsaKey: CryptoKey | any
): Promise<string> => {
  if (isForgeKey(rsaKey)) {
    console.warn('Using node-forge fallback for RSA');
    
    let keyBinary = '';
    const len = key.length;
    for (let i = 0; i < len; i++) {
      keyBinary += String.fromCharCode(key[i]);
    }
    
    return forge.util.encode64(rsaKey.encrypt(keyBinary, 'RSA-OAEP', {
      md: forge.md.sha256.create()
    }));
  }
  
  if (isCryptoAvailable() && rsaKey.type === 'public') {
    const encryptedKeyBuffer = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      rsaKey,
      key
    );
    return toBase64(encryptedKeyBuffer);
  }
  
  throw new Error('Unsupported RSA key type');
};

const normalizePem = (pem: string): string => {
  if (pem.includes("\n")) return pem.trim();

  const body = pem
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s/g, "");

  const chunked = body.match(/.{1,64}/g)?.join("\n") ?? body;

  return `-----BEGIN PUBLIC KEY-----\n${chunked}\n-----END PUBLIC KEY-----`;
};

export const createEncryptedPayload = async (
  data: object,
  backendPublicKey: CryptoKey | any,
  keyPair: CryptoKeyPair | any
): Promise<EncryptedPayload> => {
  const { cipherText, key, iv } = await encryptAES(data);
  const encryptedKey = await encryptKeyWithRSA(key, backendPublicKey);
  let clientPublicKey = await exportPublicKey(keyPair.publicKey);
  clientPublicKey = normalizePem(clientPublicKey);

  return {
    clientPublicKey,
    encryptedData: cipherText,
    encryptedKey,
    iv,
  };
};

export const decryptResponse = async (
  encryptedResponse: EncryptedServerResponse,
  privateKey: CryptoKey | any,
): Promise<any> => {
  if (isForgeKey(privateKey)) {
    console.warn('Using node-forge fallback for decryption');
    
    const encryptedKeyBinary = forge.util.decode64(encryptedResponse.EncryptedKey);
    const decryptedKeyBinary = privateKey.decrypt(encryptedKeyBinary, 'RSA-OAEP', {
      md: forge.md.sha256.create()
    });
    
    const iv = forge.util.decode64(encryptedResponse.IV);
    const encryptedData = forge.util.decode64(encryptedResponse.EncryptedData);
    
    const decipher = forge.cipher.createDecipher('AES-CBC', decryptedKeyBinary);
    decipher.start({ iv: iv });
    decipher.update(forge.util.createBuffer(encryptedData, 'raw'));
    
    if (!decipher.finish()) throw new Error('Decryption failed');
    
    const jsonText = decipher.output.toString('utf8');
    try {
      return JSON.parse(jsonText);
    } catch {
      return jsonText;
    }
  }
  
  if (isCryptoAvailable() && privateKey.type === 'private') {
    const encryptedKeyBytes = fromBase64(encryptedResponse.EncryptedKey);

    const decryptedAESKeyBuffer = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encryptedKeyBytes
    );

    const aesKey = await window.crypto.subtle.importKey(
      "raw",
      decryptedAESKeyBuffer,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );

    const ivBytes = fromBase64(encryptedResponse.IV);
    const encryptedDataBytes = fromBase64(encryptedResponse.EncryptedData);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-CBC", iv: ivBytes },
      aesKey,
      encryptedDataBytes
    );

    const jsonText = new TextDecoder().decode(decryptedBuffer);

    try {
      return JSON.parse(jsonText);
    } catch {
      return jsonText;
    }
  }
  
  throw new Error('Unsupported private key type');
};










// import { generateRSAKeyPair, exportPublicKey, importPublicKey } from "@/lib/crypto";

// interface EncryptedData {
//   cipherText: string;
//   key: Uint8Array;
//   iv: string;
// }

// export interface EncryptedPayload {
//   clientPublicKey: string;
//   encryptedData: string;
//   encryptedKey: string;
//   iv: string;
// }

// export interface EncryptedServerResponse {
//   EncryptedKey: string;
//   EncryptedData: string;
//   IV: string;
// }

// export const toBase64 = (buffer: ArrayBuffer | Uint8Array): string => {
//   const view = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
//   let binary = "";
//   for (let i = 0; i < view.length; i++) {
//     binary += String.fromCharCode(view[i]);
//   }
//   return btoa(binary);
// };

// export const fromBase64 = (base64: string): Uint8Array => {
//   const cleaned = base64.replace(/[^A-Za-z0-9+/=]/g, "");
//   const binary = atob(cleaned);
//   const bytes = new Uint8Array(binary.length);
//   for (let i = 0; i < binary.length; i++) {
//     bytes[i] = binary.charCodeAt(i);
//   }
//   return bytes;
// };

// export const encryptAES = async (data: object): Promise<EncryptedData> => {
//   const aesKey = await window.crypto.subtle.generateKey(
//     { name: "AES-CBC", length: 256 },
//     true,
//     ["encrypt", "decrypt"]
//   );

//   const ivBytes = window.crypto.getRandomValues(new Uint8Array(16));
//   const encoded = new TextEncoder().encode(JSON.stringify(data));

//   const cipherBuffer = await window.crypto.subtle.encrypt(
//     { name: "AES-CBC", iv: ivBytes },
//     aesKey,
//     encoded
//   );

//   const rawKey = await window.crypto.subtle.exportKey("raw", aesKey);

//   return {
//     cipherText: toBase64(cipherBuffer),
//     key: new Uint8Array(rawKey),
//     iv: toBase64(ivBytes),
//   };
// };

// export const encryptKeyWithRSA = async (
//   key,
//   rsaKey: CryptoKey
// ): Promise<string> => {
//   const encryptedKeyBuffer = await window.crypto.subtle.encrypt(
//     { name: "RSA-OAEP" },
//     rsaKey,
//     key
//   );
//   return toBase64(encryptedKeyBuffer);
// };

// const normalizePem = (pem: string): string => {
//   if (pem.includes("\n")) return pem.trim();

//   const body = pem
//     .replace("-----BEGIN PUBLIC KEY-----", "")
//     .replace("-----END PUBLIC KEY-----", "")
//     .replace(/\s/g, "");

//   const chunked = body.match(/.{1,64}/g)?.join("\n") ?? body;

//   return `-----BEGIN PUBLIC KEY-----\n${chunked}\n-----END PUBLIC KEY-----`;
// };

// export const createEncryptedPayload = async (
//   data: object,
//   backendPublicKey: CryptoKey,
//   keyPair: CryptoKeyPair
// ): Promise<EncryptedPayload> => {
//   const { cipherText, key, iv } = await encryptAES(data);
//   const encryptedKey = await encryptKeyWithRSA(key, backendPublicKey);

//   let clientPublicKey = await exportPublicKey(keyPair.publicKey);
//   clientPublicKey = normalizePem(clientPublicKey);

//   return {
//     clientPublicKey,
//     encryptedData: cipherText,
//     encryptedKey,
//     iv,
//   };
// };

// export const decryptResponse = async (
//   encryptedResponse,
//   privateKey,
// ) => {
//   const encryptedKeyBytes = fromBase64(encryptedResponse.EncryptedKey);

//   const decryptedAESKeyBuffer = await window.crypto.subtle.decrypt(
//     { name: "RSA-OAEP" },
//     privateKey,
//     //@ts-nocheck
// //@ts-ignore
//     encryptedKeyBytes
//   );

//   const aesKey = await window.crypto.subtle.importKey(
//     "raw",
//     decryptedAESKeyBuffer,
//     { name: "AES-CBC" },
//     false,
//     ["decrypt"]
//   );

//   const ivBytes = fromBase64(encryptedResponse.IV);
//   const encryptedDataBytes = fromBase64(encryptedResponse.EncryptedData);

//   const decryptedBuffer = await window.crypto.subtle.decrypt(
//     //@ts-nocheck
// //@ts-ignore
//     { name: "AES-CBC", iv: ivBytes },
//     aesKey,
//     encryptedDataBytes
//   );

//   const jsonText = new TextDecoder().decode(decryptedBuffer);

//   try {
//     return JSON.parse(jsonText);
//   } catch {
//     return jsonText;
//   }
// };



















// // lib/cryptoUtils.ts
// //@ts-ignore
// //@ts-nocheck
// import forge from 'node-forge';
// import { generateRSAKeyPair, exportPublicKey, importPublicKey, isForgeKey } from "@/lib/crypto";

// interface EncryptedData {
//   cipherText: string;
//   key: Uint8Array;
//   iv: string;
// }

// export interface EncryptedPayload {
//   clientPublicKey: string;
//   encryptedData: string;
//   encryptedKey: string;
//   iv: string;
// }

// export interface EncryptedServerResponse {
//   EncryptedKey: string;
//   EncryptedData: string;
//   IV: string;
// }

// // Check if Web Crypto API is available
// const isCryptoAvailable = (): boolean => {
//   return typeof window !== 'undefined' && 
//          window.crypto && 
//          window.crypto.subtle !== undefined;
// };

// export const toBase64 = (buffer: ArrayBuffer | Uint8Array): string => {
//   const view = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
//   let binary = "";
//   for (let i = 0; i < view.length; i++) {
//     binary += String.fromCharCode(view[i]);
//   }
//   return btoa(binary);
// };

// export const fromBase64 = (base64: string): Uint8Array => {
//   const cleaned = base64.replace(/[^A-Za-z0-9+/=]/g, "");
//   const binary = atob(cleaned);
//   const bytes = new Uint8Array(binary.length);
//   for (let i = 0; i < binary.length; i++) {
//     bytes[i] = binary.charCodeAt(i);
//   }
//   return bytes;
// };

// export const encryptAES = async (data: object): Promise<EncryptedData> => {
//   if (isCryptoAvailable()) {
//     // Use Web Crypto API
//     const aesKey = await window.crypto.subtle.generateKey(
//       { name: "AES-CBC", length: 256 },
//       true,
//       ["encrypt", "decrypt"]
//     );

//     const ivBytes = window.crypto.getRandomValues(new Uint8Array(16));
//     const encoded = new TextEncoder().encode(JSON.stringify(data));

//     const cipherBuffer = await window.crypto.subtle.encrypt(
//       { name: "AES-CBC", iv: ivBytes },
//       aesKey,
//       encoded
//     );

//     const rawKey = await window.crypto.subtle.exportKey("raw", aesKey);

//     return {
//       cipherText: toBase64(cipherBuffer),
//       key: new Uint8Array(rawKey),
//       iv: toBase64(ivBytes),
//     };
//   } else {
//     // Fallback to node-forge
//     console.warn('Using node-forge fallback for AES encryption. Consider using HTTPS for better security.');
    
//     // Generate random key (256 bits = 32 bytes)
//     const key = forge.random.getBytesSync(32);
    
//     // Generate random IV (128 bits = 16 bytes)
//     const iv = forge.random.getBytesSync(16);
    
//     // Create cipher
//     const cipher = forge.cipher.createCipher('AES-CBC', key);
//     cipher.start({ iv: iv });
    
//     // Encrypt
//     const jsonString = JSON.stringify(data);
//     cipher.update(forge.util.createBuffer(jsonString, 'utf8'));
//     cipher.finish();
    
//     const encrypted = cipher.output.getBytes();
//     const keyBytes = new Uint8Array(32);
//     for (let i = 0; i < 32; i++) {
//       keyBytes[i] = key.charCodeAt(i);
//     }
    
//     return {
//       cipherText: forge.util.encode64(encrypted),
//       key: keyBytes,
//       iv: forge.util.encode64(iv),
//     };
//   }
// };

// export const encryptKeyWithRSA = async (
//   key: Uint8Array,
//   rsaKey: CryptoKey | any
// ): Promise<string> => {
//   // Check if it's a forge key first
//   if (isForgeKey(rsaKey)) {
//     // Fallback to node-forge
//     console.warn('Using node-forge fallback for RSA encryption');
    
//     // Convert Uint8Array to binary string
//     let keyBinary = '';
//     for (let i = 0; i < key.length; i++) {
//       keyBinary += String.fromCharCode(key[i]);
//     }
    
//     // Encrypt with RSA-OAEP
//     const encrypted = rsaKey.encrypt(keyBinary, 'RSA-OAEP', {
//       md: forge.md.sha256.create()
//     });
    
//     return forge.util.encode64(encrypted);
//   } else if (isCryptoAvailable() && rsaKey.type === 'public') {
//     // Use Web Crypto API
//     const encryptedKeyBuffer = await window.crypto.subtle.encrypt(
//       { name: "RSA-OAEP" },
//       rsaKey,
//       //@ts-ignore
//       key
//     );
//     return toBase64(encryptedKeyBuffer);
//   } else {
//     throw new Error('Unsupported RSA key type for encryption');
//   }
// };

// const normalizePem = (pem: string): string => {
//   if (pem.includes("\n")) return pem.trim();

//   const body = pem
//     .replace("-----BEGIN PUBLIC KEY-----", "")
//     .replace("-----END PUBLIC KEY-----", "")
//     .replace(/\s/g, "");

//   const chunked = body.match(/.{1,64}/g)?.join("\n") ?? body;

//   return `-----BEGIN PUBLIC KEY-----\n${chunked}\n-----END PUBLIC KEY-----`;
// };

// export const createEncryptedPayload = async (
//   data: object,
//   backendPublicKey: CryptoKey | any,
//   keyPair: CryptoKeyPair | any
// ): Promise<EncryptedPayload> => {
//   const { cipherText, key, iv } = await encryptAES(data);
//   const encryptedKey = await encryptKeyWithRSA(key, backendPublicKey);

//   let clientPublicKey = await exportPublicKey(keyPair.publicKey);
//   clientPublicKey = normalizePem(clientPublicKey);

//   return {
//     clientPublicKey,
//     encryptedData: cipherText,
//     encryptedKey,
//     iv,
//   };
// };

// export const decryptResponse = async (
//   encryptedResponse: EncryptedServerResponse,
//   privateKey: CryptoKey | any,
// ): Promise<any> => {
//   // Check if it's a forge key first
//   if (isForgeKey(privateKey)) {
//     // Fallback to node-forge
//     console.warn('Using node-forge fallback for decryption');
    
//     // Decrypt RSA
//     const encryptedKeyBinary = forge.util.decode64(encryptedResponse.EncryptedKey);
//     const decryptedKeyBinary = privateKey.decrypt(encryptedKeyBinary, 'RSA-OAEP', {
//       md: forge.md.sha256.create()
//     });
    
//     // Decrypt AES
//     const iv = forge.util.decode64(encryptedResponse.IV);
//     const encryptedData = forge.util.decode64(encryptedResponse.EncryptedData);
    
//     const decipher = forge.cipher.createDecipher('AES-CBC', decryptedKeyBinary);
//     decipher.start({ iv: iv });
//     decipher.update(forge.util.createBuffer(encryptedData, 'raw'));
    
//     if (decipher.finish()) {
//       const jsonText = decipher?.output?.toString('utf8');
//       try {
//         return JSON.parse(jsonText);
//       } catch {
//         return jsonText;
//       }
//     } else {
//       throw new Error('Decryption failed');
//     }
//   } else if (isCryptoAvailable() && privateKey.type === 'private') {
//     // Use Web Crypto API
//     const encryptedKeyBytes = fromBase64(encryptedResponse.EncryptedKey);

//     const decryptedAESKeyBuffer = await window.crypto.subtle.decrypt(
//       { name: "RSA-OAEP" },
//       privateKey,
//       //@ts-ignore
//       encryptedKeyBytes
//     );

//     const aesKey = await window.crypto.subtle.importKey(
//       "raw",
//       decryptedAESKeyBuffer,
//       { name: "AES-CBC" },
//       false,
//       ["decrypt"]
//     );

//     const ivBytes = fromBase64(encryptedResponse.IV);
//     const encryptedDataBytes = fromBase64(encryptedResponse.EncryptedData);

//     const decryptedBuffer = await window.crypto.subtle.decrypt(
//       { name: "AES-CBC", iv: ivBytes },
//       aesKey,
//       encryptedDataBytes
//     );

//     const jsonText = new TextDecoder().decode(decryptedBuffer);

//     try {
//       return JSON.parse(jsonText);
//     } catch {
//       return jsonText;
//     }
//   } else {
//     throw new Error('Unsupported private key type for decryption');
//   }
// };