import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

class EmailService {
  constructor() {
    this.mode = process.env.EMAIL_MODE || 'resend'; // 'resend', 'file', 'console'
    this.resend = null;
    
    if (this.mode === 'resend' || !process.env.EMAIL_MODE) {
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        this.resend = new Resend(apiKey);
      } else {
        console.warn('RESEND_API_KEY missing, falling back to console mode');
        this.mode = 'console';
      }
    }
  }

  async sendEmail({ to, subject, html }) {
    const recipient = (to || '').trim();
    
    // Fallback 1: Log to file
    if (this.mode === 'file') {
      const logEntry = `${new Date().toISOString()} | TO: ${recipient} | SUBJECT: ${subject}\n`;
      try {
        fs.appendFileSync('emails.log', logEntry);
        console.log(`📧 [FILE] Email logged to emails.log for ${recipient}`);
        return { success: true, mode: 'file', message: 'Email logged to file' };
      } catch (err) {
        console.error('Failed to write to emails.log:', err);
        this.mode = 'console'; // Final fallback
      }
    }

    // Fallback 2: Console log
    if (this.mode === 'console') {
      console.log('📧 [CONSOLE] EMAIL WOULD SEND:', { to: recipient, subject });
      return { success: true, mode: 'console' };
    }

    // Primary: Resend API
    try {
      const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';
      const result = await this.resend.emails.send({
        from,
        to: recipient,
        subject,
        html,
      });

      if (result.error) {
        throw new Error(JSON.stringify(result.error));
      }

      console.log(`✅ [RESEND] Email sent to ${recipient}, ID: ${result.data?.id}`);
      return { success: true, mode: 'resend', data: result.data };
    } catch (error) {
      console.error('Resend failed, falling back to console:', error.message);
      console.log('📧 [FALLBACK] EMAIL WOULD SEND:', { to: recipient, subject });
      return { success: true, mode: 'fallback', message: 'API failed, logged to console' };
    }
  }
}

export default new EmailService();
