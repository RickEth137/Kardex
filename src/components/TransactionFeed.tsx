import React, { useState } from 'react';

// Define the Transaction interface
interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: string;
  currency: string;
  address: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionFeedProps {
  transactions: Transaction[];
  loading: boolean;
  address: string;
}

const TransactionFeed: React.FC<TransactionFeedProps> = ({ 
  transactions, 
  loading
}) => {
  const [error] = useState<string | null>(null);

  // Format short address
  const shortenAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (loading) {
    return <div className="loading-spinner">Loading transactions...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Improved empty state with better styling
  if (transactions.length === 0) {
    return (
      <div className="empty-transactions">
        <div className="empty-icon">📭</div>
        <h4>No recent transactions</h4>
        <p>Your transaction history will appear here when you start sending or receiving crypto.</p>
      </div>
    );
  }

  return (
    <div className="transaction-feed">
      <h3>Recent Transactions</h3>
      <ul className="transaction-list">
        {transactions.map((tx) => (
          <li key={tx.id} className="transaction-item">
            <div className={`transaction-icon ${tx.type}`}>
              {tx.type === 'send' ? '↑' : '↓'}
            </div>
            <div className="transaction-details">
              <div className="transaction-title">
                {tx.type === 'send' ? 'Sent' : 'Received'} {tx.amount} {tx.currency}
              </div>
              <div className="transaction-meta">
                <span>{shortenAddress(tx.address)}</span>
                <span className="transaction-date">{tx.date}</span>
                <span className={`transaction-status ${tx.status}`}>{tx.status}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <style>{`
        .transaction-feed {
          margin-top: 20px;
          border-top: 1px solid #eaeaea;
          padding-top: 15px;
        }

        .transaction-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .transaction-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-weight: bold;
        }

        .transaction-icon.send {
          background-color: #ff4d4f;
          color: white;
        }

        .transaction-icon.receive {
          background-color: #52c41a;
          color: white;
        }

        .transaction-details {
          flex: 1;
        }

        .transaction-title {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .transaction-meta {
          display: flex;
          font-size: 0.85rem;
          color: #888;
          gap: 8px;
        }

        .transaction-status {
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 0.75rem;
        }

        .transaction-status.completed {
          background-color: #e6f7ff;
          color: #1890ff;
        }

        .transaction-status.pending {
          background-color: #fff7e6;
          color: #fa8c16;
        }

        .transaction-status.failed {
          background-color: #fff1f0;
          color: #f5222d;
        }

        .loading-spinner {
          text-align: center;
          padding: 20px;
          color: #888;
        }

        .error-message {
          color: #ff4d4f;
          padding: 16px;
          text-align: center;
          border: 1px solid #ffa39e;
          background-color: #fff1f0;
          border-radius: 4px;
        }

        .empty-transactions {
          text-align: center;
          padding: 30px 20px;
          color: #888;
          background-color: #f9f9f9;
          border-radius: 8px;
          margin-top: 20px;
        }
        
        .empty-icon {
          font-size: 36px;
          margin-bottom: 10px;
        }
        
        .empty-transactions h4 {
          margin: 0 0 10px;
          color: #555;
          font-weight: 500;
        }
        
        .empty-transactions p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default TransactionFeed;