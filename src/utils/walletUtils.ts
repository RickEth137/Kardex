import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains'; // Changed from sepolia to mainnet

// Use the mainnet Infura endpoint
const rpcUrl = 'https://mainnet.infura.io/v3/e1e551858f45457d8f1250cf09d3ba59';

const client = createPublicClient({ chain: mainnet, transport: http(rpcUrl) });

export class WalletUtils {
  static generateMnemonic(): string {
    return ethers.Wallet.createRandom().mnemonic?.phrase || '';
  }

  // Update the getWalletFromMnemonic method to store both private key and mnemonic

  static async getWalletFromMnemonic(mnemonic: string, password: string): Promise<string> {
    try {
      const wallet = ethers.Wallet.fromPhrase(mnemonic);
      
      // Store the private key
      const encryptedKey = CryptoJS.AES.encrypt(wallet.privateKey, password).toString();
      localStorage.setItem('encryptedKey', encryptedKey);
      
      // Also store the mnemonic phrase
      const encryptedMnemonic = CryptoJS.AES.encrypt(mnemonic, password).toString();
      localStorage.setItem('encryptedMnemonic', encryptedMnemonic);
      
      // Store the address
      localStorage.setItem('walletAddress', wallet.address);
      
      return wallet.address;
    } catch (error) {
      throw new Error('Wallet creation failed: ' + (error as Error).message);
    }
  }

  static async getBalance(address: string): Promise<string> {
    const balance = await client.getBalance({ address: address as `0x${string}` });
    return ethers.formatEther(balance);
  }

  /**
   * Estimate transaction fee for sending ETH
   */
  static async estimateTransactionFee(toAddress: string, amount: string): Promise<string> {
    try {
      if (!toAddress || !amount || toAddress.trim() === '' || amount.trim() === '0') {
        return '0.0000';
      }

      // Get provider - make sure to use the same provider as in your other methods
      const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
      
      // Get current gas price
      const gasPrice = await provider.getFeeData();
      
      // Standard gas limit for ETH transfers is 21000
      const gasLimit = 21000n;
      
      // Calculate the fee based on gasPrice
      let fee;
      if (gasPrice.maxFeePerGas) {
        // EIP-1559 style fee
        fee = (gasPrice.maxFeePerGas * gasLimit);
      } else if (gasPrice.gasPrice) {
        // Legacy style fee
        fee = (gasPrice.gasPrice * gasLimit);
      } else {
        // Fallback
        fee = BigInt(3000000000) * gasLimit; // 3 gwei as fallback
      }
      
      // Convert the fee from wei to ETH (1 ETH = 10^18 wei)
      const feeInEth = ethers.formatEther(fee);
      
      // Return fee with 6 decimal places
      return parseFloat(feeInEth).toFixed(6);
    } catch (error) {
      console.error('Error estimating fee:', error);
      return '0.0001'; // Return a default fee value if estimation fails
    }
  }

  /**
   * Get mnemonic phrase (seed phrase) with password
   */
  static async getMnemonic(password: string): Promise<string> {
    try {
      // Try to get the encrypted mnemonic first
      const encryptedMnemonic = localStorage.getItem('encryptedMnemonic');
      
      if (encryptedMnemonic) {
        // If we have a stored mnemonic, decrypt and return it
        const decryptedMnemonic = CryptoJS.AES.decrypt(encryptedMnemonic, password).toString(CryptoJS.enc.Utf8);
        
        if (!decryptedMnemonic) {
          throw new Error('Invalid password');
        }
        
        return decryptedMnemonic;
      } else {
        // For backwards compatibility - check if we have the old format
        const encryptedKey = localStorage.getItem('encryptedKey');
        if (!encryptedKey) {
          throw new Error('No encrypted key found');
        }
        
        // Decrypt the key
        const decrypted = CryptoJS.AES.decrypt(encryptedKey, password).toString(CryptoJS.enc.Utf8);
        
        if (!decrypted) {
          throw new Error('Invalid password');
        }
        
        // Check if it's a mnemonic or a private key
        if (decrypted.split(' ').length >= 12) {
          return decrypted; // It's already a mnemonic
        } else {
          throw new Error('No seed phrase found. Your wallet was created with a private key.');
        }
      }
    } catch (error) {
      throw new Error('Failed to decrypt seed phrase: ' + (error as Error).message);
    }
  }

  // Version for ethers.js v5

  /**
   * Get private key with password
   */
  static async getPrivateKey(password: string): Promise<string> {
    try {
      const encryptedKey = localStorage.getItem('encryptedKey');
      if (!encryptedKey) {
        throw new Error('No encrypted key found');
      }
      
      // Decrypt the key
      const decrypted = CryptoJS.AES.decrypt(encryptedKey, password).toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Invalid password');
      }
      
      // Check if it's a mnemonic or a private key
      if (decrypted.split(' ').length >= 12) {
        // Use ethers.js v6 method to create a wallet from mnemonic
        const wallet = ethers.Wallet.fromPhrase(decrypted);
        return wallet.privateKey;
      } else {
        // It's already a private key
        return decrypted;
      }
    } catch (error) {
      throw new Error('Failed to decrypt private key: Invalid password');
    }
  }

  // Send transaction
  static async sendTransaction(to: string, value: string, password: string): Promise<string> {
    try {
      const privateKey = await this.getPrivateKey(password);
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);
      
      const tx = await wallet.sendTransaction({
        to: to,
        value: ethers.parseEther(value)
      });
      
      return tx.hash;
    } catch (error) {
      throw new Error('Transaction failed: ' + (error as Error).message);
    }
  }
}

// Function to get transaction history for an address
export const getTxHistory = async (address: string) => {
  try {
    // Using Etherscan API for this example
    // In production, you should use your own API key
    const apiKey = 'YourEtherscanApiKey'; // Replace with your API key or use env variable
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === '1') {
      return data.result.slice(0, 10).map(tx => ({
        hash: tx.hash,
        timestamp: parseInt(tx.timeStamp),
        from: tx.from,
        to: tx.to,
        value: tx.value,
        isOutgoing: tx.from.toLowerCase() === address.toLowerCase()
      }));
    } else {
      throw new Error(data.message || 'Failed to fetch transaction history');
    }
  } catch (error) {
    console.error('Error in getTxHistory:', error);
    return [];
  }
};
