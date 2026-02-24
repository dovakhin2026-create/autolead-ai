// Netlify Function - Capture leads et envoie notifications via SendGrid
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Get SendGrid API Key from env
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const TO_EMAIL = 'dovakhin2026@gmail.com';
  const FROM_EMAIL = 'leads@autolead-ai.com';

  try {
    // Parse body
    const data = JSON.parse(event.body);
    const { name, email, company, phone, service, message } = data;

    // Validation
    if (!name || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Name and email required' })
      };
    }

    // Log lead
    console.log('New lead received:', { name, email, company, phone, service, message, timestamp: new Date().toISOString() });

    // Send email via SendGrid if API key is configured
    if (SENDGRID_API_KEY && SENDGRID_API_KEY.startsWith('SG.')) {
      const emailContent = `
Nouveau lead AutoLead.ai!

Nom: ${name}
Email: ${email}
${company ? `Entreprise: ${company}` : ''}
${phone ? `Téléphone: ${phone}` : ''}
${service ? `Service: ${service}` : ''}
${message ? `Message: ${message}` : ''}

---
Reçu le: ${new Date().toISOString()}
      `.trim();

      const emailPayload = {
        personalizations: [{
          to: [{ email: TO_EMAIL }]
        }],
        from: { email: FROM_EMAIL, name: 'AutoLead.ai Leads' },
        subject: `🔔 Nouveau lead: ${name} - ${company || 'Particulier'}`,
        content: [{
          type: 'text/plain',
          value: emailContent
        }]
      };

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });

      if (response.ok) {
        console.log('Email notification sent via SendGrid');
      } else {
        console.error('SendGrid error:', await response.text());
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Lead captured successfully' 
      })
    };

  } catch (error) {
    console.error('Error processing lead:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
