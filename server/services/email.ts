import nodemailer from 'nodemailer';

type EmailPayload = {
	to: string | string[];
	subject: string;
	html?: string;
	text?: string;
};

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter() {
	if (cachedTransporter) return cachedTransporter;

	const host = process.env.SMTP_HOST;
	const port = Number(process.env.SMTP_PORT || 587);
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;

	if (!host || !user || !pass) {
		console.error('SMTP Configuration Error:', {
			host: host ? 'set' : 'missing',
			port: port ? 'set' : 'missing',
			user: user ? 'set' : 'missing',
			pass: pass ? 'set' : 'missing'
		});
		throw new Error('SMTP configuration missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
	}

	console.log('Creating SMTP transport with config:', {
		host,
		port,
		secure: port === 465,
		auth: { user }
	});

	cachedTransporter = nodemailer.createTransport({
		host,
		port,
		secure: port === 465,
		auth: { user, pass },
	});

	return cachedTransporter;
}

export async function sendEmail(payload: EmailPayload) {
	console.log('Starting email send process...');
	
	const from = process.env.EMAIL_FROM || process.env.SMTP_USER || '';
	if (!from) {
		console.error('Sender email not configured');
		throw new Error('EMAIL_FROM or SMTP_USER must be set');
	}

	console.log('Sending email:', {
		from,
		to: payload.to,
		subject: payload.subject
	});

	try {
		const transporter = getTransporter();
		
		// Verify SMTP connection
		await transporter.verify();
		console.log('SMTP connection verified successfully');

		const info = await transporter.sendMail({
			from,
			to: Array.isArray(payload.to) ? payload.to.join(',') : payload.to,
			subject: payload.subject,
			text: payload.text,
			html: payload.html,
		});
		
		console.log('Email sent successfully:', info);
		return info;
	} catch (error: any) {
		console.error('Email sending failed:', {
			error: error.message,
			code: error.code,
			command: error.command
		});
		throw error;
	}
}

export function renderContactEmail(data: {
	name: string;
	email: string;
	phone?: string;
	subject?: string;
	message: string;
}) {
	return `
		<h2>New Contact Message</h2>
		<p><strong>Name:</strong> ${data.name}</p>
		<p><strong>Email:</strong> ${data.email}</p>
		${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
		${data.subject ? `<p><strong>Subject:</strong> ${data.subject}</p>` : ''}
		<hr />
		<pre style="white-space:pre-wrap;font-family:inherit">${data.message}</pre>
	`;
}

export function renderQuoteEmail(data: Record<string, any>) {
	const safe = (v: any) => (v === undefined || v === null ? '' : String(v));
	return `
		<h2>New Quote Request</h2>
		<p><strong>Project:</strong> ${safe(data.project_name)}</p>
		<p><strong>Name:</strong> ${safe(data.name)}</p>
		<p><strong>Email:</strong> ${safe(data.email)}</p>
		${safe(data.phone) ? `<p><strong>Phone:</strong> ${safe(data.phone)}</p>` : ''}
		${safe(data.budget_range) ? `<p><strong>Budget:</strong> ${safe(data.budget_range)}</p>` : ''}
		${safe(data.timeline) ? `<p><strong>Timeline:</strong> ${safe(data.timeline)}</p>` : ''}
		<hr />
		<p><strong>Description</strong></p>
		<pre style="white-space:pre-wrap;font-family:inherit">${safe(data.description)}</pre>
		${safe(data.requirements) ? `
			<hr />
			<p><strong>Requirements</strong></p>
			<pre style="white-space:pre-wrap;font-family:inherit">${safe(data.requirements)}</pre>
		` : ''}
	`;
}


