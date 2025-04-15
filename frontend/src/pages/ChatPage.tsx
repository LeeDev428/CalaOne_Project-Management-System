import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatPage.css';

const ChatPage = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>CalaOne</h2>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
        <div className="contacts-list">
          <div className="contact active">
            <div className="contact-avatar">J</div>
            <div className="contact-info">
              <h3>John Doe</h3>
              <p>Last message...</p>
            </div>
          </div>
          {/* Add more contacts here */}
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <div className="chat-contact-info">
            <h3>John Doe</h3>
            <span className="status">Online</span>
          </div>
        </div>

        <div className="messages-container">
          <div className="message received">
            <p>Hey, how are you?</p>
            <span className="time">10:30 AM</span>
          </div>
          <div className="message sent">
            <p>I'm good! How about you?</p>
            <span className="time">10:31 AM</span>
          </div>
        </div>

        <div className="message-input">
          <input type="text" placeholder="Type a message..." />
          <button className="send-btn">Send</button>
        </div>
      </div>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button onClick={confirmLogout} className="confirm-btn">
                Yes, Logout
              </button>
              <button onClick={() => setShowLogoutModal(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
