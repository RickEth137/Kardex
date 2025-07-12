# Kardex - Crypto Virtual Card Extension

A Chrome extension that enables users to create virtual cards funded with cryptocurrency (USDC).

## 🚀 Features

- **Real USDC Integration**: Check actual wallet balances on Ethereum mainnet
- **Virtual Card Creation**: Generate professional Visa cards instantly
- **Secure Wallet Management**: Encrypted private key storage
- **Professional UI**: Clean, modern interface
- **Transaction History**: View wallet transactions
- **Card Management**: Top-up, view details, and manage cards
- **Cross-platform**: Works as Chrome extension

## 💳 How It Works

1. **Create/Import Wallet**: Generate new wallet or import existing seed phrase
2. **Fund with USDC**: Ensure your wallet has USDC balance
3. **Create Virtual Card**: Convert USDC to spendable virtual card
4. **Use Anywhere**: Use your virtual card for online purchases

## 🛠 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Blockchain**: Ethers.js for Ethereum integration
- **Encryption**: CryptoJS for secure data storage
- **Card Generation**: Custom Luhn algorithm validation
- **API Integration**: Circle API ready (optional)

## 📦 Installation

### For Users
1. Download the extension from Chrome Web Store (coming soon)
2. Install and create your wallet
3. Fund with USDC and create cards

### For Developers
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/kardex.git
cd kardex

# Install dependencies
npm install

# Build extension
npm run build

# Load in Chrome
# 1. Open Chrome Extensions (chrome://extensions/)
# 2. Enable Developer Mode
# 3. Click "Load Unpacked" and select the 'dist' folder
```

## 🔧 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 🔐 Security Features

- **Client-side encryption**: Private keys never leave your device
- **Password protection**: All sensitive data encrypted with user password
- **No external dependencies**: Core functionality works offline
- **Secure card generation**: Proper Luhn validation for card numbers

## 🌐 Supported Networks

- **Ethereum Mainnet**: USDC balance checking and transactions
- **USDC Contract**: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`

## 📋 Requirements

- Chrome browser (version 88+)
- USDC balance in Ethereum wallet
- Internet connection for blockchain queries

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. Always keep backups of your seed phrases and private keys.

## 🙋‍♂️ Support

- Create an issue for bug reports
- Join our Discord for community support
- Email: support@kardex.crypto

---

**Built with ❤️ for the crypto community**
