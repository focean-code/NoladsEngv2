import express from 'express';
import { sendEmail, renderQuoteEmail } from '../services/email.ts';

const router = express.Router();

router.post('/send', async (req, res) => {
	try {
		const data = req.body || {};
		if (!data?.email && !data?.name && !data?.project_name && !data?.description) {
			return res.status(400).json({ success: false, error: 'Missing quote fields' });
		}

		const to = process.env.QUOTES_RECIPIENT || process.env.EMAIL_TO || process.env.SMTP_USER;
		if (!to) {
			return res.status(500).json({ success: false, error: 'Recipient email not configured' });
		}

		await sendEmail({
			to,
			subject: `New Quote Request: ${data.project_name || data.name || 'Untitled'}`,
			html: renderQuoteEmail(data),
			text: `New quote request\nProject: ${data.project_name || '-'}\nName: ${data.name || '-'}\nEmail: ${data.email || '-'}\nPhone: ${data.phone || '-'}\nBudget: ${data.budget_range || '-'}\nTimeline: ${data.timeline || '-'}\n\nDescription:\n${data.description || '-'}\n\nRequirements:\n${data.requirements || '-'}`,
		});

		return res.json({ success: true });
	} catch (error: any) {
		return res.status(500).json({ success: false, error: error?.message || 'Failed to send quote email' });
	}
});

export default router;


