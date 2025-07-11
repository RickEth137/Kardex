import axios from 'axios';
import CryptoJS from 'crypto-js';
import { WalletUtils } from './walletUtils';

// Update the API_BASE to the production URL
const API_BASE = 'https://www.striga.com/api/v1';

// Default API keys
const DEFAULT_API_KEY = "YsIy5RYLDGPhVz2xWBWUlv3wW1pNHnyhgKILG5kulPY=";
const DEFAULT_API_SECRET = "gLjwb4+p4x941sCMzG6sU0GGyacy/upvfUDa6qqjswE=";

// Define interfaces first
interface UserResponseData {
  id: string;
  [key: string]: any;
}

interface UserResponse {
  data: UserResponseData;
}

interface AccountResponseData {
  id: string;
  [key: string]: any;
}

interface AccountResponse {
  data: AccountResponseData;
}

interface CardResponseData {
  id: string;
  [key: string]: any;
}

interface CardResponse {
  data: CardResponseData;
}

function generateHMACSignature(method: string, path: string, body: any, apiSecret: string = DEFAULT_API_SECRET): string {
  const time = Date.now().toString();
  const bodyString = body ? JSON.stringify(body) : '';
  const requestContentHex = CryptoJS.MD5(bodyString).toString(CryptoJS.enc.Hex);
  const signatureRawData = time + method.toUpperCase() + path + requestContentHex;
  const requestSignatureHex = CryptoJS.HmacSHA256(signatureRawData, apiSecret).toString(CryptoJS.enc.Hex);
  return `HMAC ${time}:${requestSignatureHex}`;
}

export class CardUtils {
  static async purchaseVirtualCard(
    value: number, 
    crypto: string = 'USDC', 
    apiKey: string = DEFAULT_API_KEY, 
    apiSecret: string = DEFAULT_API_SECRET, 
    email: string, 
    password: string
  ) {
    try {
      const userBody = {
        firstName: 'Test',
        lastName: 'User',
        email: email || 'test@example.com',
        dateOfBirth: '1990-01-01',
        address: { country: 'EE' }
      };
      const userPath = '/users';
      const userAuth = generateHMACSignature('POST', userPath, userBody, apiSecret);
      const userResponse = await axios.post<UserResponse>(
        `${API_BASE}${userPath}`,
        userBody,
        {
          headers: {
            'api-key': apiKey,
            'Authorization': userAuth,
            'Content-Type': 'application/json'
          }
        }
      );
      // Use type assertion to ensure TypeScript recognizes the structure
      const userId = (userResponse.data as any).id;

      const accountBody = {
        userId: userId,
        currency: crypto
      };
      const accountPath = '/accounts';
      const accountAuth = generateHMACSignature('POST', accountPath, accountBody, apiSecret);
      const accountResponse = await axios.post<AccountResponse>(
        `${API_BASE}${accountPath}`,
        accountBody,
        {
          headers: {
            'api-key': apiKey,
            'Authorization': accountAuth,
            'Content-Type': 'application/json'
          }
        }
      );
      // Use type assertion to ensure TypeScript recognizes the structure
      const accountId = (accountResponse.data as any).id;

      const cardBody = {
        accountIdToLink: accountId,
        type: 'virtual'
      };
      const cardPath = '/cards';
      const cardAuth = generateHMACSignature('POST', cardPath, cardBody, apiSecret);
      const cardResponse = await axios.post<CardResponse>(
        `${API_BASE}${cardPath}`,
        cardBody,
        {
          headers: {
            'api-key': apiKey,
            'Authorization': cardAuth,
            'Content-Type': 'application/json'
          }
        }
      );
      // Use type assertion to ensure TypeScript recognizes the structure
      const cardId = (cardResponse.data as any).id;

      const fundBody = {
        amount: value.toString(),
        currency: crypto
      };
      const fundPath = `/cards/${cardId}/fund`;
      const fundAuth = generateHMACSignature('POST', fundPath, fundBody, apiSecret);
      await axios.post(`${API_BASE}${fundPath}`, fundBody, {
        headers: {
          'api-key': apiKey,
          'Authorization': fundAuth,
          'Content-Type': 'application/json'
        }
      });

      const getPath = `/cards/${cardId}`;
      const getAuth = generateHMACSignature('GET', getPath, null, apiSecret);
      const detailsResponse = await axios.get(`${API_BASE}${getPath}`, {
        headers: {
          'api-key': apiKey,
          'Authorization': getAuth,
          'Content-Type': 'application/json'
        }
      });

      const card = detailsResponse.data;
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(card), password).toString();
      localStorage.setItem('encryptedCard', encrypted);

      return card;
    } catch (error) {
      throw new Error('Card purchase failed: ' + (error as any).response?.data?.message || (error as Error).message);
    }
  }

  static async getStoredCard(password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const encryptedCard = localStorage.getItem('encryptedCard');
      if (encryptedCard) {
        try {
          const decrypted = CryptoJS.AES.decrypt(encryptedCard, password).toString(CryptoJS.enc.Utf8);
          resolve(JSON.parse(decrypted));
        } catch (error) {
          reject(new Error('Decryption failed'));
        }
      } else {
        resolve(null);
      }
    });
  }

  // Add a method to securely store API credentials
  static saveApiCredentials(apiKey: string, apiSecret: string): void {
    if (!apiKey || !apiSecret) return;

    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('apiSecret', apiSecret);
  }

  // Add a method to retrieve API credentials
  static getApiCredentials(): { apiKey: string, apiSecret: string } {
    const apiKey = localStorage.getItem('apiKey') || '';
    const apiSecret = localStorage.getItem('apiSecret') || '';

    return { apiKey, apiSecret };
  }

  /**
   * Top up an existing virtual card
   */
  static async topUpCard(
    cardId: string,
    amount: number,
    currency: string,
    apiKey: string, 
    apiSecret: string,
    password: string
  ): Promise<any> {
    try {
      // Use getPrivateKey instead of getWalletWithPassword
      const privateKey = await WalletUtils.getPrivateKey(password);
      if (!privateKey) {
        throw new Error('Invalid password');
      }
      
      // Make API call to top up the card
      const response = await fetch('https://api.striga.com/v1/cards/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
          'X-API-SECRET': apiSecret,
        },
        body: JSON.stringify({
          cardId: cardId,
          amount: amount,
          currency: currency
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to top up card');
      }
      
      // Remove the unused data variable
      // const data = await response.json();
      
      // Get existing card data
      const encryptedCard = localStorage.getItem('encryptedCard');
      if (!encryptedCard) {
        throw new Error('No card data found');
      }
      
      // Decrypt card data
      const decryptedCardData = CryptoJS.AES.decrypt(encryptedCard, password).toString(CryptoJS.enc.Utf8);
      if (!decryptedCardData) {
        throw new Error('Failed to decrypt card data');
      }
      
      const cardData = JSON.parse(decryptedCardData);
      
      // Update card balance
      const updatedCard = {
        ...cardData,
        balance: (parseFloat(cardData.balance) || 0) + amount
      };
      
      // Encrypt and store updated card data
      const updatedEncryptedCard = CryptoJS.AES.encrypt(
        JSON.stringify(updatedCard), 
        password
      ).toString();
      
      localStorage.setItem('encryptedCard', updatedEncryptedCard);
      
      return updatedCard;
    } catch (error) {
      throw new Error(`Card top-up failed: ${(error as Error).message}`);
    }
  }
}
