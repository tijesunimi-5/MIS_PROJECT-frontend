// lib/crypto.ts
import CryptoJS from "crypto-js";

const SECRET_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

export const cryptoUtils = {
  /**
   * Encrypts plain text password into an AES Ciphertext block
   */
  encryptPassword: (password: string): string => {
    try {
      return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
    } catch (error) {
      console.error("Crypto-JS Encryption Error:", error);
      return "";
    }
  },

  /**
   * Encrypts a raw string
   */
  encryptString: (plainText: string): string => {
    try {
      return CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();
    } catch (error) {
      console.error("Frontend Encryption Error:", error);
      return "";
    }
  },

  /**
   * Decrypts an AES Ciphertext block back to plain text
   */
  decryptString: (cipherText: string): string => {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Frontend Decryption Error:", error);
      return "";
    }
  },
};
