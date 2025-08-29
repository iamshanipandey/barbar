import React, { useState, useEffect } from "react";
import "./Home.css";
import { Link } from "react-router-dom";

function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [queuePosition, setQueuePosition] = useState(3);

  const testimonials = [
    {
      name: "Rajesh Kumar",
      location: "Delhi", 
      text: "Absolutely no time waste! I can see from home how many people are in line.",
      rating: 5,
      avatar: "👨‍💼"
    },
    {
      name: "Sneha Sharma",
      location: "Mumbai",
      text: "Perfect timing! I reach the salon exactly when my number comes up.",
      rating: 5,
      avatar: "👩‍💻"
    },
    {
      name: "Arjun Singh",
      location: "Bangalore",
      text: "Best app for busy professionals! No more wasting time in queues.",
      rating: 5,
      avatar: "👨‍🎓"
    }
  ];

  const steps = [
    {
      id: 1,
      icon: "🔍",
      title: "Find Nearby Salons",
      description: "Discover registered barber shops in your area with live availability"
    },
    {
      id: 2,
      icon: "📱",
      title: "Join Queue Online",
      description: "Join the queue with one click and get your token number instantly"
    },
    {
      id: 3,
      icon: "📊",
      title: "Live Tracking",
      description: "See real-time how many customers are ahead of you in the queue"
    },
    {
      id: 4,
      icon: "⚡",
      title: "Perfect Timing",
      description: "Arrive exactly at your turn - no waiting, no time waste!"
    }
  ];

  const customerFeatures = [
    { icon: "📍", text: "Find nearby salons instantly" },
    { icon: "🎯", text: "Live queue position tracking" },
    { icon: "⏰", text: "Estimated waiting time" },
    { icon: "⭐", text: "Rate & review services" },
    { icon: "🔔", text: "Smart notifications" }
  ];

  const barberFeatures = [
    { icon: "📊", text: "Complete queue dashboard" },
    { icon: "👥", text: "Customer management system" },
    { icon: "📈", text: "Business analytics" },
    { icon: "💰", text: "Increase revenue by 40%" },
    { icon: "🎯", text: "Reduce no-shows" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const queueInterval = setInterval(() => {
      setQueuePosition(prev => prev > 0 ? prev - 1 : 5);
    }, 3000);
    return () => clearInterval(queueInterval);
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="badge">
            ✂️ Premium Grooming Experience
          </div>
         
          <h1 className="hero-title">
            Skip The <span className="highlight">Wait.</span>
            <br />Book Smart.
          </h1>
         
          <p className="hero-description">
            Modern queue management for barber shops. Book your slot, track your position, and get the perfect cut without the wait.
          </p>
         
          <div className="cta-buttons">
            <Link to={"/barbers-near-me"}>
              <button className="btn btn-primary">Book Now</button>
            </Link>
            <Link to={"/check-status"}>
                <button className="btn btn-secondary">Track Your Queue</button>
            </Link>
            
          </div>
        </div>
       
        <div className="hero-image">
          <div className="animated-barber">
            <svg width="400" height="400" viewBox="0 0 400 400" className="barber-svg">
              <circle cx="200" cy="200" r="180" fill="url(#bgGradient)" className="bg-circle"/>
              <rect x="150" y="280" width="100" height="80" rx="10" fill="#8B4513" className="chair"/>
              <rect x="140" y="270" width="120" height="20" rx="10" fill="#A0522D" className="chair-back"/>
              <ellipse cx="200" cy="250" rx="35" ry="50" fill="#4A90E2" className="body"/>
              <circle cx="200" cy="180" r="30" fill="#FDBCB4" className="head"/>
              <path d="M170 160 Q200 140 230 160 Q220 150 200 150 Q180 150 170 160" fill="#8B4513" className="hair"/>
              <circle cx="190" cy="175" r="3" fill="#333" className="eye"/>
              <circle cx="210" cy="175" r="3" fill="#333" className="eye"/>
              <ellipse cx="200" cy="185" rx="2" ry="4" fill="#F4A460"/>
              <path d="M190 195 Q200 205 210 195" stroke="#333" strokeWidth="2" fill="none" className="smile"/>
              <ellipse cx="165" cy="230" rx="8" ry="25" fill="#FDBCB4" className="arm-left"/>
              <ellipse cx="235" cy="230" rx="8" ry="25" fill="#FDBCB4" className="arm-right"/>
              <g className="scissors" transform="translate(240, 220)">
                <path d="M-5 -15 L5 -10 L8 -8 L5 -5 L-5 0 L-8 -2 L-5 -5 L-8 -8 Z" fill="#C0C0C0"/>
                <circle cx="0" cy="-10" r="3" fill="#FFD700"/>
                <circle cx="0" cy="-5" r="3" fill="#FFD700"/>
              </g>
              <g className="hair-clippings">
                <rect x="120" y="320" width="3" height="8" fill="#8B4513" className="clip1"/>
                <rect x="140" y="325" width="2" height="6" fill="#654321" className="clip2"/>
                <rect x="260" y="318" width="4" height="7" fill="#8B4513" className="clip3"/>
                <rect x="280" y="322" width="3" height="9" fill="#654321" className="clip4"/>
              </g>
              <g className="floating-elements">
                <text x="100" y="100" className="floating-text">✂️</text>
                <text x="320" y="120" className="floating-text">💈</text>
                <text x="80" y="300" className="floating-text">✨</text>
                <text x="310" y="320" className="floating-text">⭐</text>
              </g>
              <defs>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(245,158,11,0.1)"/>
                  <stop offset="100%" stopColor="rgba(59,130,246,0.1)"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
     
      {/* Features Section */}
      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon">📱</div>
          <h3>Smart Booking</h3>
          <p>Book your appointment in seconds</p>
        </div>
       
        <div className="feature-card">
          <div className="feature-icon">⏱️</div>
          <h3>Queue Tracking</h3>
          <p>Real-time position updates</p>
        </div>
       
        <div className="feature-card">
          <div className="feature-icon">✨</div>
          <h3>Premium Service</h3>
          <p>Expert barbers, quality grooming</p>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">How Does It Work?</h2>
            <p className="section-subtitle">Complete your perfect haircut booking in 4 simple steps</p>
          </div>
          
          <div className="timeline-container">
            <div className="timeline-line"></div>
            {steps.map((step, index) => (
              <div key={step.id} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
                <div className="timeline-content">
                  <div className="step-badge">
                    <span className="step-number">{step.id}</span>
                    <span className="step-icon">{step.icon}</span>
                  </div>
                  <div className="step-info">
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-description">{step.description}</p>
                  </div>
                </div>
                <div className="timeline-dot"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Showcase */}
      <section className="advanced-features">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Perfect Solution for Everyone</h2>
            <p className="section-subtitle">Amazing features for both customers and barbers</p>
          </div>
          
          <div className="comparison-container">
            <div className="feature-column customer-column">
              <div className="column-header">
                <div className="column-icon">👨‍💼</div>
                <h3>For Customers</h3>
                <p>Hassle-free booking experience</p>
              </div>
              <div className="features-list">
                {customerFeatures.map((feature, index) => (
                  <div key={index} className="feature-row">
                    <span className="feature-icon">{feature.icon}</span>
                    <span className="feature-text">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="vs-divider">
              <div className="vs-circle">VS</div>
            </div>
            
            <div className="feature-column barber-column">
              <div className="column-header">
                <div className="column-icon">💼</div>
                <h3>For Barbers</h3>
                <p>Complete business management</p>
              </div>
              <div className="features-list">
                {barberFeatures.map((feature, index) => (
                  <div key={index} className="feature-row">
                    <span className="feature-icon">{feature.icon}</span>
                    <span className="feature-text">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">What Users Are Saying?</h2>
          </div>
          
          <div className="testimonial-container">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <div className="quote-icon">"</div>
                <p className="testimonial-text">
                  {testimonials[currentTestimonial].text}
                </p>
                <div className="testimonial-rating">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <span key={i} className="star">⭐</span>
                  ))}
                </div>
              </div>
              
              <div className="testimonial-author">
                <div className="author-avatar">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div className="author-info">
                  <div className="author-name">{testimonials[currentTestimonial].name}</div>
                  <div className="author-location">{testimonials[currentTestimonial].location}</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Skip the Queue?</h2>
            <p className="cta-subtitle">
              Join thousands of smart people who never wait in queues anymore!
            </p>
            
            <div className="cta-buttons-mega">
              <button className="mega-btn customer-btn">
                <div className="btn-content">
                  <span className="btn-icon">👨‍💼</span>
                  <div className="btn-text">
                    <div className="btn-title">I'm a Customer</div>
                    <div className="btn-subtitle">Book appointments</div>
                  </div>
                </div>
              </button>
              
              <button className="mega-btn barber-btn">
                <div className="btn-content">
                  <span className="btn-icon">💼</span>
                  <div className="btn-text">
                    <div className="btn-title">I'm a Barber</div>
                    <div className="btn-subtitle">Manage your salon</div>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="trust-indicators">
              <div className="trust-item">
                <span className="trust-icon">🔒</span>
                <span>100% Secure</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">📱</span>
                <span>Mobile First</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">⚡</span>
                <span>Lightning Fast</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <span className="logo-text">QueueCuts</span>
              </div>
              <p className="footer-tagline">
                Modern queue management for barber shops
              </p>
            </div>
            
            <div className="footer-links">
              <div className="link-group">
                <h4>Product</h4>
                <a href="#">How it Works</a>
                <a href="#">For Customers</a>
                <a href="#">For Barbers</a>
                <a href="#">Pricing</a>
              </div>
              
              <div className="link-group">
                <h4>Company</h4>
                <a href="#">About Us</a>
                <a href="#">Careers</a>
                <a href="#">Contact</a>
                <a href="#">Blog</a>
              </div>
              
              <div className="link-group">
                <h4>Support</h4>
                <a href="#">Help Center</a>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">FAQ</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 QueueCuts. Made with ❤️ for modern businesses</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;