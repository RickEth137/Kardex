import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface ReceiveModalProps {
  walletAddress: string;
  onClose: () => void;
}

const ReceiveModal: React.FC<ReceiveModalProps> = ({ walletAddress, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Receive ERC20</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="qr-container">
            <QRCodeCanvas value={`ethereum:${walletAddress}`} size={130} />
          </div>
          
          <div className="address-container">
            <div className="address-value">{walletAddress}</div>
          </div>
          
          <div className="copy-btn-container">
            <button 
              className={`copy-button ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          
          <div className="warning-message">
            <p>Send only ERC20 tokens to this address. This wallet supports receiving any standard ERC20 token.</p>
          </div>
        </div>
      </div>

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
          display: flex;
          justify-content: center;
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
        
        .copy-btn-container {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }
        
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
        
        .copy-button.copied {
          background-color: #6835ba;
        }
        
        .warning-message {
          width: 100%;
          text-align: center;
          padding: 0 10px;
        }
        
        .warning-message p {
          color: #bbb;
          font-size: 13px;
          line-height: 1.4;
          margin: 0;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default ReceiveModal;