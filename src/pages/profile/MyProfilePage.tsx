import React, { useState, useEffect } from 'react';
import { FiEdit2, FiCopy, FiCheck, FiShield, FiUser, FiMail, FiKey, FiX, FiInfo } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import { cn } from '../../utils/cn';

// Mock Data
const MOCK_USER = {
  id: 'aa222222-2222-2222-2222-222222222222',
  username: 'client',
  full_name: 'Demo Client',
  email: 'client@srss.com',
  role: 'Client',
};

const ROLE_BADGE_STYLES: Record<string, string> = {
  Admin: 'bg-violet-100 text-violet-700 border-violet-200 ring-violet-500/10',
  Reviewer: 'bg-blue-100 text-blue-700 border-blue-200 ring-blue-500/10',
  Client: 'bg-emerald-100 text-emerald-700 border-emerald-200 ring-emerald-500/10',
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

/** Inline editable field component */
const EditableField: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  onSave: (val: string) => void;
}> = ({ icon, label, value, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const handleSave = () => {
    if (draft.trim() && draft.trim() !== value) {
      onSave(draft.trim());
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div className="flex items-start gap-4 py-3 group">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-200 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</label>
        {editing ? (
          <div className="flex items-center gap-2 mt-1">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
              autoFocus
              className="h-10 text-sm"
              aria-label={`Edit ${label}`}
            />
            <button
              onClick={handleSave}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-all duration-200 shadow-sm shadow-primary/20"
              aria-label="Save"
            >
              <FiCheck className="w-5 h-5" />
            </button>
            <button
              onClick={handleCancel}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-all duration-200"
              aria-label="Cancel"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <span className="text-text-main font-medium text-base truncate">{value}</span>
            <button
              onClick={() => setEditing(true)}
              className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-8 h-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 flex items-center justify-center transition-all duration-200"
              aria-label={`Edit ${label}`}
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ReadOnlyField: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  copyable?: boolean;
}> = ({ icon, label, value, copyable }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="flex items-start gap-4 py-3 group">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</label>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className={cn(
            "text-text-main font-medium text-base truncate",
            label.toLowerCase().includes('id') && "font-mono text-sm tracking-tight"
          )}>
            {value}
          </span>
          {copyable && (
            <button
              onClick={handleCopy}
              className="flex-shrink-0 w-8 h-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 flex items-center justify-center transition-all duration-200 relative"
              aria-label={`Copy ${label}`}
            >
              {copied ? <FiCheck className="w-4 h-4 text-emerald-500" /> : <FiCopy className="w-4 h-4" />}
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300">
                  Copied!
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const MyProfilePage: React.FC = () => {
  const [user, setUser] = useState(MOCK_USER);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: "Passwords don't match." });
      return;
    }

    setIsSubmitting(true);
    // Mock API call
    setTimeout(() => {
      if (currentPassword !== 'password') {
        setStatus({ type: 'error', message: "Current password is incorrect." });
        setIsSubmitting(false);
        return;
      }

      setStatus({ type: 'success', message: 'Password successfully updated!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsSubmitting(false);
      
      setTimeout(() => {
        setIsResettingPassword(false);
        setStatus(null);
      }, 2500);
    }, 1000);
  };

  const roleStyles = ROLE_BADGE_STYLES[user.role] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="min-h-screen bg-slate-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-primary to-brand-400 relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
          </div>
          
          <div className="px-8 pb-8">
            <div className="relative flex items-end justify-between -mt-12 mb-6">
              {/* Avatar */}
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-3xl font-bold shadow-2xl border-4 border-white ring-8 ring-slate-50 select-none">
                {getInitials(user.full_name)}
              </div>
              
              <div className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold border ring-4 transition-all duration-300",
                roleStyles
              )}>
                {user.role}
              </div>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user.full_name}</h1>
              <p className="text-slate-500 font-medium">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
          {/* Account Information Section */}
          <section className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-6 bg-primary rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900">Account Information</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
              <ReadOnlyField 
                icon={<FiKey className="w-5 h-5" />} 
                label="User ID" 
                value={user.id} 
                copyable 
              />
              <ReadOnlyField 
                icon={<FiMail className="w-5 h-5" />} 
                label="Email Address" 
                value={user.email} 
              />
              <EditableField 
                icon={<FiUser className="w-5 h-5" />} 
                label="Full Name" 
                value={user.full_name} 
                onSave={(val) => setUser(p => ({ ...p, full_name: val }))}
              />
              <EditableField 
                icon={<FiUser className="w-5 h-5" />} 
                label="Username" 
                value={user.username} 
                onSave={(val) => setUser(p => ({ ...p, username: val }))}
              />
            </div>
          </section>

          {/* Security & Password Section */}
          <section className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-slate-900">Security</h2>
              </div>
            </div>

            {!isResettingPassword ? (
              <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-emerald-200 hover:bg-emerald-50/20 transition-all duration-300">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-300">
                    <FiShield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Password</h3>
                    <p className="text-sm text-slate-500">Protect your account with a strong password.</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsResettingPassword(true)}
                  className="rounded-xl px-6"
                >
                  Change
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
                  <button 
                    type="button" 
                    onClick={() => {
                        setIsResettingPassword(false);
                        setStatus(null);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                    }}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {status && (
                  <div className={cn(
                    "p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300",
                    status.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                  )}>
                    {status.type === 'success' ? <FiCheck className="w-5 h-5" /> : <FiInfo className="w-5 h-5" />}
                    {status.message}
                  </div>
                )}

                <div className="space-y-5">
                    <FormField
                        id="current-password"
                        label="Current Password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField
                            id="new-password"
                            label="New Password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            helperText="At least 8 characters"
                        />
                        <FormField
                            id="confirm-password"
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            errorMessage={confirmPassword && newPassword !== confirmPassword ? "Passwords do not match" : undefined}
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    type="submit" 
                    isLoading={isSubmitting}
                    disabled={isSubmitting || (!!newPassword && newPassword !== confirmPassword)}
                    className="flex-1 rounded-xl h-12"
                  >
                    Update Password
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                        setIsResettingPassword(false);
                        setStatus(null);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                    }}
                    disabled={isSubmitting}
                    className="rounded-xl h-12 px-8"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </section>
        </div>

        {/* Footer Info */}
        <div className="text-center">
            <p className="text-xs text-slate-400 font-medium">
                Last account activity: April 15, 2026 at 1:46 PM
            </p>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
