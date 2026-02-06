import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

export default function IntroPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Navbar - Simplified for Intro */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem'}}>MISR UNIVERSITY<br/><span style={{fontSize: '0.8rem', fontWeight: 'normal'}}>FOR SCIENCE & TECHNOLOGY</span></div>
        </div>
        <div className="nav-links">
           <button 
             onClick={() => navigate('/register')} 
             style={{
               background: 'transparent', 
               border: 'none', 
               color: 'white', 
               cursor: 'pointer', 
               fontWeight: 'bold',
               fontSize: '1rem'
             }}
           >
             Login
           </button>
        </div>
      </nav>

      <div className="hero-section">
        {/* Background Blobs - Reusing from index.css logic if present, or just relying on CSS */}
        <div className="background-blobs">
            <div className="blob blob-1"></div>

        </div>

        <div className="glass-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px', justifyContent: 'flex-start' }}>
          
          <div style={{ width: '100%' }}>
            <h1 className="title">
              How it <span className="highlight">Works</span>
            </h1>
            <p className="subtitle" style={{ textAlign: 'left', marginBottom: '2px' }}>
              Finding a seat in a closed course shouldn't be a struggle. We automated the process for you.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', width: '100%' }}>
            {/* Step 1 */}
            <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.6)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}></div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--must-blue)' }}>1. Sign In</h3>
              <p style={{ margin: 0, color: '#4B5563', lineHeight: '1.5' }}>
                Login securely with your Google account to access the registration system.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.6)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}></div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--must-blue)' }}>2. Subscribe</h3>
              <p style={{ margin: 0, color: '#4B5563', lineHeight: '1.5' }}>
                Enter the <strong>Subject Code</strong> (e.g., CSE3) and <strong>Course Number</strong> (e.g., 03) you need.
                <br/>
                <span style={{ fontSize: '0.85rem', color: '#DC2626', marginTop: '0.5rem', display: 'block' }}>
                  * Note: Each user can only monitor one subject.
                </span>
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.6)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}></div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--must-blue)' }}>3. Get Notified</h3>
              <p style={{ margin: 0, color: '#4B5563', lineHeight: '1.5' }}>
                We check the system 24/7. When a seat opens, you'll get an instant <strong>WhatsApp</strong> message.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '2rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/register')} 
              className="submit-btn" 
              style={{ maxWidth: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              Start Tracking Now 
              <span style={{ fontSize: '1.2rem' }}>→</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
