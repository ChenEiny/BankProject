const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const FROM_ADDRESS = process.env.EMAIL_FROM; // must be a Brevo-verified sender

// Render's free tier blocks outbound SMTP (ports 25/465/587), so verification
// emails go through Brevo's HTTPS API instead of nodemailer/SMTP. Brevo only
// needs a single verified sender (no domain/DNS), and unlike Resend's
// sandbox mode, lets that sender send to any recipient.
async function sendMail({ to, subject, html }) {
    const response = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({
            sender: { email: FROM_ADDRESS, name: 'Safe Bank' },
            to: [{ email: to }],
            subject,
            htmlContent: html
        })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Brevo API error (${response.status}): ${errorBody}`);
    }

    return response.json();
}

module.exports = { sendMail };
