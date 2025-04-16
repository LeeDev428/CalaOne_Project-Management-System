import React from 'react'
import { Link } from 'react-router-dom'
import './HomePage.css'

const HomePage = () => {
  return (
    <div className="home">
      <nav className="navbar">
        <div className="logo">CalaOne</div>
        <Link to="/login" className="sign-in">Sign In</Link>
      </nav>

      <div className="content-wrapper">
        <section className="hero-section">
          <h1>Connect. Chat. Collaborate.</h1>
          <p className="hero-subtitle">Experience real-time communication with enhanced security and seamless integration.</p>
          <div className="hero-buttons">
            <Link to="/login" className="button primary">Get Started</Link>
            <Link to="/learn" className="button secondary">Learn More</Link>
          </div>
        </section>

        <section className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🔒</span>
              <h3>Secure Chats</h3>
              <p>End-to-end encryption for your privacy</p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon">⚡</span>
              <h3>Real-time</h3>
              <p>Instant messaging without delays</p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon">🌐</span>
              <h3>Cross-platform</h3>
              <p>Chat from any device, anywhere</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default HomePage
