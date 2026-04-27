// Application Accepted Email Template
const getApplicationAcceptedTemplate = (userName, opportunityTitle, company, opportunityDescription) => {
  const subject = `Application Accepted - ${opportunityTitle} at ${company}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Accepted</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #e74c3c;
        }
        .header h1 {
          color: #2c3e50;
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 20px 0;
        }
        .opportunity-details {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #28a745;
        }
        .opportunity-details h3 {
          color: #2c3e50;
          margin-top: 0;
          font-size: 20px;
        }
        .opportunity-details p {
          margin-bottom: 10px;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background-color: #28a745;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .congratulations {
          background-color: #d4edda;
          color: #155724;
          padding: 15px;
          border-radius: 5px;
          border: 1px solid #c3e6cb;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Congratulations!</h1>
          <p>Your Application Has Been Accepted</p>
        </div>
        
        <div class="content">
          <p>Dear <strong>${userName}</strong>,</p>
          
          <div class="congratulations">
            <strong>Great news!</strong> Your application for the opportunity mentioned below has been accepted by the employer.
          </div>
          
          <div class="opportunity-details">
            <h3>${opportunityTitle}</h3>
            <p><strong>Company:</strong> ${company}</p>
            <p><strong>Description:</strong></p>
            <p>${opportunityDescription || 'No description provided'}</p>
          </div>
          
          <p>The employer will contact you soon with the next steps regarding this opportunity. Please make sure your contact information is up-to-date in your profile.</p>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Keep your profile updated with current contact information</li>
            <li>Check your email regularly for communication from the employer</li>
            <li>Prepare for potential interviews or further discussions</li>
            <li>Be ready to provide additional documents if requested</li>
          </ul>
          
          <p>If you have any questions about this opportunity, please don't hesitate to reach out to the APCOER Alumni Portal support team.</p>
          
          <p>Best of luck with your career journey!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="btn">
              View Your Dashboard
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>
          APCOER Alumni Portal Team<br>
          <small>This is an automated message. Please do not reply to this email.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// Application Reviewed Email Template
const getApplicationReviewedTemplate = (userName, opportunityTitle, company) => {
  const subject = `Application Under Review - ${opportunityTitle} at ${company}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Under Review</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #007bff;
        }
        .header h1 {
          color: #2c3e50;
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 20px 0;
        }
        .status-info {
          background-color: #d1ecf1;
          color: #0c5460;
          padding: 15px;
          border-radius: 5px;
          border: 1px solid #bee5eb;
          margin: 20px 0;
        }
        .opportunity-details {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #007bff;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Application Under Review</h1>
          <p>Your Application is Being Processed</p>
        </div>
        
        <div class="content">
          <p>Dear <strong>${userName}</strong>,</p>
          
          <div class="status-info">
            <strong>Update:</strong> Your application for the opportunity mentioned below is currently under review by the hiring team.
          </div>
          
          <div class="opportunity-details">
            <h3>${opportunityTitle}</h3>
            <p><strong>Company:</strong> ${company}</p>
          </div>
          
          <p>The hiring team is carefully reviewing your application and qualifications. They will make a decision soon and you will be notified of the outcome.</p>
          
          <p><strong>What happens next:</strong></p>
          <ul>
            <li>Your application will be evaluated by the hiring team</li>
            <li>You may be contacted for additional information or an interview</li>
            <li>You will receive a final decision via email</li>
            <li>This process typically takes 3-7 business days</li>
          </ul>
          
          <p>Thank you for your patience during this review process. We appreciate your interest in this opportunity.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="btn">
              Track Application Status
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>
          APCOER Alumni Portal Team<br>
          <small>This is an automated message. Please do not reply to this email.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// Application Rejected Email Template
const getApplicationRejectedTemplate = (userName, opportunityTitle, company) => {
  const subject = `Application Update - ${opportunityTitle} at ${company}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Update</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #dc3545;
        }
        .header h1 {
          color: #2c3e50;
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 20px 0;
        }
        .status-info {
          background-color: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 5px;
          border: 1px solid #f5c6cb;
          margin: 20px 0;
        }
        .opportunity-details {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #dc3545;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .encouragement {
          background-color: #fff3cd;
          color: #856404;
          padding: 15px;
          border-radius: 5px;
          border: 1px solid #ffeaa7;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📄 Application Update</h1>
          <p>Regarding Your Application</p>
        </div>
        
        <div class="content">
          <p>Dear <strong>${userName}</strong>,</p>
          
          <div class="status-info">
            <strong>Update:</strong> After careful consideration, we regret to inform you that your application for the opportunity mentioned below has not been selected at this time.
          </div>
          
          <div class="opportunity-details">
            <h3>${opportunityTitle}</h3>
            <p><strong>Company:</strong> ${company}</p>
          </div>
          
          <p>This decision was not easy, as we received many qualified applications. The hiring team has decided to move forward with candidates whose qualifications more closely match the specific requirements of this position.</p>
          
          <div class="encouragement">
            <strong>Don't be discouraged!</strong> This is just one opportunity, and there are many others available in the APCOER Alumni Portal. We encourage you to:
          </div>
          
          <p><strong>Next steps:</strong></p>
          <ul>
            <li>Continue browsing and applying to other opportunities</li>
            <li>Update your profile with any new skills or experiences</li>
            <li>Consider reaching out to alumni in your network</li>
            <li>Keep improving your skills and qualifications</li>
          </ul>
          
          <p>We appreciate your interest in this opportunity and wish you the best in your job search. Your application will remain in our system, and you may be considered for future positions that match your profile.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/opportunities" class="btn">
              Explore More Opportunities
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>
          APCOER Alumni Portal Team<br>
          <small>This is an automated message. Please do not reply to this email.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// Registration Pending Email Template
const getRegistrationPendingTemplate = (userName) => {
  const subject = 'Registration Received - APCOER Alumni Portal';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration Received</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e1e5e9;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .message {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .highlight {
          background-color: #fef3c7;
          padding: 15px;
          border-left: 4px solid #f59e0b;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e1e5e9;
          font-size: 14px;
          color: #6b7280;
        }
        .status-badge {
          display: inline-block;
          background-color: #fef3c7;
          color: #92400e;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎓 APCOER Alumni Portal</div>
        </div>
        
        <div class="title">Registration Received</div>
        
        <div class="content">
          <p class="message">
            Hello <strong>${userName}</strong>,
          </p>
          
          <p class="message">
            Your registration has been successfully submitted to the APCOER Alumni Portal. 
            We're excited to have you join our community!
          </p>
          
          <div class="highlight">
            <strong>📋 Application Status:</strong><br>
            Your account is currently <strong>pending approval</strong> by the admin team.
          </div>
          
          <p class="message">
            What happens next:
          </p>
          <ul style="margin-left: 20px; margin-bottom: 20px;">
            <li>Our admin team will review your registration</li>
            <li>This typically takes 1-2 business days</li>
            <li>You'll receive an email once your profile is approved</li>
            <li>After approval, you can login and access all features</li>
          </ul>
          
          <p class="message">
            If you have any questions, feel free to contact us at support@apcoer.edu
          </p>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>
          APCOER Alumni Team<br><br>
          <span class="status-badge">⏳ Pending Approval</span></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// Approval Email Template
const getApprovalTemplate = (userName) => {
  const subject = '🎉 Profile Approved - Connect to APCOER Alumni Network Now!';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Profile Approved</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e1e5e9;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .message {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .success-box {
          background-color: #d1fae5;
          padding: 20px;
          border-left: 4px solid #10b981;
          margin: 20px 0;
          border-radius: 4px;
        }
        .login-button {
          display: inline-block;
          background-color: #2563eb;
          color: #ffffff;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          transition: background-color 0.3s;
        }
        .login-button:hover {
          background-color: #1d4ed8;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e1e5e9;
          font-size: 14px;
          color: #6b7280;
        }
        .status-badge {
          display: inline-block;
          background-color: #d1fae5;
          color: #065f46;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 10px;
        }
        .feature-list {
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .feature-list h4 {
          margin-top: 0;
          color: #1f2937;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎓 APCOER Alumni Portal</div>
        </div>
        
        <div class="title">🎉 Profile Approved!</div>
        
        <div class="content">
          <p class="message">
            Hello <strong>${userName}</strong>,
          </p>
          
          <div class="success-box">
            <strong>✅ Great News!</strong><br>
            Your profile has been <strong>approved</strong> by the admin team. 
            You can now <strong>login and connect to the APCOER Alumni Network</strong>!
          </div>
          
          <p class="message">
            Welcome to our prestigious APCOER Alumni Network! You are now part of a vibrant community of successful alumni. You can:
          </p>
          
          <div class="feature-list">
            <h4>🌟 What You Can Do:</h4>
            <ul style="margin-left: 20px;">
              <li>Connect with fellow alumni</li>
              <li>Access exclusive job opportunities</li>
              <li>Share your achievements and updates</li>
              <li>Participate in alumni events</li>
              <li>Mentor current students</li>
            </ul>
          </div>
          
          <p class="message">
            <strong>Ready to get started?</strong><br>
            Click the button below to login to your account:
          </p>
          
          <div style="text-align: center;">
            <a href="http://localhost:5173/login" class="login-button">
              🌐 Connect to APCOER Alumni Network
            </a>
          </div>
          
          <p class="message">
            <strong>Login Details:</strong><br>
            📧 Email: Your registered email address<br>
            🔐 Password: The password you created during registration
          </p>
        </div>
        
        <div class="footer">
          <p>We're excited to have you as part of our alumni network!<br>
          Best regards,<br>
          APCOER Alumni Team<br><br>
          <span class="status-badge">✅ Approved</span></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// Alumni Credentials Email Template
const getAlumniCredentialsTemplate = (firstName, lastName, email, temporaryPassword) => {
  const subject = 'Welcome to APCOER Alumni Network - Your Account Credentials';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to APCOER Alumni Network</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: #1e40af;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
          margin: -30px -30px 30px -30px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          margin-bottom: 30px;
        }
        .credentials-box {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #1e40af;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .credentials-box p {
          margin: 5px 0;
          color: #4b5563;
        }
        .credentials-box strong {
          color: #1f2937;
        }
        .login-button {
          display: inline-block;
          background: #1e40af;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          transition: background-color 0.3s;
        }
        .login-button:hover {
          background: #1d4ed8;
        }
        .note {
          background: #fef3c7;
          padding: 15px;
          border-left: 4px solid #f59e0b;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 14px;
          color: #92400e;
        }
        .footer {
          background: #1f2937;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 0 0 10px 10px;
          margin: 30px -30px -30px -30px;
        }
        .footer p {
          margin: 0;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to APCOER Alumni Network</h1>
        </div>
        
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">Hello ${firstName} ${lastName},</h2>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Your account has been created in the APCOER Alumni Network. You can now login using the credentials below:
          </p>
          
          <div class="credentials-box">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #1f2937;">Login Credentials:</p>
            <p style="margin: 5px 0; color: #4b5563;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0; color: #4b5563;"><strong>Temporary Password:</strong> ${temporaryPassword}</p>
          </div>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Please login and change your password to activate your account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="login-button">
              Go to Alumni Portal
            </a>
          </div>
          
          <div class="note">
            <strong>Note:</strong> Your account is currently inactive. Please login and set your password to activate it.
          </div>
        </div>
        
        <div class="footer">
          <p>© 2024 APCOER Alumni Network. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// Coordinator Approval Email Template
const getCoordinatorApprovalTemplate = (firstName, lastName) => {
  const subject = '🎉 Your Alumni Account Has Been Approved - APCOER Alumni Network';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Approved</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: #10b981;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
          margin: -30px -30px 30px -30px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          margin-bottom: 30px;
        }
        .success-box {
          background: #d1fae5;
          padding: 20px;
          border-left: 4px solid #10b981;
          margin: 20px 0;
          border-radius: 4px;
        }
        .login-button {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          transition: background-color 0.3s;
        }
        .login-button:hover {
          background: #059669;
        }
        .footer {
          background: #1f2937;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 0 0 10px 10px;
          margin: 30px -30px -30px -30px;
        }
        .footer p {
          margin: 0;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Account Approved!</h1>
        </div>
        
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">Hello ${firstName} ${lastName},</h2>
          
          <div class="success-box">
            <strong>✅ Great News!</strong><br>
            Your alumni account has been <strong>approved</strong> by the coordinator. 
            You can now <strong>login to the APCOER Alumni Network</strong>!
          </div>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Welcome to our prestigious APCOER Alumni Network! You are now part of a vibrant community of successful alumni.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="login-button">
              🌐 Login to Alumni Portal
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>APCOER Alumni Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// Rejection Email Template
const getRejectionTemplate = (firstName, lastName) => {
  const subject = 'Your Alumni Registration Has Been Rejected - APCOER Alumni Network';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration Rejected</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: #ef4444;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
          margin: -30px -30px 30px -30px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .content {
          margin-bottom: 30px;
        }
        .rejection-box {
          background: #fee2e2;
          padding: 20px;
          border-left: 4px solid #ef4444;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          background: #1f2937;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 0 0 10px 10px;
          margin: 30px -30px -30px -30px;
        }
        .footer p {
          margin: 0;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Registration Rejected</h1>
        </div>
        
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">Hello ${firstName} ${lastName},</h2>
          
          <div class="rejection-box">
            <strong>❌ Application Status:</strong><br>
            Your alumni registration has been <strong>rejected</strong> by the coordinator.
          </div>
          
          <p style="color: #4b5563; line-height: 1.6;">
            If you believe this is an error, please contact the administration for further assistance.
          </p>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>APCOER Alumni Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// Event Notification Email Template
const getEventNotificationTemplate = (eventData) => {
  const subject = `🎉 New Event: ${eventData.eventTitle}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Event Announcement</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e1e5e9;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .event-details {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-item {
          margin-bottom: 15px;
        }
        .detail-label {
          font-weight: 600;
          color: #374151;
          display: block;
          margin-bottom: 5px;
        }
        .detail-value {
          color: #4b5563;
        }
        .guest-speakers {
          background-color: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e1e5e9;
          color: #6b7280;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          margin-top: 20px;
        }
        .button:hover {
          background-color: #1d4ed8;
        }
        .event-mode {
          display: inline-block;
          background-color: #10b981;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">APCOER Alumni Portal</div>
          <div class="title">🎉 New Event Announcement</div>
        </div>
        
        <div class="content">
          <p class="message">
            Dear ${eventData.recipientName},
          </p>
          <p class="message">
            We're excited to announce a new event that you won't want to miss!
          </p>
          
          <div class="event-details">
            <h3 style="margin-top: 0; color: #1f2937;">${eventData.eventTitle}</h3>
            
            <div class="detail-item">
              <span class="detail-label">📅 Date:</span>
              <span class="detail-value">${eventData.eventDate}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">🕐 Time:</span>
              <span class="detail-value">${eventData.eventTime}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">📍 Location:</span>
              <span class="detail-value">${eventData.location}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">🌐 Mode:</span>
              <span class="detail-value">
                <span class="event-mode">${eventData.eventMode}</span>
              </span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">📝 Description:</span>
              <span class="detail-value">${eventData.eventDescription}</span>
            </div>
          </div>
          
          ${eventData.guestSpeakers && eventData.guestSpeakers !== 'No guest speakers' ? `
            <div class="guest-speakers">
              <h4 style="margin-top: 0; color: #1f2937;">🎤 Guest Speakers:</h4>
              <p style="margin-bottom: 0;">${eventData.guestSpeakers}</p>
            </div>
          ` : ''}
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">
              View More Details & Register
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; 2024 APCOER Alumni Portal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// Event Rejection Email Template
const getEventRejectionTemplate = (eventData) => {
  const subject = `Event Rejected: ${eventData.eventTitle}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Rejected</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e1e5e9;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #dc2626;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .rejection-reason {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e1e5e9;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">APCOER Alumni Portal</div>
          <div class="title">Event Submission Update</div>
        </div>
        
        <div class="content">
          <p class="message">
            Dear ${eventData.recipientName},
          </p>
          <p class="message">
            We regret to inform you that your event submission "<strong>${eventData.eventTitle}</strong>" has been reviewed and rejected.
          </p>
          
          <div class="rejection-reason">
            <h4 style="margin-top: 0; color: #dc2626;">Reason for Rejection:</h4>
            <p>${eventData.rejectionReason}</p>
          </div>
          
          <p class="message">
            You may revise your event and submit it again for approval. If you have any questions, please contact the administration team.
          </p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; 2024 APCOER Alumni Portal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// News Notification Email Template
const getNewsNotificationTemplate = (news, loginUrl) => {
  const subject = `New News Update: ${news.title}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>APCOER Alumni Portal - News Update</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 10px 10px 0 0;
          margin: -30px -30px 30px -30px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .news-image {
          width: 100%;
          max-height: 300px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .news-title {
          color: #2c3e50;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .news-meta {
          color: #7f8c8d;
          font-size: 14px;
          margin-bottom: 20px;
        }
        .news-content {
          color: #34495e;
          font-size: 16px;
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .read-more-btn {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 25px;
          font-weight: bold;
          margin-top: 20px;
          transition: transform 0.3s ease;
        }
        .read-more-btn:hover {
          transform: translateY(-2px);
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #7f8c8d;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>APCOER Alumni Portal</h1>
          <p>Latest News Update</p>
        </div>
        
        ${news.image_url ? `<img src="${news.image_url}" alt="${news.title}" class="news-image">` : ''}
        
        <h2 class="news-title">${news.title}</h2>
        
        <div class="news-meta">
          Posted by: ${news.author_name || 'Admin'} | 
          Category: ${news.category} | 
          Date: ${new Date(news.created_at).toLocaleDateString()}
        </div>
        
        <div class="news-content">
          ${news.short_content ? 
            `${news.short_content.substring(0, 300)}${news.short_content.length > 300 ? '...' : ''}` : 
            news.full_content ? 
              `${news.full_content.substring(0, 300)}${news.full_content.length > 300 ? '...' : ''}` : 
              'No content available'
          }
        </div>
        
        <div style="text-align: center;">
          <a href="${loginUrl}" class="read-more-btn">Read More</a>
        </div>
        
        <div class="footer">
          <p>This email was sent to you because you are a registered member of the APCOER Alumni Portal.</p>
          <p>© 2024 APCOER Alumni Association. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// Event Approval Email Template
const getEventApprovalTemplate = (eventData) => {
  const subject = `Event Approved: ${eventData.title}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Approved</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e1e5e9;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .message {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .event-details {
          background-color: #f8fafc;
          border-left: 4px solid #10b981;
          padding: 20px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .detail-row {
          display: flex;
          margin-bottom: 10px;
        }
        .detail-label {
          font-weight: 600;
          color: #374151;
          min-width: 120px;
        }
        .detail-value {
          color: #1f2937;
        }
        .cta-button {
          display: inline-block;
          background-color: #10b981;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e1e5e9;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">APCOER Alumni Portal</div>
          <h1 class="title">🎉 Event Approved!</h1>
        </div>
        
        <div class="content">
          <p class="message">
            Dear ${eventData.author_name},
          </p>
          <p class="message">
            Great news! Your event has been reviewed and approved by our admin team. 
            Your event is now live and visible to all alumni members.
          </p>
          
          <div class="event-details">
            <h3 style="margin-top: 0; color: #10b981;">Event Details</h3>
            <div class="detail-row">
              <span class="detail-label">Title:</span>
              <span class="detail-value">${eventData.title}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${new Date(eventData.event_date).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${new Date(eventData.event_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">${eventData.location}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Mode:</span>
              <span class="detail-value">${eventData.event_mode || 'In-Person'}</span>
            </div>
          </div>
          
          <p class="message">
            Alumni members can now view and register for your event through the portal. 
            You'll receive notifications when someone registers for your event.
          </p>
          
          ${eventData.description ? `
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #374151;">Event Description:</h4>
              <p style="margin-bottom: 0; color: #4b5563;">${eventData.description}</p>
            </div>
          ` : ''}
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/alumni/events" class="cta-button">
              View Your Event
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>APCOER Alumni Portal Team</p>
          <p style="font-size: 12px; margin-top: 10px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// Opportunity Approval Email Template
const getOpportunityApprovalTemplate = (opportunityData) => {
  const subject = `Opportunity Approved: ${opportunityData.title}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Opportunity Approved</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e1e5e9;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .message {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .opportunity-details {
          background-color: #f8fafc;
          border-left: 4px solid #10b981;
          padding: 20px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .detail-row {
          display: flex;
          margin-bottom: 10px;
        }
        .detail-label {
          font-weight: 600;
          color: #374151;
          min-width: 120px;
        }
        .detail-value {
          color: #1f2937;
        }
        .cta-button {
          display: inline-block;
          background-color: #10b981;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e1e5e9;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">APCOER Alumni Portal</div>
          <h1 class="title">🎉 Opportunity Approved!</h1>
        </div>
        
        <div class="content">
          <p class="message">
            Dear ${opportunityData.author_name},
          </p>
          <p class="message">
            Great news! Your opportunity has been reviewed and approved by our admin team. 
            Your opportunity is now live and visible to all alumni members.
          </p>
          
          <div class="opportunity-details">
            <h3 style="margin-top: 0; color: #10b981;">Opportunity Details</h3>
            <div class="detail-row">
              <span class="detail-label">Title:</span>
              <span class="detail-value">${opportunityData.title}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Company:</span>
              <span class="detail-value">${opportunityData.company}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">${opportunityData.location}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Type:</span>
              <span class="detail-value">${opportunityData.opportunity_type}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Application Deadline:</span>
              <span class="detail-value">${new Date(opportunityData.application_deadline).toLocaleDateString()}</span>
            </div>
          </div>
          
          <p class="message">
            Alumni members can now view and apply to this opportunity through the portal. 
            You'll receive notifications when someone applies to your opportunity.
          </p>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/alumni/opportunities" class="cta-button">
              View Your Opportunity
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>APCOER Alumni Portal Team</p>
          <p style="font-size: 12px; margin-top: 10px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// Opportunity Rejection Email Template
const getOpportunityRejectionTemplate = (opportunityData, rejectionReason) => {
  const subject = `Opportunity Review Update: ${opportunityData.title}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Opportunity Review Update</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e1e5e9;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .message {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .opportunity-details {
          background-color: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 20px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .detail-row {
          display: flex;
          margin-bottom: 10px;
        }
        .detail-label {
          font-weight: 600;
          color: #374151;
          min-width: 120px;
        }
        .detail-value {
          color: #1f2937;
        }
        .rejection-reason {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e1e5e9;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">APCOER Alumni Portal</div>
          <h1 class="title">Opportunity Review Update</h1>
        </div>
        
        <div class="content">
          <p class="message">
            Dear ${opportunityData.author_name},
          </p>
          <p class="message">
            Thank you for submitting your opportunity to the APCOER Alumni Portal. 
            After careful review, our admin team has decided not to approve this opportunity at this time.
          </p>
          
          <div class="opportunity-details">
            <h3 style="margin-top: 0; color: #ef4444;">Opportunity Details</h3>
            <div class="detail-row">
              <span class="detail-label">Title:</span>
              <span class="detail-value">${opportunityData.title}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Company:</span>
              <span class="detail-value">${opportunityData.company}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">${opportunityData.location}</span>
            </div>
          </div>
          
          ${rejectionReason ? `
            <div class="rejection-reason">
              <h4 style="margin-top: 0; color: #ef4444;">Feedback from Admin:</h4>
              <p style="margin-bottom: 0;">${rejectionReason}</p>
            </div>
          ` : ''}
          
          <p class="message">
            We encourage you to review the feedback and make any necessary improvements. 
            You're welcome to submit a new opportunity that better meets our platform guidelines.
          </p>
          
          <p class="message">
            If you have any questions or need clarification, please don't hesitate to reach out to our support team.
          </p>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>APCOER Alumni Portal Team</p>
          <p style="font-size: 12px; margin-top: 10px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// Alumni Notification Template for New Opportunity
const getAlumniOpportunityNotificationTemplate = (opportunityData) => {
  const subject = `New Opportunity: ${opportunityData.title}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Opportunity Available</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e1e5e9;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .message {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .opportunity-card {
          background-color: #f8fafc;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .opportunity-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 10px;
        }
        .opportunity-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 15px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #6b7280;
        }
        .cta-button {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e1e5e9;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">APCOER Alumni Portal</div>
          <h1 class="title">💼 New Opportunity Available!</h1>
        </div>
        
        <div class="content">
          <p class="message">
            Dear Alumni Member,
          </p>
          <p class="message">
            We're excited to share a new opportunity that might be perfect for you! 
            This opportunity has been carefully reviewed and approved by our admin team.
          </p>
          
          <div class="opportunity-card">
            <h3 class="opportunity-title">${opportunityData.title}</h3>
            <div class="opportunity-meta">
              <div class="meta-item">🏢 ${opportunityData.company}</div>
              <div class="meta-item">📍 ${opportunityData.location}</div>
              <div class="meta-item">💼 ${opportunityData.opportunity_type}</div>
            </div>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
              ${opportunityData.description ? opportunityData.description.substring(0, 200) + '...' : 'Check out this amazing opportunity!'}
            </p>
          </div>
          
          <p class="message">
            Don't miss out on this opportunity! Click the button below to view full details and apply.
          </p>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/alumni/opportunities" class="cta-button">
              View & Apply Now
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>APCOER Alumni Portal Team</p>
          <p style="font-size: 12px; margin-top: 10px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// Admin Event Notification Template for Alumni and Coordinators
const getAdminEventNotificationTemplate = (eventData) => {
  const subject = `New Event: ${eventData.title}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Event</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e1e5e9;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .message {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .event-card {
          background-color: #f8fafc;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .event-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 10px;
        }
        .event-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 15px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #6b7280;
        }
        .guest-speakers {
          background-color: #eff6ff;
          border-left: 4px solid #2563eb;
          padding: 15px;
          margin: 15px 0;
          border-radius: 5px;
        }
        .cta-button {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e1e5e9;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">APCOER Alumni Portal</div>
          <h1 class="title">🎉 New Event Announced!</h1>
        </div>
        
        <div class="content">
          <p class="message">
            Dear ${eventData.recipientName || 'Community Member'},
          </p>
          <p class="message">
            We're excited to announce a new event that has been approved by our admin team! 
            This event is now open for registration and we'd love for you to join us.
          </p>
          
          <div class="event-card">
            <h3 class="event-title">${eventData.title}</h3>
            <div class="event-meta">
              <div class="meta-item">📅 ${new Date(eventData.event_date).toLocaleDateString()}</div>
              <div class="meta-item">⏰ ${eventData.event_time}</div>
              <div class="meta-item">📍 ${eventData.location}</div>
              <div class="meta-item">🎯 ${eventData.event_mode || 'In-Person'}</div>
            </div>
            
            ${eventData.description ? `
              <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin: 15px 0;">
                ${eventData.description.substring(0, 200)}${eventData.description.length > 200 ? '...' : ''}
              </p>
            ` : ''}
            
            ${eventData.guest_speakers && eventData.guest_speakers.length > 0 ? `
              <div class="guest-speakers">
                <h4 style="margin-top: 0; color: #2563eb;">Guest Speakers:</h4>
                ${eventData.guest_speakers.map(speaker => 
                  `<p style="margin: 5px 0;"><strong>${speaker.name}</strong> - ${speaker.role} (${speaker.topic})</p>`
                ).join('')}
              </div>
            ` : ''}
          </div>
          
          <p class="message">
            Don't miss this opportunity to connect, learn, and grow with our alumni community! 
            Click the button below to view full details and register.
          </p>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/alumni/events" class="cta-button">
              View Event & Register
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>APCOER Alumni Portal Team</p>
          <p style="font-size: 12px; margin-top: 10px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// Admin Opportunity Notification Template for Alumni
const getAdminOpportunityNotificationTemplate = (opportunityData) => {
  const subject = `New Opportunity: ${opportunityData.title}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Opportunity</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e1e5e9;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .message {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .opportunity-card {
          background-color: #f8fafc;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .opportunity-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 10px;
        }
        .company-name {
          font-size: 16px;
          font-weight: 500;
          color: #2563eb;
          margin-bottom: 15px;
        }
        .opportunity-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 15px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #6b7280;
        }
        .skills-section {
          background-color: #eff6ff;
          border-left: 4px solid #2563eb;
          padding: 15px;
          margin: 15px 0;
          border-radius: 5px;
        }
        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }
        .skill-tag {
          background-color: #dbeafe;
          color: #1e40af;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        .cta-button {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e1e5e9;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">APCOER Alumni Portal</div>
          <h1 class="title">💼 New Opportunity Posted!</h1>
        </div>
        
        <div class="content">
          <p class="message">
            Dear ${opportunityData.recipientName || 'Alumni Member'},
          </p>
          <p class="message">
            We're excited to share a new career opportunity that has been posted by our admin team! 
            This could be the perfect next step in your professional journey.
          </p>
          
          <div class="opportunity-card">
            <h3 class="opportunity-title">${opportunityData.title}</h3>
            <div class="company-name">${opportunityData.company}</div>
            <div class="opportunity-meta">
              <div class="meta-item">🏢 ${opportunityData.type}</div>
              <div class="meta-item">📍 ${opportunityData.location}</div>
              <div class="meta-item">💰 ${opportunityData.salary_range}</div>
              <div class="meta-item">📅 Deadline: ${new Date(opportunityData.deadline).toLocaleDateString()}</div>
            </div>
            
            ${opportunityData.experience_range ? `
              <div style="margin: 10px 0;">
                <strong>Experience Required:</strong> ${opportunityData.experience_range}
              </div>
            ` : ''}
            
            ${opportunityData.description ? `
              <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin: 15px 0;">
                ${opportunityData.description.substring(0, 200)}${opportunityData.description.length > 200 ? '...' : ''}
              </p>
            ` : ''}
            
            ${opportunityData.skills && opportunityData.skills.length > 0 ? `
              <div class="skills-section">
                <h4 style="margin-top: 0; color: #2563eb;">Required Skills:</h4>
                <div class="skills-list">
                  ${opportunityData.skills.map(skill => 
                    `<span class="skill-tag">${skill}</span>`
                  ).join('')}
                </div>
              </div>
            ` : ''}
          </div>
          
          <p class="message">
            Don't miss this opportunity to advance your career! Click the button below to view full details and apply.
          </p>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/alumni/opportunities" class="cta-button">
              View Opportunity & Apply
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>APCOER Alumni Portal Team</p>
          <p style="font-size: 12px; margin-top: 10px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// OTP Email Template for Email Update
const getOTPTemplate = (userName, otp, newEmail) => {
  const subject = 'Email Update Verification - APCOER Alumni Portal';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Update Verification</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #3498db;
        }
        .header h1 {
          color: #2c3e50;
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 20px 0;
        }
        .otp-container {
          background-color: #f8f9fa;
          padding: 30px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
          border-left: 4px solid #3498db;
        }
        .otp-code {
          font-size: 36px;
          font-weight: bold;
          color: #2c3e50;
          letter-spacing: 8px;
          margin: 20px 0;
          font-family: 'Courier New', monospace;
          background-color: #ffffff;
          padding: 15px;
          border-radius: 5px;
          border: 2px dashed #3498db;
          display: inline-block;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 12px;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background-color: #3498db;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Email Update Verification</h1>
        </div>
        
        <div class="content">
          <p>Dear <strong>${userName}</strong>,</p>
          
          <p>You have requested to update your email address to <strong>${newEmail}</strong> on the APCOER Alumni Portal.</p>
          
          <p>To complete this process, please use the following One-Time Password (OTP):</p>
          
          <div class="otp-container">
            <p style="margin: 0; color: #666; font-size: 14px;">Your Verification Code</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">This code will expire in 15 minutes</p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Never share this OTP with anyone</li>
              <li>APCOER staff will never ask for your OTP</li>
              <li>This OTP can only be used once</li>
              <li>If you didn't request this change, please contact support immediately</li>
            </ul>
          </div>
          
          <p>If you have any questions or concerns, please contact our support team.</p>
          
          <p>Thank you for using APCOER Alumni Portal!</p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} APCOER Alumni Portal. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

// Forget Password OTP Email Template
const getForgetPasswordOTPTemplate = (userName, otp) => {
  const subject = 'Password Reset OTP - APCOER Alumni Portal';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset OTP</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #e74c3c;
        }
        .header h1 {
          color: #2c3e50;
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 20px 0;
        }
        .otp-container {
          background-color: #f8f9fa;
          padding: 30px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
          border-left: 4px solid #e74c3c;
        }
        .otp-code {
          font-size: 36px;
          font-weight: bold;
          color: #e74c3c;
          letter-spacing: 8px;
          margin: 20px 0;
          font-family: 'Courier New', monospace;
          background-color: #ffffff;
          padding: 15px;
          border-radius: 5px;
          border: 2px dashed #e74c3c;
          display: inline-block;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 12px;
        }
        .security-info {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔑 Password Reset Request</h1>
        </div>
        
        <div class="content">
          <p>Dear <strong>${userName}</strong>,</p>
          
          <p>We received a request to reset your password for the APCOER Alumni Portal account associated with this email address.</p>
          
          <div class="security-info">
            <strong>📍 Request Details:</strong><br>
            • Time: ${new Date().toLocaleString()}<br>
            • IP Address: [Hidden for security]<br>
            • Device: Web Browser
          </div>
          
          <p>To proceed with the password reset, please use the following One-Time Password (OTP):</p>
          
          <div class="otp-container">
            <p style="margin: 0; color: #666; font-size: 14px;">Your Password Reset Code</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">This code will expire in 10 minutes</p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important Security Notice:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Never share this OTP with anyone</li>
              <li>APCOER staff will never ask for your OTP</li>
              <li>This OTP can only be used once</li>
              <li>If you didn't request this password reset, please contact support immediately</li>
              <li>For your security, this link will expire after 10 minutes</li>
            </ul>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Enter this OTP in the password reset form</li>
            <li>Create your new password</li>
            <li>Log in with your new password</li>
          </ol>
          
          <p>If you have any questions or concerns, please contact our support team.</p>
          
          <p>Thank you for using APCOER Alumni Portal!</p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} APCOER Alumni Portal. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
};

export {
  getApplicationAcceptedTemplate,
  getApplicationReviewedTemplate,
  getApplicationRejectedTemplate,
  getRegistrationPendingTemplate,
  getApprovalTemplate,
  getAlumniCredentialsTemplate,
  getCoordinatorApprovalTemplate,
  getRejectionTemplate,
  getEventNotificationTemplate,
  getEventRejectionTemplate,
  getEventApprovalTemplate,
  getNewsNotificationTemplate,
  getOpportunityApprovalTemplate,
  getOpportunityRejectionTemplate,
  getAlumniOpportunityNotificationTemplate,
  getAdminEventNotificationTemplate,
  getAdminOpportunityNotificationTemplate,
  getOTPTemplate,
  getForgetPasswordOTPTemplate
};

