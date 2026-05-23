import { useState, useEffect } from 'react';
import { useRouter } from '@/hooks/useNextRouter';
import { User, Lock, Save, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { updateUserProfile, changePassword } from '@/lib/services/authService';

const inputCls =
  'w-full px-3 py-2.5 text-sm border border-[var(--border-default)] focus:outline-none focus:border-black transition-colors bg-white';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, setUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth/login?redirect=/account/profile'); return; }
    setName(user.displayName || user.name || '');
    setPhone((user as unknown as { phone?: string }).phone ?? '');
  }, [user, authLoading]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateUserProfile({ name, displayName: name, phone });
      setUser({ ...user, ...updated });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setChangingPwd(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const message = (err as { message?: string }).message ?? 'Failed to change password';
      toast.error(message);
    } finally {
      setChangingPwd(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center gap-2">
        <Link href="/account" className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-black transition-colors">
          <ArrowLeft size={14} /> Account
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">My Profile</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">{user.email}</p>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSaveProfile} className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <User size={16} />
          <h2 className="font-semibold text-sm">Personal Information</h2>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputCls}
            placeholder="+92 3XX XXXXXXX"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5">Email Address</label>
          <input
            type="email"
            value={user.email}
            disabled
            className={`${inputCls} bg-[var(--neutral-50)] text-[var(--text-muted)] cursor-not-allowed`}
          />
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5">Loyalty Points</label>
          <div className={`${inputCls} bg-[var(--neutral-50)] text-[var(--text-muted)] cursor-default`}>
            ⭐ {user.loyaltyPoints?.toLocaleString() ?? 0} points
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-bold hover:opacity-80 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <hr className="border-[var(--border-default)]" />

      {/* Change password */}
      <form onSubmit={handleChangePassword} className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Lock size={16} />
          <h2 className="font-semibold text-sm">Change Password</h2>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputCls}
            placeholder="Enter current password"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputCls}
            placeholder="Min. 6 characters"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputCls}
            placeholder="Repeat new password"
          />
        </div>

        <button
          type="submit"
          disabled={changingPwd || !currentPassword || !newPassword}
          className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-bold hover:opacity-80 transition-all disabled:opacity-50"
        >
          {changingPwd ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
          {changingPwd ? 'Changing…' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
