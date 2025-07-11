import axios from 'axios';

// Define interface for CoinGecko API response
interface CoinGeckoResponse {
  ethereum?: {
    usd?: number;
  };
}

export class PriceUtils {
  private static priceCache: { [key: string]: { price: number, timestamp: number } } = {};
  private static CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
  
  /**
   * Get ETH price in USD using a more reliable API (CoinGecko)
   */
  static async getEthPrice(): Promise<number> {
    // Check cache first
    if (this.priceCache['ETH'] && 
        (Date.now() - this.priceCache['ETH'].timestamp) < this.CACHE_DURATION) {
      return this.priceCache['ETH'].price;
    }
    
    try {
      // Use CoinGecko API which is more reliable than DexScreener
      const response = await axios.get<CoinGeckoResponse>('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      
      if (response.data?.ethereum?.usd) {
        const priceUsd = response.data.ethereum.usd;
        
        // Update cache
        this.priceCache['ETH'] = {
          price: priceUsd,
          timestamp: Date.now()
        };
        
        return priceUsd;
      }
      
      throw new Error('Could not get price data');
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      // If request fails but we have a cached price (even if expired), use it
      if (this.priceCache['ETH']) {
        return this.priceCache['ETH'].price;
      }
      // Fallback price if API fails and no cache
      return 3000; // A more recent estimate
    }
  }
  
  /**
   * Get token price in USD
   * @param tokenAddress The contract address of the token
   */
  static async getTokenPrice(tokenAddress: string): Promise<number> {
    // For USDC, hardcode to 1 as it's a stablecoin
    if (tokenAddress.toLowerCase() === '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48') {
      return 1.0;
    }
    
    // Check cache first
    if (this.priceCache[tokenAddress] && 
        (Date.now() - this.priceCache[tokenAddress].timestamp) < this.CACHE_DURATION) {
      return this.priceCache[tokenAddress].price;
    }
    
    try {
      // For other tokens, we'd implement a lookup, but for now we're just using USDC
      return 1.0;
    } catch (error) {
      console.error(`Error fetching price for ${tokenAddress}:`, error);
      return 1.0;
    }
  }
  
  /**
   * Format USD value with proper commas and decimals
   */
  static formatUSD(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
}