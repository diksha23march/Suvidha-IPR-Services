import { useState } from "react";
import "./App.css";
import EnquiryForm from "./EnquiryForm.jsx";

function App() {
  const [enquiryType, setEnquiryType] = useState(null);
  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#home">
          <span className="brand-mark">S</span>
          <span>
            <strong>Suvidha</strong>
            <small>IPR SERVICES</small>
          </span>
        </a>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#services">Our Services</a>
          <a href="#about">About Us</a>
          <a href="#contact">Contact</a>
        </nav>

        <a className="nav-cta" href="#contact">
          Get Started <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="status-dot" />
              INTELLECTUAL PROPERTY SUPPORT
            </div>

            <h1>
              Your Ideas.
              <br />
              Your Innovation.
              <br />
              <span>Protected.</span>
            </h1>

            <p className="hero-description">
              Expert assistance for patent and copyright filing.
              Protect what you create with a clearer, simpler
              intellectual property journey.
            </p>

            <div className="hero-actions">
              <a className="button-primary" href="#services">
                Explore Our Services <span aria-hidden="true">→</span>
              </a>
              <a className="button-secondary" href="#contact">
                Talk to Our Team
              </a>
            </div>

            <div className="trust-note">
              <span className="trust-icon">✓</span>
              Clear guidance. Confidentiality-focused support.
            </div>
          </div>

          <div className="hero-visual" aria-label="Intellectual property concept">
            <div className="visual-glow" />
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />

            <div className="document-card">
              <div className="document-top">
                <span className="document-symbol">S.</span>
                <span className="document-label">IDEA / 001</span>
              </div>

              <div className="document-art">
                <div className="art-ring ring-one" />
                <div className="art-ring ring-two" />
                <div className="art-ring ring-three" />
                <div className="art-core">S</div>
              </div>

              <div className="document-lines">
                <span />
                <span />
                <span />
              </div>

              <div className="document-footer">
                <span>YOUR CREATION</span>
                <span>EST. INNOVATION</span>
              </div>
            </div>

            <div className="floating-badge badge-patent">
              <span className="badge-icon">✳</span>
              <span><strong>Patents</strong><small>Innovation protection</small></span>
            </div>

            <div className="floating-badge badge-copyright">
              <span className="badge-icon">©</span>
              <span><strong>Copyrights</strong><small>Creative protection</small></span>
            </div>

            <div className="visual-caption">GOOD IDEAS DESERVE PROTECTION.</div>
          </div>

          <div className="hero-index">01 / IDEAS TO IP</div>
        </section>

        <section className="services-section" id="services">
          <div className="section-heading">
            <div>
              <span className="section-kicker">WHAT WE HELP WITH</span>
              <h2>Make your ideas <span>count.</span></h2>
            </div>
            <p>
              Practical guidance to help creators and innovators
              understand their intellectual property options.
            </p>
          </div>

          <div className="service-grid">
            <article className="service-card patent-card">
              <div className="service-card-top">
                <span className="service-icon">✳</span>
                <span className="service-number">01</span>
              </div>
              <span className="service-category">FOR INVENTORS & INNOVATORS</span>
              <h3>Patent Assistance</h3>
              <p>
                Support with understanding patent requirements,
                preparing documentation, and navigating the filing
                process for eligible inventions.
              </p>
              <a
                href="#enquiry-form"
                onClick={() => setEnquiryType("patent")}
              >
                Enquire about patents <span aria-hidden="true">↗</span>
              </a>
            </article>

            <article className="service-card copyright-card">
              <div className="service-card-top">
                <span className="service-icon">©</span>
                <span className="service-number">02</span>
              </div>
              <span className="service-category">FOR AUTHORS & CREATORS</span>
              <h3>Copyright Assistance</h3>
              <p>
                Guidance for protecting eligible original works,
                including written content, artwork, music, and
                other creative expressions.
              </p>
              <a
                href="#enquiry-form"
                onClick={() => setEnquiryType("copyright")}
              >
                Enquire about copyrights <span aria-hidden="true">↗</span>
              </a>
            </article>
          </div>
          <p className="legal-note">
            Filing requirements and outcomes depend on the applicable law,
            the type of work or invention, and examination by the relevant
            authority. Registration or grant is not guaranteed.
          </p>
        </section>

        <section className="about-section" id="about">
          <span className="section-kicker">THE SUVIDHA APPROACH</span>
          <h2>Protecting ideas should feel <span>less complicated.</span></h2>
          <p>
            We aim to make intellectual property processes easier to
            understand through clear communication, organised
            documentation support, and guidance tailored to your enquiry.
          </p>

          <div className="approach-points">
            <div><span>01</span><strong>Understand your needs</strong></div>
            <div><span>02</span><strong>Clarify your next steps</strong></div>
            <div><span>03</span><strong>Support your filing journey</strong></div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div>
            <span className="section-kicker">LET'S GET STARTED</span>
            <h2>Have an idea worth <span>protecting?</span></h2>
            <p>
              Tell us whether you need patent or copyright assistance.
              We can start by understanding your requirements.
            </p>
          </div>
          <div className="contact-enquiry-actions">
            <button
              className="button-primary"
              type="button"
              onClick={() => setEnquiryType("patent")}
            >
              Patent Enquiry
            </button>

            <button
              className="button-secondary"
              type="button"
              onClick={() => setEnquiryType("copyright")}
            >
              Copyright Enquiry
            </button>
          </div>
          <small>
            Contact details will be added once the business-approved
            email address and enquiry process are confirmed.
          </small>
        </section>
        {enquiryType && (
          <EnquiryForm
            type={enquiryType}
            onClose={() => setEnquiryType(null)}
          />
        )}
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark">S</span>
          <span><strong>Suvidha</strong><small>IPR SERVICES</small></span>
        </a>
        <p>Protect Your Ideas. Secure Your Innovation.</p>
        <span>© {new Date().getFullYear()} Suvidha IPR Services</span>
      </footer>
    </div>
  );
}

export default App;
