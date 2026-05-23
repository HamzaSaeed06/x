import { Router } from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User.js';
import { generateToken, requireAuth, type AuthRequest } from '../middleware/auth.js';
import { sendPasswordResetEmail } from '../lib/mailer.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait 15 minutes before trying again.' },
});

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many password reset requests. Please wait an hour.' },
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  const { access_token } = req.body as { access_token: string };
  if (!access_token) { res.status(400).json({ error: 'Google access_token required' }); return; }
  try {
    const infoRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!infoRes.ok) { res.status(401).json({ error: 'Invalid Google token' }); return; }
    const info = await infoRes.json() as { sub: string; email: string; name?: string; picture?: string };
    if (!info.email) { res.status(400).json({ error: 'Google account has no email' }); return; }

    let user = await User.findOne({ email: info.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        email: info.email.toLowerCase(),
        name: info.name || info.email.split('@')[0],
        displayName: info.name || info.email.split('@')[0],
        photoURL: info.picture ?? '',
        googleId: info.sub,
        password: crypto.randomBytes(32).toString('hex'),
        loyaltyPoints: 100,
      });
    } else {
      if (!user.isActive) {
        res.status(403).json({ error: 'Your account has been suspended. Contact support.' }); return;
      }
      if (!user.googleId) {
        await User.findByIdAndUpdate(user._id, {
          googleId: info.sub,
          photoURL: user.photoURL || info.picture,
          displayName: user.displayName || info.name,
        });
      }
    }

    const token = generateToken({ id: user._id.toString(), email: user.email, role: user.role });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      token,
      user: {
        id: user._id.toString(),
        uid: user._id.toString(),
        email: user.email,
        name: user.name,
        displayName: user.displayName ?? user.name,
        photoURL: user.photoURL || info.picture,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    });
  } catch {
    res.status(401).json({ error: 'Google sign-in failed. Please try again.' });
  }
});

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body as { email: string; password: string; name: string };
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }
    const user = await User.create({ email, password, name, displayName: name, loyaltyPoints: 100 });
    const token = generateToken({ id: user._id.toString(), email: user.email, role: user.role });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        uid: user._id.toString(),
        email: user.email,
        name: user.name,
        displayName: user.displayName ?? user.name,
        photoURL: user.photoURL,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    if (!user.isActive) {
      res.status(403).json({ error: 'Your account has been suspended. Contact support.' });
      return;
    }
    const token = generateToken({ id: user._id.toString(), email: user.email, role: user.role });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      token,
      user: {
        id: user._id.toString(),
        uid: user._id.toString(),
        email: user.email,
        name: user.name,
        displayName: user.displayName ?? user.name,
        photoURL: user.photoURL,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({
      id: user._id.toString(),
      uid: user._id.toString(),
      email: user.email,
      name: user.name,
      displayName: user.displayName ?? user.name,
      photoURL: user.photoURL,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints,
      totalOrders: user.totalOrders,
      totalSpent: user.totalSpent,
      addresses: user.addresses,
      wishlist: user.wishlist,
      createdAt: user.createdAt,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PATCH /api/auth/profile
router.patch('/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const allowed = ['name', 'displayName', 'phone', 'photoURL', 'preferredCategories', 'addresses'];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.user!.id, { $set: updates }, { new: true });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({
      id: user._id.toString(),
      uid: user._id.toString(),
      email: user.email,
      name: user.name,
      displayName: user.displayName ?? user.name,
      photoURL: user.photoURL,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints,
      addresses: user.addresses,
    });
  } catch {
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', requireAuth, async (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Both current and new password are required' }); return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters' }); return;
  }
  try {
    const user = await User.findById(req.user!.id).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      res.status(401).json({ error: 'Current password is incorrect' }); return;
    }
    user.password = newPassword;
    await user.save();
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotLimiter, async (req, res) => {
  const { email } = req.body as { email: string };
  if (!email) { res.status(400).json({ error: 'Email is required' }); return; }

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordResetToken +passwordResetExpires');
    // Always respond with 200 to prevent email enumeration
    if (!user) { res.json({ ok: true, message: 'If an account exists, a reset link has been sent.' }); return; }

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(user.email, token);
    } catch (mailErr) {
      // Reset token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ error: 'Failed to send reset email. Please try again.' }); return;
    }

    res.json({ ok: true, message: 'If an account exists, a reset link has been sent.' });
  } catch {
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body as { token: string; password: string };
  if (!token || !password) {
    res.status(400).json({ error: 'Token and new password are required' }); return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' }); return;
  }

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password +passwordResetToken +passwordResetExpires');

    if (!user) {
      res.status(400).json({ error: 'Reset link is invalid or has expired.' }); return;
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ ok: true, message: 'Password has been reset successfully. You can now log in.' });
  } catch {
    res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
});

export default router;
