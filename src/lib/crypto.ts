











// lib/crypto.ts
import forge from 'node-forge';

// Cache the availability check
let cryptoAvailable: boolean | null = null;

const isWebCryptoAvailable = (): boolean => {
  if (cryptoAvailable !== null) return cryptoAvailable;
  cryptoAvailable = typeof window !== 'undefined' && 
                    window.crypto && 
                    window.crypto.subtle !== undefined;
  return cryptoAvailable;
};

// Helper function to detect key type (optimized)
export function isForgeKey(key: any): boolean {
  return key?._isForge === true;
}

// --- RSA Utilities ---

export async function generateRSAKeyPair() {
  if (isWebCryptoAvailable()) {
    return await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );
  }
  
  // Fallback to node-forge (HTTP)
  console.warn('Using fallback crypto. Consider HTTPS for better performance.');
  const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, workers: -1 }); // Use Web Workers
  
  return {
    publicKey: { ...keypair.publicKey, _isForge: true },
    privateKey: { ...keypair.privateKey, _isForge: true },
  } as any;
}

export async function exportPublicKey(key: any): Promise<string> {
  if (isForgeKey(key)) {
    const pem = forge.pki.publicKeyToPem(key);
    return pem.replace(/-----BEGIN PUBLIC KEY-----\r?\n/, '')
              .replace(/\r?\n-----END PUBLIC KEY-----/, '')
              .replace(/\r?\n/g, '');
  }
  
  if (isWebCryptoAvailable()) {
    const spki = await window.crypto.subtle.exportKey("spki", key);
    return btoa(String.fromCharCode(...new Uint8Array(spki)));
  }
  
  throw new Error('Unsupported key type');
}

export async function importPublicKey(pem: string): Promise<any> {
  if (!isWebCryptoAvailable()) {
    const pemFormatted = `-----BEGIN PUBLIC KEY-----\n${pem.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
    const publicKey = forge.pki.publicKeyFromPem(pemFormatted);
    return { ...publicKey, _isForge: true };
  }
  
  try {
    const pemContents = pem
      .replace("-----BEGIN PUBLIC KEY-----", "")
      .replace("-----END PUBLIC KEY-----", "")
      .replace(/\s/g, "");

    const binaryDer = new Uint8Array(
      atob(pemContents).split('').map(c => c.charCodeAt(0))
    );

    return await window.crypto.subtle.importKey(
      "spki",
      binaryDer.buffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"]
    );
  } catch {
    const pemFormatted = `-----BEGIN PUBLIC KEY-----\n${pem.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
    const publicKey = forge.pki.publicKeyFromPem(pemFormatted);
    return { ...publicKey, _isForge: true };
  }
}

export async function encryptWithPublicKey(data: string, publicKey: any): Promise<ArrayBuffer> {
  if (isForgeKey(publicKey)) {
    const encrypted = publicKey.encrypt(data, 'RSA-OAEP', {
      md: forge.md.sha256.create()
    });
    const bytes = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      bytes[i] = encrypted.charCodeAt(i);
    }
    return bytes.buffer;
  }
  
  const encoded = new TextEncoder().encode(data);
  return await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, encoded);
}

export async function decryptWithPrivateKey(encrypted: ArrayBuffer, privateKey: any): Promise<string> {
  if (isForgeKey(privateKey)) {
    const bytes = new Uint8Array(encrypted);
    let binaryString = '';
    for (let i = 0; i < bytes.length; i++) {
      binaryString += String.fromCharCode(bytes[i]);
    }
    return privateKey.decrypt(binaryString, 'RSA-OAEP', {
      md: forge.md.sha256.create()
    });
  }
  
  const decrypted = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encrypted);
  return new TextDecoder().decode(decrypted);
}

// --- AES Utilities ---

export async function generateAESKey(): Promise<any> {
  if (isWebCryptoAvailable()) {
    return await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }
  
  return {
    _isForge: true,
    _key: forge.random.getBytesSync(32)
  };
}

export async function encryptWithAES(
  plaintext: string,
  key: any,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  if (key._isForge) {
    let ivString = '';
    for (let i = 0; i < iv.length; i++) {
      ivString += String.fromCharCode(iv[i]);
    }
    
    const cipher = forge.cipher.createCipher('AES-GCM', key._key);
    cipher.start({ iv: ivString });
    cipher.update(forge.util.createBuffer(plaintext, 'utf8'));
    cipher.finish();
    
    const encrypted = cipher.output.getBytes();
    const tag = cipher.mode.tag.getBytes();
    const combined = encrypted + tag;
    
    const bytes = new Uint8Array(combined.length);
    for (let i = 0; i < combined.length; i++) {
      bytes[i] = combined.charCodeAt(i);
    }
    return bytes.buffer;
  }
  
  const encoded = new TextEncoder().encode(plaintext);
  return await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    encoded
  );
}

export async function decryptWithAES(cipherText: ArrayBuffer, key: any, iv: Uint8Array): Promise<string> {
  if (key._isForge) {
    const bytes = new Uint8Array(cipherText);
    const encryptedData = bytes.subarray(0, -16);
    const tag = bytes.subarray(-16);
    
    let encryptedString = '';
    for (let i = 0; i < encryptedData.length; i++) {
      encryptedString += String.fromCharCode(encryptedData[i]);
    }
    
    let tagString = '';
    for (let i = 0; i < tag.length; i++) {
      tagString += String.fromCharCode(tag[i]);
    }
    
    let ivString = '';
    for (let i = 0; i < iv.length; i++) {
      ivString += String.fromCharCode(iv[i]);
    }
    
    const decipher = forge.cipher.createDecipher('AES-GCM', key._key);
    decipher.start({ iv: ivString, tag: tagString });
    decipher.update(forge.util.createBuffer(encryptedString, 'raw'));
    
    if (!decipher.finish()) throw new Error('Decryption failed');
    return decipher.output.toString('utf8');
  }
  
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    cipherText
  );
  return new TextDecoder().decode(decrypted);
}

export async function exportAESKey(key: any): Promise<Uint8Array> {
  if (key._isForge) {
    const bytes = new Uint8Array(key._key.length);
    for (let i = 0; i < key._key.length; i++) {
      bytes[i] = key._key.charCodeAt(i);
    }
    return bytes;
  }
  
  const raw = await window.crypto.subtle.exportKey("raw", key);
  return new Uint8Array(raw);
}

export async function importAESKey(rawKey: Uint8Array): Promise<any> {
  if (!isWebCryptoAvailable()) {
    let keyString = '';
    for (let i = 0; i < rawKey.length; i++) {
      keyString += String.fromCharCode(rawKey[i]);
    }
    return {
      _isForge: true,
      _key: keyString
    };
  }
  
  return await window.crypto.subtle.importKey(
    "raw",
    rawKey as BufferSource,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}




























// // lib/crypto.ts

// // --- RSA Utilities ---

// export async function generateRSAKeyPair() {
//     return await window.crypto.subtle.generateKey(
//         {
//             name: "RSA-OAEP",
//             modulusLength: 2048,
//             publicExponent: new Uint8Array([1, 0, 1]),
//             hash: "SHA-256",
//         },
//         true,
//         ["encrypt", "decrypt"]
//     );
// }

// export async function exportPublicKey(key: CryptoKey): Promise<string> {
//     const spki = await window.crypto.subtle.exportKey("spki", key);
//     return btoa(String.fromCharCode(...new Uint8Array(spki)));
// }


// export async function importPublicKey(pem: string): Promise<CryptoKey> {
//     const pemHeader = "-----BEGIN PUBLIC KEY-----";
//     const pemFooter = "-----END PUBLIC KEY-----";
//     const pemContents = pem
//         .replace(pemHeader, "")
//         .replace(pemFooter, "")
//         .replace(/\s/g, "");

//     const binaryDer = new Uint8Array(
//         atob(pemContents)
//             .split('')
//             .map(char => char.charCodeAt(0))
//     );

//     return await window.crypto.subtle.importKey(
//         "spki",
//         binaryDer.buffer,
//         {
//             name: "RSA-OAEP",
//             hash: "SHA-256",
//         },
//         true,
//         ["encrypt"]
//     );
// }


// export async function encryptWithPublicKey(data: string, publicKey: CryptoKey): Promise<ArrayBuffer> {
//     const encoded = new TextEncoder().encode(data);
//     return await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, encoded);
// }

// export async function decryptWithPrivateKey(encrypted: ArrayBuffer, privateKey: CryptoKey): Promise<string> {
//     const decrypted = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encrypted);
//     return new TextDecoder().decode(decrypted);
// }

// // --- AES Utilities ---

// export async function generateAESKey(): Promise<CryptoKey> {
//     return await window.crypto.subtle.generateKey(
//         {
//             name: "AES-GCM",
//             length: 256,
//         },
//         true,
//         ["encrypt", "decrypt"]
//     );
// }

// export async function encryptWithAES(
//     plaintext: string,
//     key: CryptoKey,
//     iv: Uint8Array
// ): Promise<ArrayBuffer> {
//     const encoded = new TextEncoder().encode(plaintext);
//     return await window.crypto.subtle.encrypt(
//         {
//             name: "AES-GCM",
//             iv: iv as BufferSource, // explicitly cast if needed
//         },
//         key,
//         encoded
//     );
// }


// export async function decryptWithAES(cipherText: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<string> {
//     const decrypted = await window.crypto.subtle.decrypt(
//         {
//             name: "AES-GCM",
//             iv: iv as BufferSource, // explicitly cast if needed
//         },
//         key,
//         cipherText
//     );
//     return new TextDecoder().decode(decrypted);
// }

// export async function exportAESKey(key: CryptoKey): Promise<Uint8Array> {
//     const raw = await window.crypto.subtle.exportKey("raw", key);
//     return new Uint8Array(raw);
// }

// export async function importAESKey(rawKey: Uint8Array): Promise<CryptoKey> {
//     return await window.crypto.subtle.importKey(
//         "raw",
//         rawKey as BufferSource,
//         { name: "AES-GCM" },
//         false,
//         ["encrypt", "decrypt"]
//     );
// }










































































































































// // lib/crypto.ts
// import forge from 'node-forge';

// // Check if Web Crypto API is available
// const isWebCryptoAvailable = typeof window !== 'undefined' && 
//                               window.crypto && 
//                               window.crypto.subtle !== undefined;

// // Helper function to detect key type
// export function isForgeKey(key: any): boolean {
//     return key && (key._isForge === true || 
//                   typeof key.encrypt === 'function' || 
//                   typeof key.decrypt === 'function' ||
//                   forge.pki.publicKeyToPem(key).includes('BEGIN PUBLIC KEY'));
// }

// // --- RSA Utilities ---

// export async function generateRSAKeyPair() {
//     if (isWebCryptoAvailable) {
//         // Use Web Crypto API (HTTPS/localhost)
//         return await window.crypto.subtle.generateKey(
//             {
//                 name: "RSA-OAEP",
//                 modulusLength: 2048,
//                 publicExponent: new Uint8Array([1, 0, 1]),
//                 hash: "SHA-256",
//             },
//             true,
//             ["encrypt", "decrypt"]
//         );
//     } else {
//         // Fallback to node-forge (HTTP)
//         console.warn('Using fallback crypto library. Consider using HTTPS for better security.');
//         const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
        
//         // Return in a format compatible with Web Crypto API
//         return {
//             publicKey: { ...keypair.publicKey, _isForge: true },
//             privateKey: { ...keypair.privateKey, _isForge: true },
//         } as any;
//     }
// }

// export async function exportPublicKey(key: any): Promise<string> {
//     // Always check for forge key first
//     if (isForgeKey(key)) {
//         // node-forge format
//         const pem = forge.pki.publicKeyToPem(key);
//         return pem.replace(/-----BEGIN PUBLIC KEY-----\r?\n/, '')
//                   .replace(/\r?\n-----END PUBLIC KEY-----/, '')
//                   .replace(/\r?\n/g, '');
//     } else if (isWebCryptoAvailable && key && typeof window.crypto.subtle.exportKey === 'function') {
//         // Web Crypto API format
//         try {
//             const spki = await window.crypto.subtle.exportKey("spki", key);
//             return btoa(String.fromCharCode(...new Uint8Array(spki)));
//         } catch (error) {
//             console.error('Web Crypto export failed:', error);
//             throw new Error('Failed to export public key');
//         }
//     } else {
//         throw new Error('Unsupported key type or environment for public key export');
//     }
// }

// export async function importPublicKey(pem: string): Promise<any> {
//     if (!isWebCryptoAvailable) {
//         // node-forge fallback
//         const pemFormatted = `-----BEGIN PUBLIC KEY-----\n${pem.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
//         const publicKey = forge.pki.publicKeyFromPem(pemFormatted);
//         return { ...publicKey, _isForge: true };
//     }
    
//     try {
//         const pemHeader = "-----BEGIN PUBLIC KEY-----";
//         const pemFooter = "-----END PUBLIC KEY-----";
//         const pemContents = pem
//             .replace(pemHeader, "")
//             .replace(pemFooter, "")
//             .replace(/\s/g, "");

//         const binaryDer = new Uint8Array(
//             atob(pemContents)
//                 .split('')
//                 .map(char => char.charCodeAt(0))
//         );

//         return await window.crypto.subtle.importKey(
//             "spki",
//             binaryDer.buffer,
//             {
//                 name: "RSA-OAEP",
//                 hash: "SHA-256",
//             },
//             true,
//             ["encrypt"]
//         );
//     } catch (error) {
//         console.warn('Web Crypto import failed, using forge fallback:', error);
//         const pemFormatted = `-----BEGIN PUBLIC KEY-----\n${pem.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
//         const publicKey = forge.pki.publicKeyFromPem(pemFormatted);
//         return { ...publicKey, _isForge: true };
//     }
// }

// export async function encryptWithPublicKey(data: string, publicKey: any): Promise<ArrayBuffer> {
//     if (isForgeKey(publicKey)) {
//         // node-forge fallback
//         const encrypted = publicKey.encrypt(data, 'RSA-OAEP', {
//             md: forge.md.sha256.create()
//         });
//         return forge.util.binary.raw.decode(encrypted).buffer;
//     }
    
//     const encoded = new TextEncoder().encode(data);
//     return await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, encoded);
// }

// export async function decryptWithPrivateKey(encrypted: ArrayBuffer, privateKey: any): Promise<string> {
//     if (isForgeKey(privateKey)) {
//         // node-forge fallback
//         const encryptedBytes = forge.util.createBuffer(new Uint8Array(encrypted));
//         const decrypted = privateKey.decrypt(encryptedBytes.getBytes(), 'RSA-OAEP', {
//             md: forge.md.sha256.create()
//         });
//         return decrypted;
//     }
    
//     const decrypted = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encrypted);
//     return new TextDecoder().decode(decrypted);
// }

// // --- AES Utilities ---

// export async function generateAESKey(): Promise<any> {
//     if (isWebCryptoAvailable) {
//         return await window.crypto.subtle.generateKey(
//             {
//                 name: "AES-GCM",
//                 length: 256,
//             },
//             true,
//             ["encrypt", "decrypt"]
//         );
//     } else {
//         // Generate random 256-bit key for node-forge
//         const randomBytes = forge.random.getBytesSync(32);
//         return {
//             _isForge: true,
//             _key: randomBytes
//         };
//     }
// }

// export async function encryptWithAES(
//     plaintext: string,
//     key: any,
//     iv: Uint8Array
// ): Promise<ArrayBuffer> {
//     if (key._isForge) {
//         // node-forge fallback
//         const cipher = forge.cipher.createCipher('AES-GCM', key._key);
//         cipher.start({ iv: forge.util.createBuffer(iv) });
//         cipher.update(forge.util.createBuffer(plaintext, 'utf8'));
//         cipher.finish();
        
//         const encrypted = cipher.output.getBytes();
//         const tag = cipher.mode.tag.getBytes();
        
//         // Combine encrypted data and auth tag
//         const combined = encrypted + tag;
//         return forge.util.binary.raw.decode(combined).buffer;
//     }
    
//     const encoded = new TextEncoder().encode(plaintext);
//     return await window.crypto.subtle.encrypt(
//         {
//             name: "AES-GCM",
//             iv: iv as BufferSource,
//         },
//         key,
//         encoded
//     );
// }

// export async function decryptWithAES(cipherText: ArrayBuffer, key: any, iv: Uint8Array): Promise<string> {
//     if (key._isForge) {
//         // node-forge fallback
//         const bytes = new Uint8Array(cipherText);
//         const encryptedData = bytes.slice(0, -16); // All but last 16 bytes
//         const tag = bytes.slice(-16); // Last 16 bytes
        
//         const decipher = forge.cipher.createDecipher('AES-GCM', key._key);
//         decipher.start({
//             iv: forge.util.createBuffer(iv),
//             tag: forge.util.createBuffer(tag)
//         });
//         decipher.update(forge.util.createBuffer(encryptedData));
        
//         if (decipher.finish()) {
//             return decipher?.output?.toString('utf8');
//         } else {
//             throw new Error('Decryption failed');
//         }
//     }
    
//     const decrypted = await window.crypto.subtle.decrypt(
//         {
//             name: "AES-GCM",
//             iv: iv as BufferSource,
//         },
//         key,
//         cipherText
//     );
//     return new TextDecoder().decode(decrypted);
// }

// export async function exportAESKey(key: any): Promise<Uint8Array> {
//     if (key._isForge) {
//         return new Uint8Array(forge.util.binary.raw.decode(key._key));
//     }
    
//     const raw = await window.crypto.subtle.exportKey("raw", key);
//     return new Uint8Array(raw);
// }

// export async function importAESKey(rawKey: Uint8Array): Promise<any> {
//     if (!isWebCryptoAvailable) {
//         return {
//             _isForge: true,
//             _key: forge.util.createBuffer(rawKey).getBytes()
//         };
//     }
    
//     return await window.crypto.subtle.importKey(
//         "raw",
//         rawKey as BufferSource,
//         { name: "AES-GCM" },
//         false,
//         ["encrypt", "decrypt"]
//     );
// }