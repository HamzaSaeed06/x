import nodemailer from 'nodemailer';
import type { IOrder } from '../models/Order.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function baseHtml(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><style>
      body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
      .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; }
      .header { background: #000; padding: 24px 32px; }
      .header h1 { color: white; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 1px; }
      .body { padding: 32px; }
      .footer { padding: 20px 32px; background: #f5f5f5; text-align: center; font-size: 12px; color: #888; }
      .btn { display: inline-block; padding: 12px 28px; background: #000; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
      table { width: 100%; border-collapse: collapse; margin: 16px 0; }
      th { text-align: left; font-size: 12px; color: #888; padding: 8px 0; border-bottom: 1px solid #eee; }
      td { padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
    </style></head>
    <body><div class="container">
      <div class="header"><h1>ZEST</h1></div>
      <div class="body">${content}</div>
      <div class="footer">© Zest Store Pakistan | If you did not place this order, please contact us immediately.</div>
    </div></body></html>
  `;
}

export async function sendOrderConfirmation(email: string, order: IOrder): Promise<void> {
  const orderId = (order._id as any).toString().slice(0, 8).toUpperCase();
  const items = (order as any).items as Array<{ name: string; qty: number; price: number }>;
  const itemRows = items.map(i =>
    `<tr><td>${i.name}</td><td style="text-align:right">×${i.qty}</td><td style="text-align:right">PKR ${(i.price * i.qty).toLocaleString()}</td></tr>`
  ).join('');

  const html = baseHtml(`
    <h2 style="margin-top:0">Order Confirmed! 🎉</h2>
    <p>Hi! Your order <strong>#${orderId}</strong> has been placed successfully.</p>
    ${(order as any).paymentMethod === 'cod' ? `<p style="background:#fff3cd;padding:12px;border-radius:4px;font-size:13px">💵 <strong>Cash on Delivery:</strong> Please keep PKR ${(order as any).total?.toLocaleString()} ready at the time of delivery.</p>` : ''}
    <table>
      <thead><tr><th>Item</th><th style="text-align:right">Qty</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <table>
      <tr><td style="color:#888">Subtotal</td><td style="text-align:right">PKR ${(order as any).subtotal?.toLocaleString()}</td></tr>
      <tr><td style="color:#888">Shipping</td><td style="text-align:right">PKR ${(order as any).shipping?.toLocaleString()}</td></tr>
      ${(order as any).discount > 0 ? `<tr><td style="color:#888">Discount</td><td style="text-align:right;color:green">-PKR ${(order as any).discount?.toLocaleString()}</td></tr>` : ''}
      <tr><td><strong>Total</strong></td><td style="text-align:right"><strong>PKR ${(order as any).total?.toLocaleString()}</strong></td></tr>
    </table>
    <p style="font-size:13px;color:#888">We'll send you another email when your order is shipped.</p>
  `);

  await transporter.sendMail({
    from: `"Zest Store" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Order #${orderId} confirmed — Zest`,
    html,
  });
}

export async function sendShippingUpdate(email: string, order: IOrder, status: string): Promise<void> {
  const orderId = (order._id as any).toString().slice(0, 8).toUpperCase();
  const statusMessages: Record<string, { subject: string; title: string; body: string; emoji: string }> = {
    confirmed: {
      emoji: '✅',
      subject: `Order #${orderId} confirmed`,
      title: 'Your order is confirmed!',
      body: 'Our team has confirmed your order and it is being prepared for dispatch.',
    },
    processing: {
      emoji: '📦',
      subject: `Order #${orderId} is being packed`,
      title: 'Your order is being packed!',
      body: 'Your items are being carefully packed and will be dispatched soon.',
    },
    shipped: {
      emoji: '🚚',
      subject: `Order #${orderId} is on the way!`,
      title: 'Your order has been shipped!',
      body: `Your order is on its way!${(order as any).trackingNumber ? ` Tracking number: <strong>${(order as any).trackingNumber}</strong> via ${(order as any).courier || 'courier'}.` : ''}`,
    },
    delivered: {
      emoji: '🎉',
      subject: `Order #${orderId} delivered — How did we do?`,
      title: 'Your order has been delivered!',
      body: `We hope you love your purchase! Please take a moment to share your experience.
        <br><br>
        <a href="${process.env.FRONTEND_URL}/account/orders/${(order._id as any).toString()}?review=1" class="btn">Leave a Review</a>`,
    },
    cancelled: {
      emoji: '❌',
      subject: `Order #${orderId} cancelled`,
      title: 'Your order has been cancelled',
      body: 'Your order has been cancelled. If this was a mistake, please contact our support.',
    },
  };

  const msg = statusMessages[status];
  if (!msg) return;

  const html = baseHtml(`
    <h2 style="margin-top:0">${msg.emoji} ${msg.title}</h2>
    <p>Order <strong>#${orderId}</strong></p>
    <p>${msg.body}</p>
    <a href="${process.env.FRONTEND_URL}/account/orders/${(order._id as any).toString()}" class="btn">View Order</a>
  `);

  await transporter.sendMail({
    from: `"Zest Store" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `${msg.emoji} ${msg.subject}`,
    html,
  });
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
  const html = baseHtml(`
    <h2 style="margin-top:0">Reset Your Password</h2>
    <p>You requested a password reset for your Zest account.</p>
    <p>Click the button below to reset your password. This link expires in 1 hour.</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <p style="margin-top:20px;font-size:12px;color:#888">If you didn't request this, ignore this email. Your password won't change.</p>
  `);

  await transporter.sendMail({
    from: `"Zest Store" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset your Zest password',
    html,
  });
}
