import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  
  const socialLinks = [
  {
    name: 'GitHub',
    url: 'https://github.com/Dubleu-x',
    icon: '💻',
    color: '#333'
  },
  {
    name: 'LinkedIn',
    url: 'www.linkedin.com/in/sylvester-kamau-b7a714351', 
    icon: '💼',
    color: '#0077b5'
  },
  {
    name: 'WhatsApp',
    url: 'https://wa.me/254799722684', 
    icon: '💬',
    color: '#25D366'
  },
   {
    name: 'Email',
    url: 'mailto:clvesta82@gmail.com', // Added email
    icon: '📧',
    color: '#EA4335' // Gmail red color
  }
];

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>DubleuLearn</h3>
          <p>Empowering students and teachers through innovative e-learning solutions.</p>
        </div>

        <div className="footer-section">
          <h4>Connect With Me</h4>
          <div className="social-links">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                style={{ '--social-color': social.color }}
                title={social.name}
              >
                <span className="social-icon">{social.icon}</span>
                <span className="social-name">{social.name}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <div className="quick-links">
            <a href="/courses">Browse Courses</a>
            <a href="/create-course">Create Course</a>
            <a href="/dashboard">Dashboard</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} DubleuLearn. All rights reserved. | Built with ❤️ by Sylvester Kamau</p>
      </div>
    </footer>
  );
};

export default Footer;