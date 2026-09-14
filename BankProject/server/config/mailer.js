const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

function base64url(str) {
    return Buffer.from(str, 'utf-8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function getAccessToken() {
    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.GMAIL_CLIENT_ID,
            client_secret: process.env.GMAIL_CLIENT_SECRET,
            refresh_token: process.env.GMAIL_REFRESH_TOKEN,
            grant_type: 'refresh_token'
        })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gmail token refresh error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    return data.access_token;
}

async function sendMail({ to, subject, html }) {
    const accessToken = await getAccessToken();
    const from = process.env.EMAIL_FROM;

    const message = [
        `To: ${to}`,
        `From: Safe Bank <${from}>`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        html
    ].join('\r\n');

    const response = await fetch(SEND_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: base64url(message) })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gmail API error (${response.status}): ${errorBody}`);
    }

    return response.json();
}

module.exports = { sendMail };
