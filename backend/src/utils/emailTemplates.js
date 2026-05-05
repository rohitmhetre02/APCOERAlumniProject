// Production Email Templates - Centralized Template System

// Base styles for all email templates
const getBaseStyles = () => {
  return `
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #2C2C2A;
        background-color: #F9F9F7;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      .email-wrapper {
        max-width: 600px;
        margin: 0 auto;
        background-color: #FFFFFF;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
      .header {
        background: linear-gradient(135deg, #1A3A5C 0%, #2C4E6E 100%);
        color: #FFFFFF;
        padding: 40px 32px;
        text-align: center;
      }
      .header .institution {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 1.8px;
        text-transform: uppercase;
        color: #B8C5D6;
        margin-bottom: 8px;
      }
      .header h1 {
        font-size: 32px;
        font-weight: 700;
        margin: 0;
        margin-bottom: 8px;
      }
      .header .tagline {
        font-size: 15px;
        color: #E0E6ED;
        margin: 0;
      }
      .status-banner {
        padding: 16px 32px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .status-banner.success {
        background-color: #E8F5E8;
        color: #2B5A2B;
      }
      .status-banner.info {
        background-color: #EBF3F9;
        color: #0C5460;
      }
      .status-banner.error {
        background-color: #FADBD8;
        color: #9C2A27;
      }
      .status-banner.warning {
        background-color: #FEF8EE;
        color: #7A5000;
      }
      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: currentColor;
      }
      .status-banner p {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
      }
      .body {
        padding: 32px;
      }
      .greeting {
        font-size: 16px;
        margin-bottom: 20px;
      }
      .intro-text {
        font-size: 15px;
        line-height: 1.7;
        color: #5F5E5A;
        margin-bottom: 28px;
      }
      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: #1A3A5C;
        margin-bottom: 16px;
      }
      .steps-list {
        list-style: none;
        padding: 0;
        margin: 0 0 28px 0;
      }
      .steps-list li {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 16px;
        font-size: 15px;
        line-height: 1.6;
      }
      .step-num {
        min-width: 28px;
        height: 28px;
        background-color: #1A3A5C;
        color: #FFFFFF;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 600;
      }
      .info-card {
        background-color: #F4F1EC;
        border-radius: 10px;
        padding: 20px 24px;
        margin-bottom: 28px;
      }
      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #1A3A5C;
        margin-bottom: 8px;
      }
      .card-text {
        font-size: 14px;
        color: #5F5E5A;
        line-height: 1.6;
        margin: 0;
      }
      .cta-block {
        text-align: center;
        margin: 32px 0;
      }
      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #1A3A5C 0%, #2C4E6E 100%);
        color: #FFFFFF;
        padding: 12px 28px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 15px;
        transition: all 0.2s ease;
      }
      .cta-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(26, 58, 92, 0.3);
      }
      .support-line {
        font-size: 14px;
        color: #888780;
        text-align: center;
        margin-bottom: 8px;
      }
      .support-line a {
        color: #1A3A5C;
        text-decoration: none;
        font-weight: 500;
      }
      .support-line a:hover {
        text-decoration: underline;
      }
      .footer {
        background-color: #F9F9F7;
        padding: 24px 32px;
        text-align: center;
      }
      .footer-name {
        font-size: 16px;
        font-weight: 600;
        color: #1A3A5C;
        margin-bottom: 4px;
      }
      .footer-sub {
        font-size: 13px;
        color: #888780;
        margin-bottom: 20px;
      }
      .footer-divider {
        border: none;
        border-top: 1px solid #E0DDD6;
        margin: 20px 0;
      }
      .footer-legal {
        font-size: 12px;
        color: #A8A59E;
        line-height: 1.5;
      }
      .footer-legal a {
        color: #888780;
        text-decoration: none;
      }
      .footer-legal a:hover {
        text-decoration: underline;
      }
      .badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }
      .badge-success {
        background-color: #E8F5E8;
        color: #2B5A2B;
        border: 1px solid #B8E0B8;
      }
      .badge-error {
        background-color: #FADBD8;
        color: #9C2A27;
        border: 1px solid #F5B7B1;
      }
      .badge-info {
        background-color: #EBF3F9;
        color: #0C5460;
        border: 1px solid #B8DAFF;
      }
      .highlight-box {
        background-color: #F4F1EC;
        border-left: 4px solid #1A3A5C;
        padding: 16px 20px;
        margin: 20px 0;
      }
      .highlight-box h4 {
        color: #1A3A5C;
        margin-bottom: 12px;
      }
      .otp-code {
        font-size: 32px;
        font-weight: 700;
        color: #1A3A5C;
        letter-spacing: 8px;
        font-family: 'Courier New', monospace;
        text-align: center;
        padding: 20px;
        background-color: #F4F1EC;
        border-radius: 8px;
        margin: 20px 0;
      }
      @media only screen and (max-width: 600px) {
        .email-wrapper {
          margin: 0;
          border-radius: 0;
        }
        .header, .body, .footer {
          padding: 20px;
        }
        .header h1 {
          font-size: 24px;
        }
      }
    </style>
  `;
};

// Base template wrapper
const getBaseTemplate = (content) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>APCOER Alumni Portal</title>
      ${getBaseStyles()}
    </head>
    <body>
      <div class="email-wrapper">
        ${content}
      </div>
    </body>
    </html>
  `;
};

// 1. Registration Pending Email Template
export const getRegistrationPendingTemplate = (userName) => {
  const subject = 'Registration Received – APCOER Alumni Portal';
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>Registration Received</h1>
      <p class="tagline">Welcome to the APCOER Alumni Community</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner info">
      <div class="status-dot"></div>
      <p><strong>Application Status:</strong> Pending Review</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${userName}</strong>,</p>

      <p class="intro-text">
        Thank you for registering with the APCOER Alumni Portal! Your registration has been successfully submitted 
        and is currently under review by our administrative team.
      </p>

      <!-- Timeline -->
      <p class="section-title">What happens next?</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">1</div>
          <span><strong style="color:#2C2C2A;">Review Process</strong> - Our team will verify your information and alumni status.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span><strong style="color:#2C2C2A;">Approval</strong> - You'll receive an email once your account is approved.</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span><strong style="color:#2C2C2A;">Access Granted</strong> - Log in and connect with fellow alumni.</span>
        </li>
      </ul>

      <!-- Support -->
      <p class="support-line">Questions about your registration? Our team is here to help.</p>
      <p class="support-line">
        Contact us at <a href="mailto:support@apcoer.edu.in">support@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research, Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// Account Approval Email Template
const getApprovalTemplate = (userName) => {
  const subject = 'Account Approved – APCOER Alumni Portal';
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>Account Approved</h1>
      <p class="tagline">Welcome to the APCOER Alumni Community</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner success">
      <div class="status-dot"></div>
      <p><strong>Account Status:</strong> Approved</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${userName}</strong>,</p>

      <p class="intro-text">
        Great news! Your account has been approved and you now have full access to the APCOER Alumni Portal.
        We're excited to have you join our vibrant community of alumni.
      </p>

      <!-- Confirmation Details -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">Account Details</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Full Name</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${userName}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Account Status</p>
        <span class="badge-approved">Approved</span>
      </div>

      <!-- Next Steps -->
      <p class="section-title">What can you do now?</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">1</div>
          <span><strong style="color:#2C2C2A;">Log in</strong> to your account using your registered email and password.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span><strong style="color:#2C2C2A;">Complete your profile</strong> with your professional details, achievements, and interests.</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span><strong style="color:#2C2C2A;">Connect with alumni</strong> - search and network with fellow graduates.</span>
        </li>
        <li>
          <div class="step-num">4</div>
          <span><strong style="color:#2C2C2A;">Explore opportunities</strong> - access job postings, events, and alumni resources.</span>
        </li>
      </ul>

      <!-- CTA -->
      <div class="cta-block">
        <p>Your alumni journey begins now! Log in to start connecting and exploring.</p>
        <a href="https://alumni.apcoer.edu/login" class="cta-button">Log In to Portal</a>
      </div>

      <!-- Support -->
      <p class="support-line">Need help getting started? Our support team is here for you.</p>
      <p class="support-line">
        Contact us at <a href="mailto:support@apcoer.edu.in">support@apcoer.edu.in</a> for any assistance.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research,Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// Application Accepted Email Template
const getApplicationAcceptedTemplate = (userName, opportunityTitle, company, opportunityDescription) => {
  const subject = `Application Accepted - ${opportunityTitle} at ${company}`;
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>Application Accepted!</h1>
      <p class="tagline">Congratulations on your successful application</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner success">
      <div class="status-dot"></div>
      <p><strong>Application Status:</strong> Accepted</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${userName}</strong>,</p>

      <p class="intro-text">
        Congratulations! Your application for <strong>${opportunityTitle}</strong> at <strong>${company}</strong> has been accepted.
        The employer was impressed with your profile and would like to move forward with your application.
      </p>

      <!-- Opportunity Details -->
      <div class="opportunity-card">
        <div class="opportunity-header">Opportunity Details</div>
        <div class="opportunity-body">
          <h3 class="opportunity-title">${opportunityTitle}</h3>
          <p class="opportunity-company">${company}</p>
          <p class="opportunity-description">${opportunityDescription}</p>
        </div>
      </div>

      <!-- Next Steps -->
      <p class="section-title">What happens next?</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">1</div>
          <span>The employer will contact you directly within 2-3 business days.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span>Be prepared for interviews and additional assessment rounds.</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span>Keep your profile updated with current contact information.</span>
        </li>
        <li>
          <div class="step-num">4</div>
          <span>Check your email regularly for communication from the employer.</span>
        </li>
      </ul>

      <!-- CTA -->
      <div class="cta-block">
        <p>Keep track of all your applications and explore more opportunities on the portal.</p>
        <a href="https://alumni.apcoer.edu/opportunities" class="cta-button">View More Opportunities</a>
      </div>

      <!-- Support -->
      <p class="support-line">Questions about this opportunity? We're here to help.</p>
      <p class="support-line">
        Contact our career services at <a href="mailto:careers@apcoer.edu.in">careers@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research,Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// Application Reviewed Email Template
const getApplicationReviewedTemplate = (userName, opportunityTitle, company) => {
  const subject = `Application Under Review - ${opportunityTitle} at ${company}`;
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>Application Under Review</h1>
      <p class="tagline">Your application is being considered</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner info">
      <div class="status-dot"></div>
      <p><strong>Application Status:</strong> Under Review</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${userName}</strong>,</p>

      <p class="intro-text">
        Your application for <strong>${opportunityTitle}</strong> at <strong>${company}</strong> has been received and is currently under review.
        The employer is evaluating your qualifications and experience.
      </p>

      <!-- Confirmation Details -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">Application Details</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Position</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${opportunityTitle}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Company</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${company}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Applied On</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:6px;">Status</p>
        <span style="background-color:#EBF3F9; color:#0C5460; border:1px solid #B8DAFF; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600;">Under Review</span>
      </div>

      <!-- Timeline -->
      <p class="section-title">Application Timeline</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">✓</div>
          <span><strong style="color:#2C2C2A;">Application Submitted</strong> - Your profile has been sent to the employer.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span><strong style="color:#2C2C2A;">Under Review</strong> - Employer is evaluating your application (current stage).</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span><strong style="color:#2C2C2A;">Decision</strong> - You'll be notified of the outcome within 7-10 business days.</span>
        </li>
      </ul>

      <!-- CTA -->
      <div class="cta-block">
        <p>Track your application status and explore other opportunities while you wait.</p>
        <a href="https://alumni.apcoer.edu/applications" class="cta-button">Track Applications</a>
      </div>

      <!-- Support -->
      <p class="support-line">Have questions about your application? Our team is here to help.</p>
      <p class="support-line">
        Contact us at <a href="mailto:careers@apcoer.edu.in">careers@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research,Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// Application Rejected Email Template
const getApplicationRejectedTemplate = (userName, opportunityTitle, company) => {
  const subject = `Application Update - ${opportunityTitle} at ${company}`;
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>Application Update</h1>
      <p class="tagline">Thank you for your interest</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner error">
      <div class="status-dot"></div>
      <p><strong>Application Status:</strong> Not Selected</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${userName}</strong>,</p>

      <p class="intro-text">
        Thank you for your interest in the <strong>${opportunityTitle}</strong> position at <strong>${company}</strong>.
        After careful consideration, the employer has decided to move forward with other candidates whose qualifications more closely match their current needs.
      </p>

      <!-- Confirmation Details -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">Application Details</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Position</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${opportunityTitle}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Company</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${company}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:6px;">Status</p>
        <span class="badge-rejected">Not Selected</span>
      </div>

      <!-- Encouragement -->
      <p class="section-title">Keep Moving Forward</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">1</div>
          <span><strong style="color:#2C2C2A;">Update your profile</strong> - Add new skills, experiences, and achievements.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span><strong style="color:#2C2C2A;">Explore more opportunities</strong> - New positions are added regularly.</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span><strong style="color:#2C2C2A;">Network with alumni</strong> - Connect with professionals in your field.</span>
        </li>
        <li>
          <div class="step-num">4</div>
          <span><strong style="color:#2C2C2A;">Stay positive</strong> - Every application is valuable experience.</span>
        </li>
      </ul>

      <!-- CTA -->
      <div class="cta-block">
        <p>Your perfect opportunity is out there. Keep searching and stay motivated!</p>
        <a href="https://alumni.apcoer.edu/opportunities" class="cta-button">Explore Opportunities</a>
      </div>

      <!-- Support -->
      <p class="support-line">Need career guidance? Our team is here to support you.</p>
      <p class="support-line">
        Contact career services at <a href="mailto:careers@apcoer.edu.in">careers@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research,Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// OTP Email Template (for password reset, email verification, etc.)
export const getOTPTemplate = (userName, otp, purpose = 'verification') => {
  const subject = `${purpose === 'reset' ? 'Password Reset' : 'Email Verification'} - APCOER Alumni Portal`;
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>${purpose === 'reset' ? 'Password Reset' : 'Email Verification'}</h1>
      <p class="tagline">Secure your account access</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner info">
      <div class="status-dot"></div>
      <p><strong>Action Required:</strong> ${purpose === 'reset' ? 'Reset Your Password' : 'Verify Your Email'}</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${userName}</strong>,</p>

      <p class="intro-text">
        ${purpose === 'reset' 
          ? 'We received a request to reset your password for your APCOER Alumni Portal account. Use the verification code below to proceed with the password reset.'
          : 'We need to verify your email address to ensure the security of your APCOER Alumni Portal account. Use the verification code below to complete the process.'}
      </p>

      <!-- OTP Code -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:30px; text-align:center; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">Verification Code</p>
        <div style="font-size:32px; font-weight:700; color:#1A3A5C; letter-spacing:8px; font-family:'Courier New', monospace;">${otp}</div>
        <p style="font-size:12px; color:#888780; margin-top:16px;">This code will expire in 10 minutes</p>
      </div>

      <!-- Instructions -->
      <p class="section-title">How to use this code</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">1</div>
          <span>Copy the verification code shown above.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span>Return to the ${purpose === 'reset' ? 'password reset' : 'email verification'} page.</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span>Enter the code in the verification field.</span>
        </li>
        <li>
          <div class="step-num">4</div>
          <span>Follow the on-screen instructions to complete the process.</span>
        </li>
      </ul>

      <!-- Security Notice -->
      <div style="background-color:#FEF8EE; border-left:4px solid #D4860A; padding:14px 20px; margin-bottom:28px;">
        <p style="font-size:13px; color:#7A5000; font-weight:500; margin:0;">
          <strong>Security Notice:</strong> Never share this code with anyone. Our team will never ask for your verification code.
        </p>
      </div>

      <!-- Support -->
      <p class="support-line">Didn't request this? Your account might be at risk.</p>
      <p class="support-line">
        Contact security immediately at <a href="mailto:security@apcoer.edu.in">security@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research,Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// Alumni Credentials Email Template
export const getAlumniCredentialsTemplate = (firstName, lastName, email, temporaryPassword) => {
  const subject = 'Your APCOER Alumni Portal Account Credentials';
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>Account Credentials</h1>
      <p class="tagline">Your login details are ready</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner success">
      <div class="status-dot"></div>
      <p><strong>Account Status:</strong> Ready for Login</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${firstName} ${lastName}</strong>,</p>

      <p class="intro-text">
        Your APCOER Alumni Portal account has been created successfully! Below are your login credentials.
        Please keep this information secure and change your password after your first login.
      </p>

      <!-- Credentials Card -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">Login Credentials</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Email Address</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${email}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Temporary Password</p>
        <p style="font-size:18px; font-weight:600; color:#1A3A5C; font-family:'Courier New', monospace; letter-spacing:2px; background-color:#FFFFFF; padding:8px 12px; border:1px solid #E0DDD6; border-radius:4px; display:inline-block;">${temporaryPassword}</p>
      </div>

      <!-- Security Notice -->
      <div style="background-color:#FEF8EE; border-left:4px solid #D4860A; padding:14px 20px; margin-bottom:28px;">
        <p style="font-size:13px; color:#7A5000; font-weight:500; margin:0;">
          <strong>Important:</strong> Please change your password immediately after logging in for the first time.
        </p>
      </div>

      <!-- Next Steps -->
      <p class="section-title">Getting Started</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">1</div>
          <span><strong style="color:#2C2C2A;">Log in</strong> using the credentials provided above.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span><strong style="color:#2C2C2A;">Change your password</strong> to something secure and memorable.</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span><strong style="color:#2C2C2A;">Complete your profile</strong> with your professional information.</span>
        </li>
        <li>
          <div class="step-num">4</div>
          <span><strong style="color:#2C2C2A;">Start networking</strong> with fellow APCOER alumni.</span>
        </li>
      </ul>

      <!-- CTA -->
      <div class="cta-block">
        <p>Your alumni journey begins now! Log in to access all features and connect with your peers.</p>
        <a href="https://alumni.apcoer.edu/login" class="cta-button">Log In Now</a>
      </div>

      <!-- Support -->
      <p class="support-line">Need help accessing your account? Our support team is ready to assist.</p>
      <p class="support-line">
        Contact us at <a href="mailto:support@apcoer.edu.in">support@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research,Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// Coordinator Approval Email Template
export const getCoordinatorApprovalTemplate = (firstName, lastName) => {
  const subject = '🎉 Your Alumni Account Has Been Approved - APCOER Alumni Network';
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>Account Approved</h1>
      <p class="tagline">Welcome to the APCOER Alumni Community</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner success">
      <div class="status-dot"></div>
      <p><strong>Account Status:</strong> Approved</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${firstName} ${lastName}</strong>,</p>

      <p class="intro-text">
        Great news! Your alumni account has been approved by the coordinator. 
        You can now login to the APCOER Alumni Network and connect with fellow graduates.
      </p>

      <!-- Confirmation Details -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">Account Details</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Full Name</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${firstName} ${lastName}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Account Status</p>
        <span class="badge-approved">Approved</span>
      </div>

      <!-- Next Steps -->
      <p class="section-title">What can you do now?</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">1</div>
          <span><strong style="color:#2C2C2A;">Log in</strong> to your account using your registered email and password.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span><strong style="color:#2C2C2A;">Complete your profile</strong> with your professional details, achievements, and interests.</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span><strong style="color:#2C2C2A;">Connect with alumni</strong> - search and network with fellow graduates.</span>
        </li>
        <li>
          <div class="step-num">4</div>
          <span><strong style="color:#2C2C2A;">Explore opportunities</strong> - access job postings, events, and alumni resources.</span>
        </li>
      </ul>

      <!-- CTA -->
      <div class="cta-block">
        <p>Your alumni journey begins now! Log in to start connecting and exploring.</p>
        <a href="https://alumni.apcoer.edu/login" class="cta-button">Log In to Portal</a>
      </div>

      <!-- Support -->
      <p class="support-line">Need help getting started? Our support team is here for you.</p>
      <p class="support-line">
        Contact us at <a href="mailto:support@apcoer.edu.in">support@apcoer.edu.in</a> for any assistance.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research,Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// Rejection Email Template (for account rejection)
export const getRejectionTemplate = (firstName, lastName) => {
  const subject = 'Registration Update - APCOER Alumni Portal';
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>Registration Update</h1>
      <p class="tagline">Regarding your registration request</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner error">
      <div class="status-dot"></div>
      <p><strong>Registration Status:</strong> Not Approved</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${firstName} ${lastName}</strong>,</p>

      <p class="intro-text">
        Thank you for your interest in joining the APCOER Alumni Portal. After careful review of your registration,
        we regret to inform you that we are unable to approve your application at this time.
      </p>

      <!-- Information -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">Registration Details</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Full Name</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${firstName} ${lastName}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Application Date</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:6px;">Status</p>
        <span class="badge-rejected">Not Approved</span>
      </div>

      <!-- Next Steps -->
      <p class="section-title">What You Can Do</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">1</div>
          <span><strong style="color:#2C2C2A;">Review your information</strong> - Ensure all details were accurate.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span><strong style="color:#2C2C2A;">Contact us</strong> - If you believe this was an error, reach out to our team.</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span><strong style="color:#2C2C2A;">Reapply</strong> - You may submit a new registration with updated information.</span>
        </li>
      </ul>

      <!-- Support -->
      <p class="support-line">We understand this may be disappointing. Our team is here to help.</p>
      <p class="support-line">
        Contact us at <a href="mailto:support@apcoer.edu.in">support@apcoer.edu.in</a> for clarification or assistance.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research,Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// Event Notification Email Template
const getEventNotificationTemplate = (eventData) => {
  const { 
    recipientName = 'Alumni Member', 
    eventTitle = 'Event', 
    eventDate = 'TBD', 
    eventTime = 'TBD',
    eventDescription = 'No description available',
    location = 'APCOER Campus',
    eventMode = 'Offline'
  } = eventData;
  
  const subject = `🎉 New Event: ${eventTitle}`;
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>Upcoming Event</h1>
      <p class="tagline">Join us for an exciting alumni gathering</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner info">
      <div class="status-dot"></div>
      <p><strong>Event Status:</strong> Open for Registration</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${recipientName}</strong>,</p>

      <p class="intro-text">
        We're excited to invite you to an upcoming alumni event! Connect with fellow graduates, 
        share experiences, and strengthen your professional network.
      </p>

      <!-- Event Details -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">Event Details</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Event Name</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${eventTitle}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Date & Time</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${eventDate} at ${eventTime}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Location</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${location}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:6px;">Description</p>
        <p style="font-size:14px; color:#5F5E5A; line-height:1.6;">${eventDescription}</p>
      </div>

      <!-- Why Attend -->
      <p class="section-title">Why You Should Attend</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">🤝</div>
          <span><strong style="color:#2C2C2A;">Network</strong> with alumni from different batches and industries.</span>
        </li>
        <li>
          <div class="step-num">💼</div>
          <span><strong style="color:#2C2C2A;">Discover</strong> career opportunities and business collaborations.</span>
        </li>
        <li>
          <div class="step-num">📚</div>
          <span><strong style="color:#2C2C2A;">Learn</strong> from industry experts and successful alumni.</span>
        </li>
        <li>
          <div class="step-num">🎯</div>
          <span><strong style="color:#2C2C2A;">Contribute</strong> to the growth of our alumni community.</span>
        </li>
      </ul>

      <!-- CTA -->
      <div class="cta-block">
        <p>Don't miss this opportunity to reconnect and grow with your alumni family!</p>
        <a href="https://alumni.apcoer.edu/events" class="cta-button">Register Now</a>
      </div>

      <!-- Support -->
      <p class="support-line">Questions about the event? We'd love to hear from you.</p>
      <p class="support-line">
        Contact the events team at <a href="mailto:events@apcoer.edu.in">events@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research,Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// Event Rejection Email Template
const getEventRejectionTemplate = (eventData) => {
  const subject = `Event Rejected: ${eventData.eventTitle}`;
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>Event Update</h1>
      <p class="tagline">Regarding your event submission</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner error">
      <div class="status-dot"></div>
      <p><strong>Event Status:</strong> Rejected</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${eventData.recipientName}</strong>,</p>

      <p class="intro-text">
        We regret to inform you that your event submission "<strong>${eventData.eventTitle}</strong>" has been reviewed and rejected.
      </p>

      <!-- Event Details -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">Event Details</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Event Name</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${eventData.eventTitle}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:6px;">Status</p>
        <span class="badge-rejected">Rejected</span>
      </div>

      <!-- Rejection Reason -->
      <div style="background-color:#FEF8EE; border-left:4px solid #D4860A; padding:14px 20px; margin-bottom:28px;">
        <p style="font-size:13px; color:#7A5000; font-weight:500; margin:0;">
          <strong>Reason for Rejection:</strong> ${eventData.rejectionReason || 'The event does not meet our community guidelines or requirements.'}
        </p>
      </div>

      <!-- Next Steps -->
      <p class="section-title">What You Can Do</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">1</div>
          <span><strong style="color:#2C2C2A;">Review feedback</strong> - Consider the reasons provided for the rejection.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span><strong style="color:#2C2C2A;">Make improvements</strong> - Address the issues mentioned in the feedback.</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span><strong style="color:#2C2C2A;">Resubmit</strong> - Submit a revised event proposal when ready.</span>
        </li>
      </ul>

      <!-- Support -->
      <p class="support-line">Questions about the decision? We're here to help.</p>
      <p class="support-line">
        Contact the events team at <a href="mailto:events@apcoer.edu.in">events@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research,Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// Event Approval Email Template
const getEventApprovalTemplate = (eventData) => {
  const subject = `Event Approved: ${eventData.title}`;
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>Event Approved!</h1>
      <p class="tagline">Your event is now live</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner success">
      <div class="status-dot"></div>
      <p><strong>Event Status:</strong> Approved</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${eventData.author_name}</strong>,</p>

      <p class="intro-text">
        Great news! Your event has been reviewed and approved by our admin team. 
        Your event is now live and visible to all alumni members.
      </p>

      <!-- Event Details -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">Event Details</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Event Title</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${eventData.title}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Date</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${new Date(eventData.event_date).toLocaleDateString()}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Time</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${new Date(eventData.event_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Location</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${eventData.location}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Mode</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${eventData.event_mode || 'In-Person'}</p>
      </div>

      <!-- Next Steps -->
      <p class="section-title">What happens next?</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">1</div>
          <span>Alumni members can now view and register for your event.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span>You'll receive notifications when someone registers.</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span>Manage your event through the alumni portal dashboard.</span>
        </li>
      </ul>

      <!-- CTA -->
      <div class="cta-block">
        <p>View your live event and manage registrations.</p>
        <a href="https://alumni.apcoer.edu/alumni/events" class="cta-button">View Your Event</a>
      </div>

      <!-- Support -->
      <p class="support-line">Need help managing your event? Our team is here to assist.</p>
      <p class="support-line">
        Contact the events team at <a href="mailto:events@apcoer.edu.in">events@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research,Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// News Notification Email Template
export const getNewsNotificationTemplate = (news, loginUrl) => {
  const subject = `New News Update: ${news.title}`;
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>Latest News</h1>
      <p class="tagline">Stay updated with APCOER Alumni</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner info">
      <div class="status-dot"></div>
      <p><strong>News Type:</strong> ${news.category || 'General Update'}</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear Alumni Member,</p>

      <p class="intro-text">
        We're excited to share the latest news and updates from the APCOER Alumni community.
      </p>

      <!-- News Details -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">Article Details</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Title</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${news.title}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Author</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${news.author_name || 'APCOER Alumni Team'}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Published On</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${new Date(news.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:6px;">Preview</p>
        <p style="font-size:14px; color:#5F5E5A; line-height:1.6;">${news.short_content ? news.short_content.substring(0, 200) + '...' : news.full_content ? news.full_content.substring(0, 200) + '...' : 'No preview available'}</p>
      </div>

      <!-- CTA -->
      <div class="cta-block">
        <p>Read the full article to stay informed about the latest developments.</p>
        <a href="${loginUrl}" class="cta-button">Read Full Article</a>
      </div>

      <!-- Support -->
      <p class="support-line">Have news to share? We'd love to hear from you.</p>
      <p class="support-line">
        Contact us at <a href="mailto:support@apcoer.edu.in">support@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research,Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// Opportunity Approval Email Template
const getOpportunityApprovalTemplate = (opportunity) => {
  const subject = `Opportunity Approved: ${opportunity.title}`;
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>Opportunity Approved!</h1>
      <p class="tagline">Your opportunity is now live</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner success">
      <div class="status-dot"></div>
      <p><strong>Opportunity Status:</strong> Approved</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${opportunity.author_name}</strong>,</p>

      <p class="intro-text">
        Great news! Your opportunity has been reviewed and approved by our admin team. 
        Your opportunity is now live and visible to all alumni members.
      </p>

      <!-- Opportunity Details -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">Opportunity Details</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Job Title</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${opportunity.title}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Company</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${opportunity.company}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Location</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${opportunity.location}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Employment Type</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${opportunity.employment_type}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Application Deadline</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${new Date(opportunity.application_deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <!-- Next Steps -->
      <p class="section-title">What happens next?</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">1</div>
          <span>Alumni members can now view and apply for your opportunity.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span>You'll receive notifications when someone applies.</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span>Review applications and contact qualified candidates.</span>
        </li>
      </ul>

      <!-- CTA -->
      <div class="cta-block">
        <p>View your live opportunity and manage applications.</p>
        <a href="https://alumni.apcoer.edu/alumni/opportunities" class="cta-button">View Your Opportunity</a>
      </div>

      <!-- Support -->
      <p class="support-line">Need help managing your opportunity? Our team is here to assist.</p>
      <p class="support-line">
        Contact the opportunities team at <a href="mailto:opportunities@apcoer.edu.in">opportunities@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research,Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// Opportunity Rejection Email Template
const getOpportunityRejectionTemplate = (opportunity) => {
  const subject = `Opportunity Rejected: ${opportunity.title}`;
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>Opportunity Update</h1>
      <p class="tagline">Regarding your opportunity submission</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner error">
      <div class="status-dot"></div>
      <p><strong>Opportunity Status:</strong> Rejected</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${opportunity.author_name}</strong>,</p>

      <p class="intro-text">
        We regret to inform you that your opportunity submission "<strong>${opportunity.title}</strong>" has been reviewed and rejected.
      </p>

      <!-- Opportunity Details -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">Opportunity Details</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Job Title</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${opportunity.title}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Company</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${opportunity.company}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:6px;">Status</p>
        <span class="badge-rejected">Rejected</span>
      </div>

      <!-- Rejection Reason -->
      <div style="background-color:#FEF8EE; border-left:4px solid #D4860A; padding:14px 20px; margin-bottom:28px;">
        <p style="font-size:13px; color:#7A5000; font-weight:500; margin:0;">
          <strong>Reason for Rejection:</strong> ${opportunity.rejectionReason || 'The opportunity does not meet our community guidelines or requirements.'}
        </p>
      </div>

      <!-- Next Steps -->
      <p class="section-title">What You Can Do</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">1</div>
          <span><strong style="color:#2C2C2A;">Review feedback</strong> - Consider the reasons provided for the rejection.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span><strong style="color:#2C2C2A;">Make improvements</strong> - Address the issues mentioned in the feedback.</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span><strong style="color:#2C2C2A;">Resubmit</strong> - Submit a revised opportunity proposal when ready.</span>
        </li>
      </ul>

      <!-- Support -->
      <p class="support-line">Questions about the decision? We're here to help.</p>
      <p class="support-line">
        Contact the opportunities team at <a href="mailto:opportunities@apcoer.edu.in">opportunities@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research,Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// Alumni Opportunity Notification Email Template
const getAlumniOpportunityNotificationTemplate = (opportunity, loginUrl) => {
  const subject = `New Opportunity: ${opportunity.title} at ${opportunity.company}`;
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>New Career Opportunity</h1>
      <p class="tagline">Advance your career with APCOER Alumni</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner success">
      <div class="status-dot"></div>
      <p><strong>Opportunity Status:</strong> Now Accepting Applications</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear Alumni Member,</p>

      <p class="intro-text">
        We're excited to share a new career opportunity that matches your professional profile. 
        This exclusive opportunity is available only to APCOER alumni.
      </p>

      <!-- Opportunity Card -->
      <div class="opportunity-card">
        <div class="opportunity-header">Opportunity Details</div>
        <div class="opportunity-body">
          <h3 class="opportunity-title">${opportunity.title}</h3>
          <p class="opportunity-company">${opportunity.company}</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0;">
            <div>
              <p style="font-size:13px; color:#888780; margin-bottom:4px;">Location</p>
              <p style="font-size:15px; font-weight:500; color:#2C2C2A;">📍 ${opportunity.location}</p>
            </div>
            <div>
              <p style="font-size:13px; color:#888780; margin-bottom:4px;">Employment Type</p>
              <p style="font-size:15px; font-weight:500; color:#2C2C2A;">💼 ${opportunity.employment_type || opportunity.job_type || 'Not specified'}</p>
            </div>
            <div>
              <p style="font-size:13px; color:#888780; margin-bottom:4px;">Experience Level</p>
              <p style="font-size:15px; font-weight:500; color:#2C2C2A;">📊 ${opportunity.experience_level || opportunity.experience || 'Not specified'}</p>
            </div>
            <div>
              <p style="font-size:13px; color:#888780; margin-bottom:4px;">Application Deadline</p>
              <p style="font-size:15px; font-weight:500; color:#2C2C2A;">⏰ ${opportunity.application_deadline ? new Date(opportunity.application_deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified'}</p>
            </div>
          </div>
          
          <p class="opportunity-description">${opportunity.description}</p>
        </div>
      </div>

      <!-- Why Apply -->
      <p class="section-title">Why This Opportunity?</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">🎯</div>
          <span><strong style="color:#2C2C2A;">Perfect Match</strong> - Aligned with your skills and experience.</span>
        </li>
        <li>
          <div class="step-num">🤝</div>
          <span><strong style="color:#2C2C2A;">Alumni Network</strong> - Connect with APCOER graduates in the company.</span>
        </li>
        <li>
          <div class="step-num">📈</div>
          <span><strong style="color:#2C2C2A;">Career Growth</strong> - Excellent opportunities for professional development.</span>
        </li>
      </ul>

      <!-- CTA -->
      <div class="cta-block">
        <p>Don't miss this exclusive opportunity! Apply now to take the next step in your career.</p>
        <a href="${loginUrl}" class="cta-button">Apply Now</a>
      </div>

      <!-- Support -->
      <p class="support-line">Need help with your application? We're here to assist.</p>
      <p class="support-line">
        Contact career services at <a href="mailto:careers@apcoer.edu.in">careers@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research,Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// Admin Event Notification Email Template
const getAdminEventNotificationTemplate = (eventData) => {
  const subject = `New Event Submitted: ${eventData.title}`;
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>New Event Submission</h1>
      <p class="tagline">Review and approve new event</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner info">
      <div class="status-dot"></div>
      <p><strong>Action Required:</strong> Event Review Needed</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear Admin,</p>

      <p class="intro-text">
        A new event has been submitted by an alumni member and requires your review and approval.
      </p>

      <!-- Event Details -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">Event Details</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Event Title</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${eventData.title}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Submitted By</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${eventData.author_name}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Date & Time</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${new Date(eventData.event_date).toLocaleDateString()} at ${new Date(eventData.event_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Location</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${eventData.location}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Mode</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${eventData.event_mode || 'In-Person'}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:6px;">Description</p>
        <p style="font-size:14px; color:#5F5E5A; line-height:1.6;">${eventData.description ? eventData.description.substring(0, 300) + '...' : 'No description provided'}</p>
      </div>

      <!-- Review Actions -->
      <p class="section-title">Review Actions</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">1</div>
          <span><strong style="color:#2C2C2A;">Review content</strong> - Check for appropriateness and completeness.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span><strong style="color:#2C2C2A;">Verify details</strong> - Ensure event information is accurate.</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span><strong style="color:#2C2C2A;">Approve or reject</strong> - Make your decision and notify the submitter.</span>
        </li>
      </ul>

      <!-- CTA -->
      <div class="cta-block">
        <p>Review the event submission and take appropriate action.</p>
        <a href="https://alumni.apcoer.edu/admin/events" class="cta-button">Review Event</a>
      </div>

      <!-- Support -->
      <p class="support-line">Questions about event submissions? Contact the team.</p>
      <p class="support-line">
        Email: <a href="mailto:admin@apcoer.edu.in">admin@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research,Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// Admin Opportunity Notification Email Template
const getAdminOpportunityNotificationTemplate = (opportunityData) => {
  const subject = `New Opportunity Submitted: ${opportunityData.title}`;
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>New Opportunity Submission</h1>
      <p class="tagline">Review and approve new opportunity</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner info">
      <div class="status-dot"></div>
      <p><strong>Action Required:</strong> Opportunity Review Needed</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear Admin,</p>

      <p class="intro-text">
        A new career opportunity has been submitted by an alumni member and requires your review and approval.
      </p>

      <!-- Opportunity Details -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">Opportunity Details</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Job Title</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${opportunityData.title}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Company</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${opportunityData.company}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Submitted By</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${opportunityData.author_name}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Location</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${opportunityData.location}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Employment Type</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${opportunityData.employment_type}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Application Deadline</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${new Date(opportunityData.application_deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:6px;">Description</p>
        <p style="font-size:14px; color:#5F5E5A; line-height:1.6;">${opportunityData.description ? opportunityData.description.substring(0, 300) + '...' : 'No description provided'}</p>
      </div>

      <!-- Review Actions -->
      <p class="section-title">Review Actions</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">1</div>
          <span><strong style="color:#2C2C2A;">Review content</strong> - Check for appropriateness and completeness.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span><strong style="color:#2C2C2A;">Verify details</strong> - Ensure opportunity information is accurate.</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span><strong style="color:#2C2C2A;">Approve or reject</strong> - Make your decision and notify the submitter.</span>
        </li>
      </ul>

      <!-- CTA -->
      <div class="cta-block">
        <p>Review the opportunity submission and take appropriate action.</p>
        <a href="https://alumni.apcoer.edu/admin/opportunities" class="cta-button">Review Opportunity</a>
      </div>

      <!-- Support -->
      <p class="support-line">Questions about opportunity submissions? Contact the team.</p>
      <p class="support-line">
        Email: <a href="mailto:admin@apcoer.edu.in">admin@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research,Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// Forget Password OTP Email Template
export const getForgetPasswordOTPTemplate = ({ userName, otp }) => {
  const subject = 'Password Reset OTP - APCOER Alumni Portal';
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>Password Reset</h1>
      <p class="tagline">Secure your account access</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner info">
      <div class="status-dot"></div>
      <p><strong>Action Required:</strong> Reset Your Password</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear ${userName},</p>

      <p class="intro-text">
        We received a request to reset your password for your APCOER Alumni Portal account. 
        Use the verification code below to proceed with the password reset.
      </p>

      <!-- OTP Code -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:30px; text-align:center; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">Password Reset Code</p>
        <div style="font-size:32px; font-weight:700; color:#1A3A5C; letter-spacing:8px; font-family:'Courier New', monospace;">${otp}</div>
        <p style="font-size:12px; color:#888780; margin-top:16px;">This code will expire in 10 minutes</p>
      </div>

      <!-- Instructions -->
      <p class="section-title">How to reset your password</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">1</div>
          <span>Copy the password reset code shown above.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span>Return to the password reset page.</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span>Enter the code in the verification field.</span>
        </li>
        <li>
          <div class="step-num">4</div>
          <span>Create your new password.</span>
        </li>
      </ul>

      <!-- Security Notice -->
      <div style="background-color:#FEF8EE; border-left:4px solid #D4860A; padding:14px 20px; margin-bottom:28px;">
        <p style="font-size:13px; color:#7A5000; font-weight:500; margin:0;">
          <strong>Security Notice:</strong> Never share this code with anyone. Our team will never ask for your password reset code.
        </p>
      </div>

      <!-- Support -->
      <p class="support-line">Didn't request this password reset? Your account might be at risk.</p>
      <p class="support-line">
        Contact security immediately at <a href="mailto:security@apcoer.edu.in">security@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research,Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// 10. Account Approved Template
export const getAccountApprovedTemplate = (userName, loginUrl = null) => {
  const subject = 'Registration Approved – Welcome to APCOER Alumni Portal';
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>Registration Approved!</h1>
      <p class="tagline">Welcome to the APCOER Alumni Community</p>
    </div>

    <!-- Success Banner -->
    <div class="status-banner success">
      <div class="status-dot"></div>
      <p><strong>Application Status:</strong> Approved</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${userName}</strong>,</p>

      <p class="intro-text">
        Congratulations! Your registration with the APCOER Alumni Portal has been <strong style="color:#0D7C0D;">approved</strong>. 
        You now have full access to connect with fellow alumni, access exclusive opportunities, and stay connected with your alma mater.
      </p>

      <!-- Next Steps -->
      <p class="section-title">What's next?</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">1</div>
          <span><strong style="color:#2C2C2A;">Log In</strong> - Access your account using your registered email.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span><strong style="color:#2C2C2A;">Complete Profile</strong> - Add your professional details and achievements.</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span><strong style="color:#2C2C2A;">Network</strong> - Connect with fellow alumni and explore opportunities.</span>
        </li>
      </ul>

      <!-- CTA Button -->
      ${loginUrl ? `
      <div class="cta-block">
        <p>Ready to get started? Log in to your account now.</p>
        <a href="${loginUrl}" class="cta-button">Log In to Portal</a>
      </div>
      ` : ''}

      <!-- Support -->
      <p class="support-line">Questions? Need help getting started?</p>
      <p class="support-line">
        Contact us at <a href="mailto:support@apcoer.edu.in">support@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research, Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// 11. Account Rejected Template
export const getAccountRejectedTemplate = (userName, rejectionReason = null) => {
  const subject = 'Registration Update – APCOER Alumni Portal';
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>Registration Update</h1>
      <p class="tagline">Regarding your APCOER Alumni Portal application</p>
    </div>

    <!-- Status Banner -->
    <div class="status-banner warning">
      <div class="status-dot"></div>
      <p><strong>Application Status:</strong> Requires Attention</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${userName}</strong>,</p>

      <p class="intro-text">
        Thank you for your interest in joining the APCOER Alumni Portal. After careful review of your application, 
        we need some additional information or clarification before we can approve your registration.
      </p>

      ${rejectionReason ? `
      <!-- Reason Section -->
      <div style="background-color:#FFF4E6; border-radius:10px; padding:20px 24px; margin-bottom:28px; border-left:4px solid #FF9800;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#E65100; margin-bottom:16px;">Review Notes</p>
        <p style="font-size:15px; color:#2C2C2A; line-height:1.6;">${rejectionReason}</p>
      </div>
      ` : ''}

      <!-- Next Steps -->
      <p class="section-title">What you can do:</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">1</div>
          <span><strong style="color:#2C2C2A;">Review Feedback</strong> - Check the notes above for specific requirements.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span><strong style="color:#2C2C2A;">Update Information</strong> - Submit a new registration with corrected details.</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span><strong style="color:#2C2C2A;">Contact Support</strong> - Reach out if you need assistance.</span>
        </li>
      </ul>

      <!-- Support -->
      <p class="support-line">We're here to help you complete your registration.</p>
      <p class="support-line">
        Contact us at <a href="mailto:support@apcoer.edu.in">support@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research, Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// 12. Account Created Template
export const getAccountCreatedTemplate = (userName, userEmail, temporaryPassword = null, loginUrl = null) => {
  const subject = 'Account Created – APCOER Alumni Portal';
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>Account Created</h1>
      <p class="tagline">Welcome to the APCOER Alumni Community</p>
    </div>

    <!-- Success Banner -->
    <div class="status-banner success">
      <div class="status-dot"></div>
      <p><strong>Account Status:</strong> Created Successfully</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${userName}</strong>,</p>

      <p class="intro-text">
        An account has been created for you on the APCOER Alumni Portal! You can now access our exclusive alumni network 
        and connect with fellow graduates.
      </p>

      <!-- Account Details -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">Account Details</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Full Name</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${userName}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Email Address</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${userEmail}</p>

        ${temporaryPassword ? `
        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Temporary Password</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px; font-family: monospace; background: #fff; padding: 8px; border-radius: 4px;">${temporaryPassword}</p>
        ` : ''}
      </div>

      <!-- Next Steps -->
      <p class="section-title">Getting Started:</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">1</div>
          <span><strong style="color:#2C2C2A;">Log In</strong> - Use your email and the provided password.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span><strong style="color:#2C2C2A;">Change Password</strong> - Set your own secure password.</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span><strong style="color:#2C2C2A;">Complete Profile</strong> - Add your professional information.</span>
        </li>
      </ul>

      <!-- CTA Button -->
      ${loginUrl ? `
      <div class="cta-block">
        <p>Access your account now:</p>
        <a href="${loginUrl}" class="cta-button">Log In to Portal</a>
      </div>
      ` : ''}

      <!-- Support -->
      <p class="support-line">Need help? Contact our support team.</p>
      <p class="support-line">
        Email: <a href="mailto:support@apcoer.edu.in">support@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research, Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// 13. Coordinator Account Created Template
export const getCoordinatorAccountCreatedTemplate = (userName, userEmail, temporaryPassword = null, loginUrl = null) => {
  const subject = 'Coordinator Account Created – APCOER Alumni Portal';
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>Coordinator Account Created</h1>
      <p class="tagline">Welcome to the APCOER Alumni Team</p>
    </div>

    <!-- Success Banner -->
    <div class="status-banner success">
      <div class="status-dot"></div>
      <p><strong>Account Status:</strong> Coordinator Account Created</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${userName}</strong>,</p>

      <p class="intro-text">
        A coordinator account has been created for you on the APCOER Alumni Portal. You now have administrative privileges 
        to manage alumni activities, events, and communications.
      </p>

      <!-- Account Details -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">Coordinator Account Details</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Full Name</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${userName}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Email Address</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${userEmail}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Role</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">Coordinator</p>

        ${temporaryPassword ? `
        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Temporary Password</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px; font-family: monospace; background: #fff; padding: 8px; border-radius: 4px;">${temporaryPassword}</p>
        ` : ''}
      </div>

      <!-- Coordinator Features -->
      <p class="section-title">Your Coordinator Privileges:</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">👥</div>
          <span><strong style="color:#2C2C2A;">Manage Alumni</strong> - Approve registrations and manage profiles.</span>
        </li>
        <li>
          <div class="step-num">📅</div>
          <span><strong style="color:#2C2C2A;">Events</strong> - Create and manage alumni events.</span>
        </li>
        <li>
          <div class="step-num">💼</div>
          <span><strong style="color:#2C2C2A;">Opportunities</strong> - Post job and collaboration opportunities.</span>
        </li>
        <li>
          <div class="step-num">📢</div>
          <span><strong style="color:#2C2C2A;">Communications</strong> - Send announcements and newsletters.</span>
        </li>
      </ul>

      <!-- CTA Button -->
      ${loginUrl ? `
      <div class="cta-block">
        <p>Access your coordinator dashboard:</p>
        <a href="${loginUrl}" class="cta-button">Log In to Dashboard</a>
      </div>
      ` : ''}

      <!-- Support -->
      <p class="support-line">Questions about your coordinator role?</p>
      <p class="support-line">
        Contact admin at <a href="mailto:admin@apcoer.edu.in">admin@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research, Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// 14. Content Approved Template
export const getContentApprovedTemplate = (userName, contentType, contentTitle, contentUrl = null) => {
  const subject = `${contentType} Approved - APCOER Alumni Portal`;
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>${contentType} Approved!</h1>
      <p class="tagline">Your content is now live on the portal</p>
    </div>

    <!-- Success Banner -->
    <div class="status-banner success">
      <div class="status-dot"></div>
      <p><strong>Status:</strong> ${contentType} Approved</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${userName}</strong>,</p>

      <p class="intro-text">
        Great news! Your ${contentType.toLowerCase()} "<strong>${contentTitle}</strong>" has been reviewed and approved 
        by our admin team. It is now live on the APCOER Alumni Portal.
      </p>

      <!-- Content Details -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">Content Details</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">${contentType} Title</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${contentTitle}</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Status</p>
        <span style="background-color:#E8F5E8; color:#0D7C0D; border:1px solid #4CAF50; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600;">Approved & Published</span>
      </div>

      <!-- Next Steps -->
      <p class="section-title">What happens now:</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">1</div>
          <span><strong style="color:#2C2C2A;">Live on Portal</strong> - Alumni can now see and engage with your content.</span>
        </li>
        <li>
          <div class="step-num">2</div>
          <span><strong style="color:#2C2C2A;">Notifications Sent</strong> - Relevant alumni have been notified.</span>
        </li>
        <li>
          <div class="step-num">3</div>
          <span><strong style="color:#2C2C2A;">Track Engagement</strong> - Monitor views and responses in your dashboard.</span>
        </li>
      </ul>

      <!-- CTA Button -->
      ${contentUrl ? `
      <div class="cta-block">
        <p>View your ${contentType.toLowerCase()} on the portal:</p>
        <a href="${contentUrl}" class="cta-button">View ${contentType}</a>
      </div>
      ` : ''}

      <!-- Support -->
      <p class="support-line">Need to make changes to your content?</p>
      <p class="support-line">
        Contact support at <a href="mailto:support@apcoer.edu.in">support@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research, Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// 15. Content Notification Template
export const getContentNotificationTemplate = (userName, contentType, contentData, contentUrl = null) => {
  const subject = `New ${contentType} - APCOER Alumni Portal`;
  
  const content = `
    <!-- Header -->
    <div class="header">
      <p class="institution">APCOER Alumni Portal</p>
      <h1>New ${contentType}!</h1>
      <p class="tagline">Exciting update from your alumni community</p>
    </div>

    <!-- Info Banner -->
    <div class="status-banner info">
      <div class="status-dot"></div>
      <p><strong>New Content:</strong> ${contentType} Published</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">Dear <strong>${userName}</strong>,</p>

      <p class="intro-text">
        We're excited to share a new ${contentType.toLowerCase()} from the APCOER Alumni community!
      </p>

      <!-- Content Details -->
      <div style="background-color:#F4F1EC; border-radius:10px; padding:20px 24px; margin-bottom:28px;">
        <p style="font-size:11px; font-weight:600; letter-spacing:1.8px; text-transform:uppercase; color:#888780; margin-bottom:16px;">${contentType} Details</p>

        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Title</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${contentData.title || 'New ' + contentType}</p>

        ${contentData.description ? `
        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Description</p>
        <p style="font-size:15px; color:#2C2C2A; margin-bottom:14px; line-height:1.6;">${contentData.description}</p>
        ` : ''}

        ${contentData.date ? `
        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Date</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${contentData.date}</p>
        ` : ''}

        ${contentData.location ? `
        <p style="font-size:13px; color:#888780; margin-bottom:2px;">Location</p>
        <p style="font-size:15px; font-weight:500; color:#2C2C2A; margin-bottom:14px;">${contentData.location}</p>
        ` : ''}
      </div>

      <!-- CTA Button -->
      ${contentUrl ? `
      <div class="cta-block">
        <p>Don't miss out! View this ${contentType.toLowerCase()}:</p>
        <a href="${contentUrl}" class="cta-button">View ${contentType}</a>
      </div>
      ` : ''}

      <!-- Engagement -->
      <p class="section-title">Stay Connected:</p>
      <ul class="steps-list">
        <li>
          <div class="step-num">👁️</div>
          <span><strong style="color:#2C2C2A;">View Details</strong> - Check out the full information on the portal.</span>
        </li>
        <li>
          <div class="step-num">💬</div>
          <span><strong style="color:#2C2C2A;">Engage</strong> - Comment, share, or participate as applicable.</span>
        </li>
        <li>
          <div class="step-num">🔔</div>
          <span><strong style="color:#2C2C2A;">Stay Updated</strong> - Keep your notification preferences updated.</span>
        </li>
      </ul>

      <!-- Support -->
      <p class="support-line">Questions about this ${contentType.toLowerCase()}?</p>
      <p class="support-line">
        Contact us at <a href="mailto:support@apcoer.edu.in">support@apcoer.edu.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-name">APCOER Alumni Team</p>
      <p class="footer-sub">Anantrao Pawar College Of Engineering & Research, Pune</p>
      <hr class="footer-divider"/>
      <p class="footer-legal">
        This is an automated message — please do not reply directly to this email.<br/>
        &copy; 2025 APCOER Alumni Portal &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
      </p>
    </div>
  `;

  return { subject, html: getBaseTemplate(content) };
};

// Export all email templates
export {
  getBaseTemplate,
  getBaseStyles,
  getOpportunityApprovalTemplate,
  getAlumniOpportunityNotificationTemplate,
  getEventApprovalTemplate,
  getEventNotificationTemplate
};

export default {
  getRegistrationPendingTemplate,
  getAccountApprovedTemplate,
  getAccountRejectedTemplate,
  getAccountCreatedTemplate,
  getCoordinatorAccountCreatedTemplate,
  getOTPTemplate,
  getContentApprovedTemplate,
  getContentNotificationTemplate,
  getNewsNotificationTemplate,
  getOpportunityApprovalTemplate,
  getAlumniOpportunityNotificationTemplate
};
