// React component
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './Landing.module.css';

const features = [
  { icon: '📚', title: 'LMS Notes', desc: 'AI-generated structured study notes aligned with university exam patterns for UG medical students.' },
  { icon: '🧠', title: 'AI MentorPro', desc: 'Your personal AI mentor that guides learning, answers doubts, and helps you master complex concepts.' },
  { icon: 'ðŸ“', title: 'Essay & MCQ Generator', desc: 'Auto-generate examination questions with answer rubrics for deep self-assessment.' },
  { icon: 'ðŸŽ¯', title: 'Assessment Center', desc: 'Essay grading with AI-powered rubric evaluation and Viva Simulator for oral exam practice.' },
  { icon: 'ðŸ“Š', title: 'Learning Analytics', desc: 'Track your progress across all modules with visual dashboards and performance insights.' },
  { icon: 'ðŸ—‚ï¸', title: 'E-Portfolio', desc: 'Build a comprehensive digital portfolio showcasing your academic journey and achievements.' },
];

const plans = [
  {
    name: 'Basic', price: 199, period: '/month',
    color: '#0EA5E9', glowColor: 'rgba(14,165,233,0.2)',
    features: ['Dashboard (Learning)', 'LMS Notes', 'AI-generated study notes', 'Progress tracking'],
    cta: 'Get Started',
  },
  {
    name: 'Standard', price: 399, period: '/month',
    color: '#6C3BFF', glowColor: 'rgba(108,59,255,0.3)',
    features: ['Everything in Basic', 'Learning Hub', 'Notes Creator', 'Vocabulary Builder', 'Essay & MCQ Generator', 'Task Builder', 'Seminar Builder', 'Literature Review'],
    cta: 'Most Popular',
    highlight: true,
  },
  {
    name: 'Premium', price: 799, period: '/month',
    color: '#F59E0B', glowColor: 'rgba(245,158,11,0.2)',
    features: ['Everything in Standard', 'Assessment Center', 'Essay Question Grader', 'MCQ Question Bank', 'Viva Simulator', 'E-Portfolio Builder', 'Advanced Analytics'],
    cta: 'Go Premium',
  },
];

const testimonials = [
  { name: 'Arjun Mehta', role: 'MBBS 2nd Year', text: 'UGMentor transformed how I study. The AI notes and essay grader helped me score distinctions. It\'s like having a personal tutor 24/7!', avatar: 'AM' },
  { name: 'Priya Nair', role: 'BDS 3rd Year', text: 'The Viva Simulator is phenomenal. I practiced hundreds of viva questions and walked into my clinicals with complete confidence.', avatar: 'PN' },
  { name: 'Dr. Suresh K', role: 'Medical Faculty', text: 'The Task Builder and assessment tools save me enormous time. AI-generated rubrics ensure consistent, fair evaluation across all batches.', avatar: 'SK' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={styles.landing}>
      {/* Navbar */}
      <nav className={`${styles.navbar} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navInner}>
          <Link to="/" className={styles.logo}>
            <img src="/logo.png" alt="UGMentor Logo" width="32" height="32" style={{ objectFit: 'contain', backgroundColor: 'white', padding: '4px', borderRadius: '6px' }} />
            <span className={styles.logoText}>UGMentor</span>
          </Link>
          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#testimonials">Testimonials</a>
            <Link to="/blog">Blog</Link>
            <a href="#contact">Contact</a>
          </div>
          <div className={styles.navActions}>
            <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
            <Link to="/login" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={`glow-dot ${styles.glow1}`} />
          <div className={`glow-dot ${styles.glow2}`} />
          <div className={`glow-dot ${styles.glow3}`} />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span>ðŸš€</span> AI-Powered Medical Education Platform
          </div>
          <h1 className={`${styles.heroTitle} font-outfit`}>
            Master Your Medical<br />
            <span className="gradient-text">Journey with AI</span>
          </h1>
          <p className={styles.heroDesc}>
            The all-in-one AI mentoring platform for MBBS, BDS, and Nursing students.
            Generate smart notes, practice viva exams, build your portfolio, and accelerate your academic success.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/login" className="btn btn-primary btn-lg">
              Start Learning Free <span>→</span>
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              Explore Features
            </a>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}><strong>10,000+</strong><span>Students</span></div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}><strong>50+</strong><span>Subjects</span></div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}><strong>98%</strong><span>Satisfaction</span></div>
          </div>
        </div>
        {/* Floating cards */}
        <div className={styles.heroFloating}>
          <div className={`${styles.floatCard} ${styles.fc1}`}>
            <div className={styles.fcIcon}>ðŸ“Š</div>
            <div>
              <div className={styles.fcTitle}>Progress Score</div>
              <div className={styles.fcValue}>87%</div>
              <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: '87%' }} /></div>
            </div>
          </div>
          <div className={`${styles.floatCard} ${styles.fc2}`}>
            <div className={styles.fcIcon}>🤖</div>
            <div className={styles.fcTitle}>AI Notes Generated</div>
            <div className={styles.fcValue}>142 Notes</div>
          </div>
          <div className={`${styles.floatCard} ${styles.fc3}`}>
            <div className={styles.fcIcon}>ðŸŽ¯</div>
            <div className={styles.fcTitle}>Viva Practice Sessions</div>
            <div className={styles.fcValue}>28 Sessions</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.section} id="features">
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Features</div>
          <h2 className={`${styles.sectionTitle} font-outfit`}>Everything You Need to Excel</h2>
          <p className={styles.sectionDesc}>Powerful AI tools built specifically for undergraduate medical education</p>
          <div className={styles.featuresGrid}>
            {features.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureName}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={`${styles.section} ${styles.howSection}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>How It Works</div>
          <h2 className={`${styles.sectionTitle} font-outfit`}>Three Steps to Smarter Learning</h2>
          <div className={styles.stepsGrid}>
            {[
              { num: '01', title: 'Choose Your Plan', desc: 'Sign up and select the subscription tier that fits your learning needs and budget.' },
              { num: '02', title: 'Access Your Modules', desc: 'Navigate your personalized dashboard with AI-powered tools tailored to your role and tier.' },
              { num: '03', title: 'Track & Excel', desc: 'Monitor your progress, build your portfolio, and consistently improve with AI feedback.' },
            ].map((step, i) => (
              <div key={i} className={styles.stepCard}>
                <div className={styles.stepNum}>{step.num}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.section} id="pricing">
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Pricing</div>
          <h2 className={`${styles.sectionTitle} font-outfit`}>Simple, Transparent Pricing</h2>
          <p className={styles.sectionDesc}>Choose the plan that fits your learning journey</p>
          <div className={styles.pricingGrid}>
            {plans.map((plan, i) => (
              <div key={i} className={`${styles.planCard} ${plan.highlight ? styles.planHighlight : ''}`}
                style={{ '--plan-color': plan.color, '--plan-glow': plan.glowColor } as React.CSSProperties}>
                {plan.highlight && <div className={styles.planBadge}>Most Popular</div>}
                <div className={styles.planName}>{plan.name}</div>
                <div className={styles.planPrice}>
                  <span className={styles.planCurrency}>â‚¹</span>
                  <span className={styles.planAmount}>{plan.price}</span>
                  <span className={styles.planPeriod}>{plan.period}</span>
                </div>
                <ul className={styles.planFeatures}>
                  {plan.features.map((f, j) => (
                    <li key={j}><span className={styles.checkIcon}>✓</span>{f}</li>
                  ))}
                </ul>
                <Link to="/login" className={`btn ${plan.highlight ? 'btn-primary' : 'btn-secondary'} btn-lg`} style={{ width: '100%', justifyContent: 'center' }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`${styles.section} ${styles.testimonialsSection}`} id="testimonials">
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Testimonials</div>
          <h2 className={`${styles.sectionTitle} font-outfit`}>Trusted by Medical Students Nationwide</h2>
          <div className={styles.testimonialGrid}>
            {testimonials.map((t, i) => (
              <div key={i} className={styles.testimonialCard}>
                <div className={styles.testimonialQuote}>&quot;</div>
                <p className={styles.testimonialText}>{t.text}</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{t.avatar}</div>
                  <div>
                    <div className={styles.testimonialName}>{t.name}</div>
                    <div className={styles.testimonialRole}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaContent}>
          <h2 className={`${styles.ctaTitle} font-outfit`}>Ready to Transform Your Learning?</h2>
          <p className={styles.ctaDesc}>Join thousands of medical students who are already learning smarter with UGMentor.</p>
          <Link to="/login" className="btn btn-primary btn-lg">Start for Free →</Link>
        </div>
      </section>

      {/* Contact */}
      <section className={styles.section} id="contact">
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Contact</div>
          <h2 className={`${styles.sectionTitle} font-outfit`}>Get in Touch</h2>
          <div className={styles.contactGrid}>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>ðŸŒ</span>
                <div><strong>Website</strong><br /><a href="https://www.ugmentor.in">www.ugmentor.in</a></div>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📧</span>
                <div><strong>Email</strong><br /><a href="mailto:support@ugmentor.in">support@ugmentor.in</a></div>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>ðŸ“ž</span>
                <div><strong>Phone</strong><br />+91 9606133967</div>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>ðŸ“</span>
                <div><strong>Location</strong><br />Bengaluru, Karnataka, India</div>
              </div>
            </div>
            <form className={styles.contactForm} onSubmit={e => e.preventDefault()}>
              <div className="form-group">
                <label className="label">Your Name</label>
                <input className="input-field" placeholder="Dr. / Student Name" />
              </div>
              <div className="form-group">
                <label className="label">Email Address</label>
                <input className="input-field" type="email" placeholder="your@email.com" />
              </div>
              <div className="form-group">
                <label className="label">Message</label>
                <textarea className="input-field" rows={4} placeholder="How can we help you?" />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <img src="/logo.png" alt="UGMentor Logo" width="32" height="32" style={{ objectFit: 'contain', backgroundColor: 'white', padding: '4px', borderRadius: '6px' }} />
            <span className={styles.logoText}>UGMentor</span>
          </div>
          <p className={styles.footerDesc}>AI-powered learning platform for undergraduate medical students.</p>
          <p className={styles.footerCopy}>Â© 2026 UGMentor Platform. Built for the future of Medical Education.</p>
        </div>
      </footer>
    </div>
  );
}




