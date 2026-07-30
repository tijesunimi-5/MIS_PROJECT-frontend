// lib/crypto.ts
import CryptoJS from "crypto-js";

export const cryptoUtils = {
  /**
   * Decrypts AES-256-CBC hex string (format "ivHex:ciphertextHex") with provided secret key
   */
  decryptPayload: (encryptedText: string, secretKey: string): string => {
    if (!encryptedText || typeof encryptedText !== "string") return "";
    if (!encryptedText.includes(":")) return encryptedText; // Already plain text or unencrypted

    try {
      const [ivHex, cipherHex] = encryptedText.split(":");
      if (!ivHex || !cipherHex) return encryptedText;

      const keyWords = CryptoJS.enc.Utf8.parse(secretKey);
      const ivWords = CryptoJS.enc.Hex.parse(ivHex);
      const cipherWords = CryptoJS.enc.Hex.parse(cipherHex);

      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: cipherWords,
      });

      const decrypted = CryptoJS.AES.decrypt(cipherParams, keyWords, {
        iv: ivWords,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const plainText = decrypted.toString(CryptoJS.enc.Utf8);
      return plainText || encryptedText;
    } catch (error) {
      return encryptedText;
    }
  },

  /**
   * Verifies if a given secret key can successfully decrypt a ciphertext payload
   */
  verifyKey: (sampleCiphertext: string, secretKey: string): boolean => {
    if (!sampleCiphertext || !sampleCiphertext.includes(":")) return true;
    try {
      const decrypted = cryptoUtils.decryptPayload(sampleCiphertext, secretKey);
      return Boolean(decrypted && decrypted !== sampleCiphertext && !decrypted.includes(":\u0000"));
    } catch {
      return false;
    }
  },
};

