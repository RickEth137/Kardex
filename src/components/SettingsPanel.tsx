import React, { useState } from 'react';

interface SettingsPanelProps {
  // Add any props you might need
}

const SettingsPanel: React.FC<SettingsPanelProps> = () => {
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  // Handle logout button click
  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };

  // Handle confirmed logout
  const confirmLogout = () => {
    console.log("Confirming logout...");
    
    // Clear authentication data
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("encryptedKey");
    localStorage.removeItem("encryptedMnemonic");
    
    // Refresh the page to go back to login
    window.location.reload();
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      
      <div className="settings-section">
        <h3>Account</h3>
        <div className="settings-option">
          <span>Email Notifications</span>
          <label className="toggle-switch">
            <input type="checkbox" />
            <span className="slider round"></span>
          </label>
        </div>
        
        <div className="settings-option">
          <span>Enable Biometric Authentication</span>
          <label className="toggle-switch">
            <input type="checkbox" />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Security</h3>
        <div className="settings-option clickable">
          <span>Change Password</span>
          <span className="arrow">→</span>
        </div>
        
        <div className="settings-option clickable">
          <span>Two-Factor Authentication</span>
          <span className="arrow">→</span>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>About</h3>
        <div className="settings-option">
          <span>Version</span>
          <span className="setting-value">1.0.0</span>
        </div>
        
        <div className="settings-option clickable">
          <span>Terms of Service</span>
          <span className="arrow">→</span>
        </div>
        
        <div className="settings-option clickable">
          <span>Privacy Policy</span>
          <span className="arrow">→</span>
        </div>
      </div>
      
      <div className="logout-section">
        <button 
          className="logout-button"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
      
      {showLogoutConfirmation && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <div className="logout-modal-header">
              <h3>Confirm Logout</h3>
              <button 
                className="close-button"
                onClick={() => setShowLogoutConfirmation(false)}
              >
                ×
              </button>
            </div>
            <div className="logout-modal-body">
              <p>Are you sure you want to log out?</p>
              <div className="logout-actions">
                <button 
                  className="cancel-button"
                  onClick={() => setShowLogoutConfirmation(false)}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-logout-button"
                  onClick={confirmLogout}
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        /* All the same styles as before */
        .settings-container { padding: 20px; max-width: 600px; margin: 0 auto; }
        h2 { color: white; margin-bottom: 24px; font-size: 24px; }
        .settings-section { margin-bottom: 30px; background-color: #2a2a2a; border-radius: 12px; overflow: hidden; }
        h3 { color: white; padding: 15px; margin: 0; border-bottom: 1px solid #3a3a3a; font-size: 18px; font-weight: 500; }
        .settings-option { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #3a3a3a; color: #ddd; }
        .settings-option:last-child { border-bottom: none; }
        .settings-option.clickable { cursor: pointer; }
        .settings-option.clickable:hover { background-color: #333; }
        .arrow { color: #888; }
        .setting-value { color: #888; font-size: 14px; }
        .toggle-switch { position: relative; display: inline-block; width: 50px; height: 24px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #444; transition: .4s; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
        input:checked + .slider { background-color: #8247e5; }
        input:checked + .slider:before { transform: translateX(26px); }
        .slider.round { border-radius: 24px; }
        .slider.round:before { border-radius: 50%; }
        .logout-section { margin-top: 40px; display: flex; justify-content: center; }
        .logout-button { background-color: #ff4d4f; color: white; border: none; border-radius: 8px; padding: 12px 24px; font-size: 16px; font-weight: 500; cursor: pointer; transition: background-color 0.2s; width: 100%; max-width: 200px; }
        .logout-button:hover { background-color: #ff7875; }
        .logout-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .logout-modal { background-color: #1e1e1e; border-radius: 12px; width: 90%; max-width: 320px; overflow: hidden; }
        .logout-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #333; }
        .logout-modal-header h3 { margin: 0; color: white; font-size: 18px; border-bottom: none; padding: 0; }
        .logout-modal-body { padding: 20px; }
        .logout-modal-body p { color: #ddd; margin-top: 0; margin-bottom: 20px; text-align: center; }
        .logout-actions { display: flex; gap: 10px; }
        .cancel-button { background-color: transparent; color: #ddd; border: 1px solid #444; border-radius: 8px; padding: 10px 0; flex: 1; cursor: pointer; transition: background-color 0.2s; }
        .cancel-button:hover { background-color: #333; }
        .confirm-logout-button { background-color: #ff4d4f; color: white; border: none; border-radius: 8px; padding: 10px 0; flex: 1; cursor: pointer; transition: background-color 0.2s; }
        .confirm-logout-button:hover { background-color: #ff7875; }
        .close-button { background: none; border: none; color: #999; font-size: 20px; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; height: 20px; width: 20px; }
      `}</style>
    </div>
  );
};

export default SettingsPanel;