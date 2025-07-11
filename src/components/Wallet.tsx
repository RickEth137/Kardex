import React, { useEffect, useState } from 'react';
import TransactionFeed from './TransactionFeed';
import RefreshIcon from './icons/RefreshIcon';
import ReceiveIcon from './icons/ReceiveIcon';
import SendIcon from './icons/SendIcon';
import ReceiveModal from './ReceiveModal'; // Updated import statement

// Define Transaction interface here
interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: string;
  currency: string;
  address: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

const Wallet: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [balance] = useState('0.00');
  const [walletAddress] = useState('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
  const [isReceiveModalVisible, setReceiveModalVisible] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const mockTransactions = [
          {
            id: '1',
            type: 'send' as const,
            amount: '0.25',
            currency: 'ETH',
            address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            date: '2025-07-10',
            status: 'completed' as const
          },
          {
            id: '2',
            type: 'receive' as const,
            amount: '0.5',
            currency: 'ETH',
            address: '0x8f3Cf7ad23Cd3CadBdBE9f8b6F94f146769528',
            date: '2025-07-08',
            status: 'completed' as const
          },
          {
            id: '3',
            type: 'send' as const,
            amount: '0.1',
            currency: 'ETH',
            address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
            date: '2025-07-05',
            status: 'pending' as const
          }
        ];
        
        setTimeout(() => {
          setTransactions(mockTransactions);
          setLoadingTransactions(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleRefresh = () => {
    setLoadingTransactions(true);
    // Add your refresh logic here
    setTimeout(() => {
      setLoadingTransactions(false);
    }, 1000);
  };

  const handleReceive = () => {
    // Show the receive modal
    setReceiveModalVisible(true);
    
    // Here you would typically show a QR code or address for receiving tokens
    console.log('Receive clicked - showing address:', walletAddress);
  };

  const handleSend = () => {
    // Add your send logic here
    console.log('Send clicked');
  };

  // Function to close the receive modal
  const closeReceiveModal = () => {
    setReceiveModalVisible(false);
  };

  return (
    <div className="wallet-container">
      <div className="wallet-balance">
        <h2>Balance: {balance} ETH</h2>
      </div>
      
      <div className="wallet-actions">
        <button onClick={handleRefresh} className="action-btn refresh">
          <RefreshIcon />
        </button>
        <button onClick={handleReceive} className="action-btn receive">
          <ReceiveIcon />
        </button>
        <button onClick={handleSend} className="action-btn send">
          <SendIcon />
        </button>
      </div>
      
      <div className="wallet-transactions">
        <TransactionFeed 
          transactions={transactions}
          loading={loadingTransactions}
          address={walletAddress} 
        />
      </div>
      
      {isReceiveModalVisible && (
        <ReceiveModal 
          walletAddress={walletAddress} 
          onClose={closeReceiveModal} 
        />
      )}
      
      <style>{`
        .wallet-actions {
          display: flex;
          justify-content: space-around;
          margin: 20px 0;
        }
        
        .action-btn {
          background: none;
          border: 1px solid #ccc;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .action-btn:hover {
          background-color: #f0f0f0;
        }
        
        .action-btn.refresh {
          color: #1890ff;
        }
        
        .action-btn.receive {
          color: #52c41a;
        }
        
        .action-btn.send {
          color: #fa8c16;
        }
      `}</style>
    </div>
  );
};

export default Wallet;