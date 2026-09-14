const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_ADDRESS = process.env.EMAIL_FROM || 'Safe Bank <onboarding@resend.dev>';

async function sendMail({ to, subject, html }) {
    const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Resend API error (${response.status}): ${errorBody}`);
    }

    return response.json();
}

module.exports = { sendMail };
