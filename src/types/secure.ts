// src/types/secure.ts

// Hybrid wrapper
export type EncryptedPayload = {
  clientPublicKeyPEM: string;   // client's RSA public key (PEM) so server can encrypt the response
  encryptedAESKeyB64: string;   // RSA-OAEP(server pub) of 32-byte AES key
  ivB64: string;                // base64(12 bytes)
  cipherTextB64: string;        // base64(AES-GCM ciphertext+tag)
};

export type EncryptedResponse = {
  encryptedKeyB64: string;      // RSA-OAEP(client pub) of response AES key
  ivB64: string;
  cipherTextB64: string;
};

// GET /api/v1/user/hire (decrypted payload)
export type HireQuery = {
  Branch?: string;         // string
  PageNumber?: number;     // int32
  PageSize?: number;       // int32
  Search?: string;         // string
};

// Hire row (exact fields you asked for)
export type HireRow = {
  UserNameString: string;
  DisplayNameString: string;
  EmailString: string;
  PhoneNumberString: string;
  DateOfBirth: string;                // ISO 8601
  GenderString: string;
  JobTitleString: string;
  StartDate: string;                  // ISO 8601
  TheSameTimeFormat: string;          // ISO 8601
  AccountCreationDateFormat: string;  // ISO 8601
  DepartmentString: string;
  EmploymentTypeString: string;
  DNString: string;
  IsActiveString: "true" | "false";
  TokenString: string;
  TokenExpiryDateFormat: string;      // ISO 8601
};

// Response envelope
export type HireApiResult = {
  successCode: string;   // e.g. "OK"
  description: string;   // e.g. "Hires fetched successfully."
  data: HireRow[];       // array of rows
  total: number;         // total after filtering
  pageNumber: number;
  pageSize: number;
};