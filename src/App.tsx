import { useState, useEffect } from 'react';
import { WalletUtils } from './utils/walletUtils';
import { CardUtils } from './utils/cardUtils';
import { PriceUtils } from './utils/priceUtils';
import CreditCard from 'react-credit-cards-2';
import { QRCodeCanvas } from 'qrcode.react';
import './App.css';
import './credit-card-styles.css';

function App() {
  // Animation state
  const [showIntro, setShowIntro] = useState(true);
  
  // User state
  const [setupComplete, setSetupComplete] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mnemonic, setMnemonic] = useState('');

  // Wallet state
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [ethPrice, setEthPrice] = useState(0);
  const [ethValue, setEthValue] = useState('$0.00');
  
  // Card state
  const [card, setCard] = useState<any>(null);
  
  // USDC price state
  const [usdcPrice, setUsdcPrice] = useState(1.0); 
  
  // UI state
  const [activeTab, setActiveTab] = useState('wallet');
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState('');
  const [setupStage, setSetupStage] = useState('welcome');
  const [importMode, setImportMode] = useState(false);
  const [importMnemonic, setImportMnemonic] = useState('');
  
  // Modal state
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendFee, setSendFee] = useState('0.0001');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [transactionPassword, setTransactionPassword] = useState('');
  const [pendingTransaction, setPendingTransaction] = useState<{
    to: string; // Now can also be "REVEAL_SEED" or "REVEAL_KEY"
    value: string;
  } | null>(null);

  // Add state to store revealed data and modal visibility
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [revealedData, setRevealedData] = useState('');

  // Top-up state
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(25);

  // Add these state variables after the existing useState declarations (around line 30):
  const [cardFormData, setCardFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    value: 15,
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  // Check if user already has a wallet and handle intro animation
  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress');
    
    if (savedAddress) {
      setShowIntro(false);
      setAddress(savedAddress);
      setSetupComplete(true);
      fetchBalance(savedAddress);
    } else {
      const introTimer = setTimeout(() => {
        setShowIntro(false);
      }, 3000);
      
      return () => clearTimeout(introTimer);
    }
  }, []);
  
  // Fetch price data
  useEffect(() => {
    const fetchUsdcPrice = async () => {
      try {
        const price = await PriceUtils.getTokenPrice('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
        setUsdcPrice(price);
      } catch (error) {
        console.error('Error fetching USDC price:', error);
        setUsdcPrice(1.0);
      }
    };
    
    fetchUsdcPrice();
  }, []);

  // Fetch ETH price
  useEffect(() => {
    const fetchEthPrice = async () => {
      if (balance) {
        try {
          const price = await PriceUtils.getEthPrice();
          setEthPrice(price);
          const balanceNum = parseFloat(balance);
          const value = balanceNum * price;
          setEthValue(PriceUtils.formatUSD(value));
        } catch (error) {
          console.error('Error fetching ETH price:', error);
        }
      } else {
        setEthPrice(0);
        setEthValue('$0.00');
      }
    };
    
    fetchEthPrice();
  }, [balance]);

  // Add or update this useEffect to estimate transaction fees when sending ETH
  useEffect(() => {
    const estimateFee = async () => {
      if (showSendModal && sendAddress && sendAmount) {
        try {
          const fee = await WalletUtils.estimateTransactionFee(sendAddress, sendAmount);
          setSendFee(fee);
        } catch (error) {
          console.error('Error estimating fee:', error);
          setSendFee('0.0001');
        }
      }
    };
    
    estimateFee();
  }, [showSendModal, sendAddress, sendAmount]);

  // Helper functions
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification(message);
    setNotificationType(type);
    setTimeout(() => {
      setNotification('');
    }, 3000);
  };

  const createWallet = async () => {
    if (!password) {
      return showNotification('Please enter a password', 'error');
    }
    
    if (password !== confirmPassword) {
      return showNotification('Passwords do not match', 'error');
    }
    
    try {
      const phrase = WalletUtils.generateMnemonic();
      setMnemonic(phrase);
      setSetupStage('mnemonic');
    } catch (error) {
      showNotification((error as Error).message, 'error');
    }
  };
  
  const confirmMnemonic = async () => {
    try {
      const addr = await WalletUtils.getWalletFromMnemonic(mnemonic, password);
      setAddress(addr);
      setSetupComplete(true);
      showNotification('Wallet created successfully!', 'success');
      fetchBalance(addr);
    } catch (error) {
      showNotification((error as Error).message, 'error');
    }
  };
  
  const importWallet = async () => {
    if (!password || !importMnemonic) {
      return showNotification('Please enter both password and seed phrase', 'error');
    }
    
    if (password !== confirmPassword) {
      return showNotification('Passwords do not match', 'error');
    }
    
    try {
      const addr = await WalletUtils.getWalletFromMnemonic(importMnemonic, password);
      setAddress(addr);
      setSetupComplete(true);
      showNotification('Wallet imported successfully!', 'success');
      fetchBalance(addr);
    } catch (error) {
      showNotification('Invalid seed phrase. Please check and try again.', 'error');
    }
  };

  const fetchBalance = async (walletAddress: string = address) => {
    if (!walletAddress) return;
    
    try {
      const bal = await WalletUtils.getBalance(walletAddress);
      setBalance(bal);
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  };

  const handleReceiveClick = () => {
    setShowReceiveModal(true);
  };

  const handleSendTransaction = async () => {
    if (!sendAddress || !sendAmount) {
      return showNotification('Please fill in all fields', 'error');
    }
    
    if (!sendAddress.startsWith('0x') || sendAddress.length !== 42) {
      return showNotification('Invalid Ethereum address', 'error');
    }
    
    const amountNum = parseFloat(sendAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return showNotification('Invalid amount', 'error');
    }
    
    const balanceNum = parseFloat(balance);
    if (amountNum > balanceNum) {
      return showNotification('Insufficient balance', 'error');
    }
    
    setPendingTransaction({
      to: sendAddress,
      value: sendAmount
    });
    setShowPasswordModal(true);
  };

  // Update the confirmTransaction function to handle card top-ups

  const confirmTransaction = async () => {
    if (!pendingTransaction || !transactionPassword) {
      return;
    }
    
    try {
      setIsSending(true);
      
      // Handle card creation
      if (pendingTransaction.to === "CARD_CREATION") {
        const apiKeyToUse = "LIVE_API_KEY:50415ff0f56236badcc426fac91d1ad6:71e1937ccddd75338068067c8fe73e42";
        const apiSecretToUse = ""; // Not needed with full API key
        
        const newCard = await CardUtils.purchaseVirtualCard(
          cardFormData.value, 
          'USDC', 
          apiKeyToUse, 
          apiSecretToUse, 
          cardFormData.email, 
          transactionPassword,
          cardFormData.firstName,
          cardFormData.lastName,
          cardFormData.mobile
        );
        
        setCard(newCard);
        showNotification('Card created and funded!', 'success');
      }
      // Handle card top-up
      else if (pendingTransaction.to === "CARD_TOPUP") {
        if (!card || !card.id) {
          throw new Error('Card not found');
        }
        
        const apiKeyToUse = "LIVE_API_KEY:50415ff0f56236badcc426fac91d1ad6:71e1937ccddd75338068067c8fe73e42";
        const apiSecretToUse = ""; // Not needed with full API key
        
        const updatedCard = await CardUtils.topUpCard(
          card.id,
          parseFloat(pendingTransaction.value),
          'USDC',
          apiKeyToUse,
          apiSecretToUse,
          transactionPassword
        );
        
        setCard(updatedCard);
        showNotification('Card topped up successfully!', 'success');
      }
      // Handle card loading
      else if (pendingTransaction.to === "LOAD_CARD") {
        const stored = await CardUtils.getStoredCard(transactionPassword);
        if (stored) {
          setCard(stored);
          showNotification('Card loaded!', 'success');
        } else {
          showNotification('No stored card found.', 'info');
        }
      }
      // Handle seed phrase reveal
      else if (pendingTransaction.to === "REVEAL_SEED") {
        const mnemonic = await WalletUtils.getMnemonic(transactionPassword);
        setRevealedData(mnemonic);
        setShowRevealModal(true);
      }
      // Handle private key reveal
      else if (pendingTransaction.to === "REVEAL_KEY") {
        const privateKey = await WalletUtils.getPrivateKey(transactionPassword);
        setRevealedData(privateKey);
        setShowRevealModal(true);
      }
      // Handle normal transaction
      else {
        const txHash = await WalletUtils.sendTransaction(
          pendingTransaction.to,
          pendingTransaction.value,
          transactionPassword
        );
        
        showNotification(`Transaction sent! Hash: ${txHash.substring(0, 10)}...`, 'success');
        setShowSendModal(false);
        setSendAmount('');
        setSendAddress('');
        
        // Fetch updated balance after a short delay
        setTimeout(() => fetchBalance(), 3000);
      }
      
      setShowPasswordModal(false);
      setTransactionPassword('');
      // Don't reset pendingTransaction for REVEAL operations since we need it for the reveal modal
      if (pendingTransaction.to !== "REVEAL_SEED" && pendingTransaction.to !== "REVEAL_KEY") {
        setPendingTransaction(null);
      }
    } catch (error) {
      showNotification(`Operation failed: ${(error as Error).message}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Add functions to handle the reveal requests
  const handleRevealSeedPhrase = () => {
    setPendingTransaction({
      to: "REVEAL_SEED",
      value: ""
    });
    setShowPasswordModal(true);
  };

  const handleRevealPrivateKey = () => {
    setPendingTransaction({
      to: "REVEAL_KEY",
      value: ""
    });
    setShowPasswordModal(true);
  };

  // Add function to close the reveal modal
  const handleCloseReveal = () => {
    setShowRevealModal(false);
    setPendingTransaction(null);
    setRevealedData('');
  };

  // Handle top-up card
  const handleTopUpCard = () => {
    if (topUpAmount < 10) {
      return showNotification('Minimum top-up amount is $10', 'error');
    }
    
    // Close the top-up modal
    setShowTopUpModal(false);
    
    // Open the password modal with the CARD_TOPUP transaction type
    setPendingTransaction({
      to: "CARD_TOPUP",
      value: topUpAmount.toString()
    });
    setShowPasswordModal(true);
  };

  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  // Add this function after the existing functions (around line 400, after handleTopUpCard):
  const handleCreateCard = async () => {
    if (!cardFormData.firstName || !cardFormData.lastName || !cardFormData.email || !cardFormData.mobile || !cardFormData.password) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    // Validate mobile number format
    if (!cardFormData.mobile.startsWith('+')) {
      showNotification('Mobile number must include country code (e.g., +1234567890)', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Try real API first, fall back to mock if it fails
      try {
        const apiKeyToUse = "LIVE_API_KEY:50415ff0f56236badcc426fac91d1ad6:71e1937ccddd75338068067c8fe73e42";
        const apiSecretToUse = ""; // Not needed with full API key
        
        const newCard = await CardUtils.purchaseVirtualCard(
          cardFormData.value,
          'USDC',
          apiKeyToUse,
          apiSecretToUse,
          cardFormData.email,
          cardFormData.password,
          cardFormData.firstName,
          cardFormData.lastName,
          cardFormData.mobile
        );
        
        setCard(newCard);
        showNotification('Card created successfully!', 'success');
      } catch (apiError) {
        console.log("API failed, creating mock card...");
        
        // Create mock card as fallback
        const mockCard = await CardUtils.createMockCard(
          cardFormData.value,
          cardFormData.email,
          cardFormData.password,
          cardFormData.firstName,
          cardFormData.lastName,
          cardFormData.mobile
        );
        
        setCard(mockCard);
        showNotification('Demo card created successfully! (API unavailable)', 'success');
      }
      
      // Reset form
      setCardFormData({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        value: 15,
        password: ''
      });
      
    } catch (error) {
      showNotification(`Operation failed: ${(error as Error).message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      {/* Intro Animation */}
      {showIntro && (
        <div className="intro-container">
          <div className="logo-container">
            <img src="icons/icon128.png" alt="Kardex Logo" className="logo-large" />
            <h1>Kardex</h1>
          </div>
        </div>
      )}

      {/* Main App Interface */}
      {!showIntro && (
        <div className="app-container fade-in">
          {/* Notification */}
          {notification && (
            <div className={`notification ${notificationType}`}>{notification}</div>
          )}

          {/* Setup Screens */}
          {!setupComplete ? (
            <div className="setup-container">
              {setupStage === 'welcome' && (
                <div className="setup-content">
                  <img src="icons/icon128.png" alt="Kardex" className="setup-logo" />
                  <h2>Welcome to Kardex</h2>
                  <p className="setup-description">
                    Your secure crypto wallet and virtual card solution
                  </p>
                  
                  <div className="setup-buttons">
                    <button 
                      className="primary-button" 
                      onClick={() => {
                        setSetupStage('create');
                        setImportMode(false);
                      }}
                    >
                      Create New Wallet
                    </button>
                    <button 
                      className="secondary-button" 
                      onClick={() => {
                        setSetupStage('create');
                        setImportMode(true);
                      }}
                    >
                      Import Existing Wallet
                    </button>
                  </div>
                  
                  <div className="legal-links">
                    <a href="https://kardex.io/privacy" target="_blank" rel="noopener noreferrer">
                      Privacy Policy
                    </a>
                    <span className="separator">•</span>
                    <a href="https://kardex.io/terms" target="_blank" rel="noopener noreferrer">
                      Terms of Service
                    </a>
                  </div>
                </div>
              )}
              
              {setupStage === 'create' && (
                <div className="setup-content">
                  <h2>{importMode ? 'Import Wallet' : 'Create New Wallet'}</h2>
                  <p className="setup-description">
                    {importMode 
                      ? 'Enter your existing seed phrase and create a password' 
                      : 'Create a password to secure your wallet'}
                  </p>
                  
                  {importMode && (
                    <div className="form-group">
                      <label>Seed Phrase</label>
                      <textarea 
                        className="text-input textarea"
                        placeholder="Enter your 12-word seed phrase"
                        value={importMnemonic}
                        onChange={(e) => setImportMnemonic(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label>Password</label>
                    <input 
                      type="password"
                      className="text-input"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input 
                      type="password"
                      className="text-input"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="setup-buttons">
                    <button 
                      className="primary-button"
                      onClick={() => importMode ? importWallet() : createWallet()}
                    >
                      {importMode ? 'Import Wallet' : 'Create Wallet'}
                    </button>
                    <button 
                      className="secondary-button"
                      onClick={() => setSetupStage('welcome')}
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
              
              {setupStage === 'mnemonic' && (
                <div className="setup-content">
                  <h2>Backup Your Wallet</h2>
                  <p className="setup-description warning">
                    Write down these words in order and keep them safe. Anyone with this seed phrase can access your funds.
                  </p>
                  
                  <div className="mnemonic-container">
                    {mnemonic.split(' ').map((word, idx) => (
                      <div key={idx} className="mnemonic-word">
                        <span className="mnemonic-number">{idx + 1}.</span> {word}
                      </div>
                    ))}
                  </div>
                  
                  <div className="setup-buttons">
                    <button 
                      className="primary-button"
                      onClick={confirmMnemonic}
                    >
                      I've Saved My Seed Phrase
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <header className="header">
                <div className="header-left">
                  <img src="icons/icon48.png" alt="Kardex" className="logo" />
                  <div 
                    className="logo" 
                    onClick={() => setShowLogoutMenu(!showLogoutMenu)}
                  >
                    <span className="k-logo">K</span> Kardex
                  </div>
                </div>
                <div className="header-right">
                  <div className="wallet-badge">
                    {address.substring(0, 6)}...{address.substring(address.length - 4)}
                  </div>
                </div>
              </header>
              
              {showLogoutMenu && (
                <div className="logout-modal-overlay">
                  <div className="logout-modal">
                    <div className="logout-modal-header">
                      <h3>Confirm Logout</h3>
                      <button 
                        className="close-button"
                        onClick={() => setShowLogoutMenu(false)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="logout-modal-body">
                      <p>Are you sure you want to log out?</p>
                      <div className="logout-actions">
                        <button 
                          className="cancel-button"
                          onClick={() => setShowLogoutMenu(false)}
                        >
                          Cancel
                        </button>
                        <button 
                          className="logout-button"
                          onClick={() => {
                            // Add your logout logic here
                            console.log("Logging out...");
                            // Example: Clear token from localStorage
                            localStorage.removeItem("auth_token");
                            // Redirect to login page or reset app state
                            window.location.href = "/login";
                          }}
                        >
                          Log Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Tab Navigation */}
              <div className="tab-navigation">
                <button 
                  className={activeTab === 'wallet' ? 'active' : ''} 
                  onClick={() => setActiveTab('wallet')}
                >
                  Wallet
                </button>
                <button 
                  className={activeTab === 'card' ? 'active' : ''} 
                  onClick={() => setActiveTab('card')}
                >
                  Card
                </button>
                <button 
                  className={activeTab === 'settings' ? 'active' : ''} 
                  onClick={() => setActiveTab('settings')}
                >
                  Settings
                </button>
              </div>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === 'wallet' && (
                  <>
                    <div className="balance-container">
                      <div className="balance-label">Total Balance</div>
                      <div className="balance-amount">{balance || '0.00'} ETH</div>
                      <div className="balance-usd">
                        {ethValue} • Ethereum Mainnet
                      </div>
                      {ethPrice > 0 && (
                        <div className="price-badge">
                          1 ETH = {PriceUtils.formatUSD(ethPrice)}
                        </div>
                      )}
                    </div>
                    
                    <div className="wallet-actions">
                      <button className="action-button" onClick={() => fetchBalance()}>
                        <span className="action-icon">↻</span>
                        Refresh
                      </button>
                      <button className="action-button" onClick={handleReceiveClick}>
                        <span className="action-icon">↓</span>
                        Receive
                      </button>
                      <button className="action-button" onClick={() => setShowSendModal(true)}>
                        <span className="action-icon">↑</span>
                        Send
                      </button>
                    </div>
                  </>
                )}
                
                {activeTab === 'card' && (
                  <>
                    {card ? (
                      <div className="card-display">
                        <CreditCard
                          number={card.number || "•••• •••• •••• ••••"}
                          name={card.name || "KARDEX USER"}
                          expiry={card.expiry || "••/••"}
                          cvc={card.cvc || "•••"}
                          focused="number"
                        />
                        
                        <div className="card-info">
                          <div className="card-details">
                            <div className="card-detail">
                              <span>Status:</span> Active
                            </div>
                            <div className="card-detail">
                              <span>Balance:</span> {card.balance} USDC ({PriceUtils.formatUSD(card.balance * usdcPrice)})
                            </div>
                          </div>
                          
                          {/* Add Top Up button */}
                          <button 
                            className="primary-button top-up-button"
                            onClick={() => setShowTopUpModal(true)}
                          >
                            Top Up Card
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="card-creation">
                        <div className="section-header">
                          <h3>Create Virtual Card</h3>
                        </div>
                        
                        <div className="card-creation-form">
                          <h3>Create Virtual Card</h3>
                          
                          <input
                            type="text"
                            placeholder="First Name"
                            value={cardFormData.firstName}
                            onChange={(e) => setCardFormData({...cardFormData, firstName: e.target.value})}
                            required
                          />
                          
                          <input
                            type="text"
                            placeholder="Last Name"
                            value={cardFormData.lastName}
                            onChange={(e) => setCardFormData({...cardFormData, lastName: e.target.value})}
                            required
                          />
                          
                          <input
                            type="email"
                            placeholder="Email Address"
                            value={cardFormData.email}
                            onChange={(e) => setCardFormData({...cardFormData, email: e.target.value})}
                            required
                          />
                          
                          <input
                            type="tel"
                            placeholder="Mobile Number (e.g., +1234567890)"
                            value={cardFormData.mobile}
                            onChange={(e) => setCardFormData({...cardFormData, mobile: e.target.value})}
                            required
                          />
                          
                          <input
                            type="number"
                            placeholder="Card Value (USD)"
                            value={cardFormData.value}
                            onChange={(e) => setCardFormData({...cardFormData, value: parseInt(e.target.value)})}
                            min="1"
                            required
                          />
                          
                          <input
                            type="password"
                            placeholder="Wallet Password"
                            value={cardFormData.password}
                            onChange={(e) => setCardFormData({...cardFormData, password: e.target.value})}
                            required
                          />
                          
                          <button onClick={handleCreateCard} disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Card'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {activeTab === 'settings' && (
                  <>
                    <div className="address-section">
                      <div className="section-header">
                        <h3>Wallet Address</h3>
                      </div>
                      <div className="address-content">
                        <div className="address-text">
                          <div className="address-value">{address}</div>
                          <button 
                            className="copy-button"
                            onClick={() => {
                              navigator.clipboard.writeText(address);
                              showNotification('Address copied to clipboard!', 'success');
                            }}
                          >
                            Copy Address
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="security-section">
                      <div className="section-header">
                        <h3>Security</h3>
                      </div>
                      <p className="security-warning">
                        Only reveal your seed phrase or private key in a secure environment. 
                        Anyone with access to this information can control your funds.
                      </p>
                      <div className="security-actions">
                        <button 
                          className="secondary-button security-button"
                          onClick={handleRevealSeedPhrase}
                        >
                          Reveal Seed Phrase
                        </button>
                        <button 
                          className="secondary-button security-button"
                          onClick={handleRevealPrivateKey}
                        >
                          Reveal Private Key
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Modals */}
              {showReceiveModal && (
                <div className="modal-overlay">
                  <div className="modal-container">
                    <div className="modal-header">
                      <h2>Receive ERC20</h2>
                      <button className="close-button" onClick={() => setShowReceiveModal(false)}>×</button>
                    </div>
                    
                    <div className="modal-content">
                      <div className="qr-container">
                        <QRCodeCanvas value={`ethereum:${address}`} size={130} />
                      </div>
                      
                      <div className="address-container">
                        <div className="address-value">{address}</div>
                      </div>
                      
                      <div className="copy-btn-container">
                        <button 
                          className="copy-button"
                          onClick={() => {
                            navigator.clipboard.writeText(address);
                            showNotification('Address copied to clipboard', 'success');
                          }}
                        >
                          Copy
                        </button>
                      </div>
                      
                      <div className="warning-message">
                        <p>Send only ERC20 tokens to this address. This wallet supports receiving any standard ERC20 token.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {showSendModal && (
                <div className="modal-overlay" onClick={() => !isSending && setShowSendModal(false)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3>Send ETH</h3>
                      {!isSending && (
                        <button className="modal-close" onClick={() => setShowSendModal(false)}>×</button>
                      )}
                    </div>
                    <div className="modal-body">
                      <div className="form-group">
                        <label>Recipient Address</label>
                        <input
                          className="text-input"
                          placeholder="0x..."
                          value={sendAddress}
                          onChange={(e) => setSendAddress(e.target.value)}
                          disabled={isSending}
                        />
                      </div>
                      <div className="form-group">
                        <label>Amount (ETH)</label>
                        <input
                          type="number"
                          className="text-input"
                          placeholder="0.0"
                          value={sendAmount}
                          onChange={(e) => setSendAmount(e.target.value)}
                          disabled={isSending}
                          step="0.001"
                          min="0"
                        />
                      </div>
                      
                      <div className="send-summary">
                        <div className="send-summary-item">
                          <span>Network Fee:</span>
                          <span>{sendFee} ETH</span>
                        </div>
                        <div className="send-summary-item">
                          <span>Total:</span>
                          <span>
                            {(parseFloat(sendAmount || '0') + parseFloat(sendFee)).toFixed(6)} ETH
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        className="primary-button send-button"
                        onClick={handleSendTransaction}
                        disabled={isSending || !sendAmount || !sendAddress}
                      >
                        {isSending ? 'Sending...' : 'Send Transaction'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {showPasswordModal && (
                <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-content password-modal">
                    <div className="modal-header">
                      <h3>
                        {pendingTransaction?.to === "CARD_CREATION" 
                          ? "Create Card" 
                          : pendingTransaction?.to === "LOAD_CARD"
                          ? "Load Card"
                          : "Confirm Transaction"}
                      </h3>
                      {!isSending && (
                        <button className="modal-close" onClick={() => {
                          setShowPasswordModal(false);
                          setPendingTransaction(null);
                          setTransactionPassword('');
                        }}>×</button>
                      )}
                    </div>
                    <div className="modal-body">
                      {pendingTransaction?.to === "CARD_CREATION" ? (
                        <p className="transaction-details">
                          You are creating a virtual card funded with <strong>${pendingTransaction?.value}</strong>
                        </p>
                      ) : pendingTransaction?.to === "CARD_TOPUP" ? (
                        <p className="transaction-details">
                          You are adding <strong>${pendingTransaction?.value}</strong> to your virtual card
                        </p>
                      ) : pendingTransaction?.to === "LOAD_CARD" ? (
                        <p className="transaction-details">
                          Enter your password to load your virtual card
                        </p>
                      ) : pendingTransaction?.to === "REVEAL_SEED" ? (
                        <p className="transaction-details">
                          You are revealing the seed phrase for wallet:<br/>
                          <strong>{address.substring(0, 6)}...{address.substring(address.length - 4)}</strong>
                        </p>
                      ) : pendingTransaction?.to === "REVEAL_KEY" ? (
                        <p className="transaction-details">
                          You are revealing the private key for wallet:<br/>
                          <strong>{address.substring(0, 6)}...{address.substring(address.length - 4)}</strong>
                        </p>
                      ) : (
                        <>
                          <p className="transaction-details">
                            You are sending <strong>{pendingTransaction?.value} ETH</strong> to:
                          </p>
                          <p className="transaction-address">{pendingTransaction?.to}</p>
                        </>
                      )}
                      
                      <div className="form-group">
                        <label>Enter your wallet password to confirm</label>
                        <input
                          type="password"
                          className="text-input"
                          placeholder="Password"
                          value={transactionPassword}
                          onChange={(e) => setTransactionPassword(e.target.value)}
                          disabled={isSending}
                          autoFocus
                        />
                      </div>
                      
                      <button 
                        className="primary-button send-button"
                        onClick={confirmTransaction}
                        disabled={isSending || !transactionPassword}
                      >
                        {isSending 
                          ? 'Processing...' 
                          : pendingTransaction?.to === "CARD_CREATION" 
                          ? 'Create Card' 
                          : pendingTransaction?.to === "CARD_TOPUP"
                          ? 'Top Up Card'
                          : pendingTransaction?.to === "LOAD_CARD"
                          ? 'Load Card'
                          : pendingTransaction?.to === "REVEAL_SEED"
                          ? 'Reveal Seed Phrase'
                          : pendingTransaction?.to === "REVEAL_KEY"
                          ? 'Reveal Private Key'
                          : 'Confirm & Send'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {showRevealModal && (
                <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-content reveal-modal">
                    <div className="modal-header">
                      <h3>{pendingTransaction?.to === "REVEAL_SEED" ? "Your Seed Phrase" : "Your Private Key"}</h3>
                      <button className="modal-close" onClick={handleCloseReveal}>×</button>
                    </div>
                    <div className="modal-body">
                      <p className="security-warning">
                        {pendingTransaction?.to === "REVEAL_SEED"
                          ? "Write down these words in order and keep them safe. Anyone with this seed phrase can access your funds."
                          : "This is your private key. Keep it secure and never share it with anyone."}
                      </p>
                      
                      {pendingTransaction?.to === "REVEAL_SEED" ? (
                        <div className="mnemonic-container">
                          {revealedData.split(' ').map((word, idx) => (
                            <div key={idx} className="mnemonic-word">
                              <span className="mnemonic-number">{idx + 1}.</span> {word}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="private-key-container">
                          <div className="private-key-text">{revealedData}</div>
                        </div>
                      )}
                      
                      <div className="reveal-actions">
                        <button 
                          className="primary-button"
                          onClick={() => {
                            navigator.clipboard.writeText(revealedData);
                            showNotification(
                              pendingTransaction?.to === "REVEAL_SEED" 
                                ? 'Seed phrase copied to clipboard!' 
                                : 'Private key copied to clipboard!', 
                              'success'
                            );
                          }}
                        >
                          Copy to Clipboard
                        </button>
                        <button 
                          className="secondary-button"
                          onClick={handleCloseReveal}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Top Up Modal */}
              {showTopUpModal && (
                <div className="modal-overlay" onClick={() => setShowTopUpModal(false)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3>Top Up Card</h3>
                      <button className="modal-close" onClick={() => setShowTopUpModal(false)}>×</button>
                    </div>
                    <div className="modal-body">
                      <p className="modal-description">
                        Add funds to your virtual card
                      </p>
                      
                      <div className="form-group">
                        <label>Amount (USD)</label>
                        <input
                          type="number"
                          className="text-input"
                          placeholder="Amount to add"
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(Number(e.target.value))}
                          min="10"
                        />
                      </div>
                      
                      <div className="card-balance-info">
                        <div className="balance-item">
                          <span>Current Balance:</span>
                          <span>{card?.balance} USDC ({PriceUtils.formatUSD(card?.balance * usdcPrice)})</span>
                        </div>
                        <div className="balance-item">
                          <span>New Balance:</span>
                          <span>{(card?.balance || 0) + topUpAmount} USDC ({PriceUtils.formatUSD(((card?.balance || 0) + topUpAmount) * usdcPrice)})</span>
                        </div>
                      </div>
                      
                      <button 
                        className="primary-button"
                        onClick={handleTopUpCard}
                        disabled={topUpAmount < 10}
                      >
                        Top Up Card
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Version info */}
          <div className="version-info">
            Version 1.0.0
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

<style>{`
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-container {
    background-color: #1e1e1e;
    width: 100%;
    max-width: 340px;
    border-radius: 18px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px;
    border-bottom: 1px solid #333;
    width: 100%;
  }
  
  .modal-header h2 {
    margin: 0;
    color: white;
    font-size: 20px;
    font-weight: 600;
  }
  
  .close-button {
    background: none;
    border: none;
    color: #999;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    height: 24px;
    width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .close-button:hover {
    color: #fff;
  }
  
  .modal-content {
    padding: 18px 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  
  .qr-container {
    background-color: white;
    padding: 12px;
    border-radius: 14px;
    margin-bottom: 16px;
  }
  
  .address-container {
    background-color: #2a2a2a;
    padding: 12px;
    border-radius: 10px;
    width: 100%;
    margin-bottom: 16px;
    text-align: center;
  }
  
  .address-value {
    color: white;
    font-family: monospace;
    font-size: 12px;
    word-break: break-all;
    text-align: center;
    width: 100%;
    display: block;
  }
  
  /* The copy button container */
  .copy-btn-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin: 16px 0;
  }
  
  /* The copy button itself */
  .copy-button {
    background-color: #8247e5;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 24px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    width: auto;
  }
  
  /* The warning message container */
  .warning-message {
    width: 100%;
    text-align: center;
    padding: 0 10px;
    margin-top: 16px;
  }
  
  /* The warning message text */
  .warning-message p {
    color: #bbb;
    font-size: 13px;
    line-height: 1.4;
    margin: 0;
    text-align: center;
  }
  
  /* Make the K logo clickable */
  .logo {
    cursor: pointer;
    position: relative;
  }
  
  /* K logo hover effect */
  .logo:hover .k-logo {
    opacity: 0.8;
  }
  
  /* Logout menu styling */
  .logout-menu {
    position: absolute;
    top: 70px;
    left: 20px;
    background-color: #1e1e1e;
    border-radius: 10px;
    width: 220px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    z-index: 100;
    overflow: hidden;
  }
  
  .logout-menu-content {
    padding: 0;
  }
  
  .logout-menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid #333;
  }
  
  .logout-menu-header h3 {
    margin: 0;
    color: white;
    font-size: 16px;
    font-weight: 500;
  }
  
  .logout-menu-body {
    padding: 15px;
  }
  
  .logout-button {
    background-color: #ff4d4f;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 0;
    width: 100%;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .logout-button:hover {
    background-color: #ff7875;
  }
  
  /* Close button styling */
  .close-button {
    background: none;
    border: none;
    color: #999;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    width: 20px;
  }
`}</style>