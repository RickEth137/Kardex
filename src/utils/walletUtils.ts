import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const rpcUrl = 'https://mainnet.infura.io/v3/e1e551858f45457d8f1250cf09d3ba59';
const client = createPublicClient({ chain: mainnet, transport: http(rpcUrl) });

const USDC_CONTRACT_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDC_DECIMALS = 6;

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

export class WalletUtils {
  static generateMnemonic(): string {
    return ethers.Wallet.createRandom().mnemonic?.phrase || '';
  }

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

  static async getUSDCBalance(address: string): Promise<string> {
    try {
      console.log("Checking USDC balance for address:", address);
      console.log("Using USDC contract:", USDC_CONTRACT_ADDRESS);
      
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, provider);
      
      const balance = await contract.balanceOf(address);
      console.log("Raw USDC balance:", balance.toString());
      
      // Convert from USDC units (6 decimals) to human readable
      const formattedBalance = ethers.formatUnits(balance, USDC_DECIMALS);
      console.log("Formatted USDC balance:", formattedBalance);
      
      return formattedBalance;
    } catch (error) {
      console.error('Error getting USDC balance:', error);
      return '0';
    }
  }

  static async estimateTransactionFee(toAddress: string, amount: string): Promise<string> {
    try {
      if (!toAddress || !amount || toAddress.trim() === '' || amount.trim() === '0') {
        return '0.0000';
      }

      const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
      const gasPrice = await provider.getFeeData();
      const gasLimit = 21000n;
      
      let fee;
      if (gasPrice.maxFeePerGas) {
        fee = (gasPrice.maxFeePerGas * gasLimit);
      } else if (gasPrice.gasPrice) {
        fee = (gasPrice.gasPrice * gasLimit);
      } else {
        fee = BigInt(3000000000) * gasLimit;
      }
      
      const feeInEth = ethers.formatEther(fee);
      return parseFloat(feeInEth).toFixed(6);
    } catch (error) {
      console.error('Error estimating fee:', error);
      return '0.0001';
    }
  }

  static async getMnemonic(password: string): Promise<string> {
    try {
      const encryptedMnemonic = localStorage.getItem('encryptedMnemonic');
      
      if (encryptedMnemonic) {
        const decryptedMnemonic = CryptoJS.AES.decrypt(encryptedMnemonic, password).toString(CryptoJS.enc.Utf8);
        
        if (!decryptedMnemonic) {
          throw new Error('Invalid password');
        }
        
        return decryptedMnemonic;
      } else {
        const encryptedKey = localStorage.getItem('encryptedKey');
        if (!encryptedKey) {
          throw new Error('No encrypted key found');
        }
        
        const decrypted = CryptoJS.AES.decrypt(encryptedKey, password).toString(CryptoJS.enc.Utf8);
        
        if (!decrypted) {
          throw new Error('Invalid password');
        }
        
        if (decrypted.split(' ').length >= 12) {
          return decrypted;
        } else {
          throw new Error('No seed phrase found. Your wallet was created with a private key.');
        }
      }
    } catch (error) {
      throw new Error('Failed to decrypt seed phrase: ' + (error as Error).message);
    }
  }

  static async getPrivateKey(password: string): Promise<string> {
    try {
      const encryptedKey = localStorage.getItem('encryptedKey');
      if (!encryptedKey) {
        throw new Error('No encrypted key found');
      }
      
      const decrypted = CryptoJS.AES.decrypt(encryptedKey, password).toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Invalid password');
      }
      
      if (decrypted.split(' ').length >= 12) {
        const wallet = ethers.Wallet.fromPhrase(decrypted);
        return wallet.privateKey;
      } else {
        return decrypted;
      }
    } catch (error) {
      throw new Error('Failed to decrypt private key: Invalid password');
    }
  }

  static getAddressFromPrivateKey(privateKey: string): string {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.address;
  }

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

// Export additional functions
export const getTxHistory = async (address: string) => {
  try {
    const apiKey = 'YourEtherscanApiKey';
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === '1') {
      return data.result.slice(0, 10).map((tx: any) => ({
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

export const purchaseCard = async (cardData: any, _contractAddress: string, _contractABI: any, _signerOrProvider?: any) => {
  try {
    console.log("Purchasing card with data:", cardData);
    return { success: true, data: cardData };
  } catch (error) {
    console.error("Card purchase error:", error);
    throw error;
  }
};

export const debugWallet = async () => {
  console.log("Debug wallet function called");
};

export const purchaseCardWithStoredWallet = async (
  cardData: any, 
  _contractAddress: string, 
  _contractABI: any, 
  _password: string
) => {
  try {
    console.log("Purchasing card with stored wallet");
    return { success: true, data: cardData };
  } catch (error) {
    throw error;
  }
};

export const debugCardPurchase = async (_password: string) => {
  console.log("Debug card purchase with password");
};

export const topUpCard = async (cardData: any, amount: string, _password: string) => {
  try {
    console.log("Topping up card:", cardData, "with amount:", amount);
    return { success: true, newBalance: parseFloat(cardData.balance) + parseFloat(amount) };
  } catch (error) {
    throw new Error(`Card top-up failed: ${(error as Error).message}`);
  }
};
