const nodemailer = require('nodemailer');
const dns = require('dns');

const SMTP_HOST = 'smtp.gmail.com';
const SMTP_PORT = 465;

let cachedTransporter = null;

// nodemailer's smtp-connection does its own DNS resolution and ignores the
// `family` transport option, so relying on dns.setDefaultResultOrder alone
// isn't enough on hosts without outbound IPv6 (e.g. Render). Resolve the
// A record ourselves and connect to the IPv4 literal directly, keeping
// tls.servername set to the real hostname so certificate validation still
// checks against smtp.gmail.com.
async function getTransporter() {
    if (cachedTransporter) return cachedTransporter;

    let host = SMTP_HOST;
    try {
        const addresses = await dns.promises.resolve4(SMTP_HOST);
        if (addresses.length > 0) {
            host = addresses[0];
        }
    } catch (err) {
        // Fall back to the hostname if IPv4 resolution fails; nodemailer
        // will attempt its own resolution in that case.
    }

    cachedTransporter = nodemailer.createTransport({
        host,
        port: SMTP_PORT,
        secure: true,
        tls: { servername: SMTP_HOST },
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    return cachedTransporter;
}

module.exports = { getTransporter };
