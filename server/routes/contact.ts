import express from 'express';
import { sendEmail, renderContactEmail } from '../services/email.ts';
import { supabaseAdmin } from '../supabaseAdmin.ts';

const router = express.Router();

// Create contact message (DB insert via service role) and send email
router.post('/create', async (req, res) => {
	try {
		console.log('[contact:create] body:', req.body);
		const { name, email, phone, subject, message, status = 'unread' } = req.body || {};
		if (!name || !email || !message) {
			console.warn('[contact:create] validation failed');
			return res.status(400).json({ success: false, error: 'name, email, and message are required' });
		}

		// Insert into DB with service role to bypass RLS
		const { data: inserted, error: dbError } = await supabaseAdmin
			.from('contact_messages')
			.insert([{ name, email, phone, subject, message, status }])
			.select()
			.single();
		if (dbError) {
			console.error('DB insert failed:', dbError);
			return res.status(500).json({ success: false, error: 'Failed to save message' });
		}

		// Send notification email (best-effort)
		try {
			const to = process.env.CONTACT_RECIPIENT || process.env.EMAIL_TO || process.env.SMTP_USER;
			if (to) {
				await sendEmail({
					to,
					subject: subject ? `Contact: ${subject}` : 'New Contact Message',
					html: renderContactEmail({ name, email, phone, subject, message }),
					text: `New contact message from ${name} <${email}>\nPhone: ${phone || '-'}\nSubject: ${subject || '-'}\n\n${message}`,
				});
			}
		} catch (emailError) {
			console.warn('Email send failed (continuing):', emailError);
		}

		return res.json({ success: true, data: inserted });
	} catch (error: any) {
		return res.status(500).json({ success: false, error: error?.message || 'Failed to create contact message' });
	}
});

router.post('/send', async (req, res) => {
	try {
		const { name, email, phone, subject, message } = req.body || {};
		if (!name || !email || !message) {
			return res.status(400).json({ success: false, error: 'name, email, and message are required' });
		}

		const to = process.env.CONTACT_RECIPIENT || process.env.EMAIL_TO || process.env.SMTP_USER;
		if (!to) {
			console.error('Email configuration error: Recipient email not configured');
			return res.status(500).json({ success: false, error: 'Recipient email not configured' });
		}

		try {
			await sendEmail({
				to,
				subject: subject ? `Contact: ${subject}` : 'New Contact Message',
				html: renderContactEmail({ name, email, phone, subject, message }),
				text: `New contact message from ${name} <${email}>\nPhone: ${phone || '-'}\nSubject: ${subject || '-'}\n\n${message}`,
			});
		} catch (emailError: any) {
			console.error('Failed to send contact email:', {
				error: emailError.message,
				stack: emailError.stack,
				config: {
					to,
					smtpConfigured: !!process.env.SMTP_HOST && !!process.env.SMTP_USER
				}
			});
			throw new Error('Failed to send email: ' + emailError.message);
		}

		return res.json({ success: true });
	} catch (error: any) {
		return res.status(500).json({ success: false, error: error?.message || 'Failed to send contact email' });
	}
});

export default router;
