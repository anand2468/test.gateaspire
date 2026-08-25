import React, { useState, useEffect } from 'react';
import { UserProfile, BranchType } from '../types';
import { updateUserProfileInDb } from '../firebase';
import { 
  User, 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  Save, 
  BookOpen, 
  Lock, 
  Sparkles,
  ShieldCheck,
  Flame,
  Award
} from 'lucide-react';

interface ProfilePageProps {
  user: UserProfile | null;
  onUpdateUser: (updatedUser: UserProfile) => void;
  selectedBranch: BranchType;
  setSelectedBranch: (branch: BranchType) => void;
  onOpenAuth: () => void;
  testAttemptsCount?: number;
  bookmarksCount?: number;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onUpdateUser,
  selectedBranch,
  setSelectedBranch,
  onOpenAuth,
  testAttemptsCount = 0,
  bookmarksCount = 0
}) => {
  const branches: { code: BranchType; name: string; desc: string }[] = [
    { code: 'CS', name: 'Computer Science & IT', desc: 'Algorithms, OS, DBMS, Networks, TOC & Compilers' },
    { code: 'ECE', name: 'Electronics & Comm.', desc: 'Signals, Analog & Digital Circuits, Comm Systems' },
    { code: 'EE', name: 'Electrical Engg.', desc: 'Power Systems, Electrical Machines, Control Systems' },
    { code: 'ME', name: 'Mechanical Engg.', desc: 'Thermodynamics, Fluid Mechanics, SOM, Manufacturing' },
    { code: 'CE', name: 'Civil Engg.', desc: 'Structural Engg, Geotechnical, Environmental, Highway' },
    { code: 'IN', name: 'Instrumentation Engg.', desc: 'Transducers, Industrial Instrumentation, Sensors' }
  ];

  const targetYears = [2025, 2026, 2027, 2028];

  const [displayName, setDisplayName] = useState<string>('');
  const [branch, setBranch] = useState<BranchType>(selectedBranch);
  const [targetYear, setTargetYear] = useState<number>(2026);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBranch(user.branch || selectedBranch);
      setTargetYear(user.targetYear || 2026);
    }
  }, [user, selectedBranch]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSaveSuccess(false);

    const updated: UserProfile = {
      ...user,
      displayName: displayName.trim() || 'GATE Aspirant',
      branch: branch,
      targetYear: targetYear
    };

    try {
      await updateUserProfileInDb(updated);
      onUpdateUser(updated);
      setSelectedBranch(branch);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto my-12 shadow-2xl animate-fade-in">
        <div className="w-16 h-16 bg-zinc-900 border border-zinc-700 rounded-2xl flex items-center justify-center mx-auto text-white shadow-inner">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-extrabold tracking-wider">
            AUTHENTICATION REQUIRED
          </span>
          <h2 className="text-2xl font-black text-white mt-3">Profile & Settings Locked</h2>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            Sign in with your Google account to configure your GATE stream (CS, ECE, EE, ME, CE, IN), target exam year, and manage your account.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <button
            onClick={onOpenAuth}
            className="px-6 py-3 bg-white hover:bg-zinc-200 text-black font-extrabold text-sm rounded-xl transition shadow-lg flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Sign In to Access Profile</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-800 border-2 border-zinc-700 overflow-hidden flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-lg">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                <span>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'G'}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold flex items-center gap-1">
                  <User className="w-3 h-3 text-white" /> ACCOUNT PROFILE
                </span>
                {user.role === 'admin' && (
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> ADMIN
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{user.displayName}</h1>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-zinc-950/80 border border-zinc-800/80 px-4 py-3 rounded-xl">
            <div className="text-center px-2">
              <span className="text-xs font-mono text-zinc-500 uppercase block">Stream</span>
              <span className="text-lg font-black text-white">{user.branch || 'CS'}</span>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="text-center px-2">
              <span className="text-xs font-mono text-zinc-500 uppercase block">Target</span>
              <span className="text-lg font-black text-white">{user.targetYear || 2026}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xl">
        
        {/* Section 1: Basic Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
            <User className="w-5 h-5 text-white" />
            <h2 className="text-lg font-extrabold text-white">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5 font-mono uppercase">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5 font-mono uppercase">
                Email Address
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full bg-zinc-950/50 border border-zinc-800/60 rounded-xl px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Stream / Branch Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-white" />
              <h2 className="text-lg font-extrabold text-white">Select Your GATE Engineering Stream</h2>
            </div>
            <span className="text-xs font-mono text-zinc-400">Current: {branch}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {branches.map((b) => {
              const isSelected = branch === b.code;
              return (
                <button
                  type="button"
                  key={b.code}
                  onClick={() => setBranch(b.code)}
                  className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-white text-black border-white shadow-xl scale-[1.01]'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-sm shrink-0 ${
                    isSelected ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {b.code}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-extrabold text-sm ${isSelected ? 'text-black' : 'text-white'}`}>
                        {b.name}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-black shrink-0" />}
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-zinc-700 font-medium' : 'text-zinc-400'}`}>
                      {b.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Target Exam Year */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
            <Calendar className="w-5 h-5 text-white" />
            <h2 className="text-lg font-extrabold text-white">Target GATE Exam Year</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {targetYears.map((yr) => {
              const isSelected = targetYear === yr;
              return (
                <button
                  type="button"
                  key={yr}
                  onClick={() => setTargetYear(yr)}
                  className={`py-3.5 px-4 rounded-xl border text-center font-mono transition-all ${
                    isSelected
                      ? 'bg-white text-black border-white font-black text-base shadow-lg'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white text-sm font-bold'
                  }`}
                >
                  GATE {yr}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Alert */}
        {saveSuccess && (
          <div className="p-4 bg-zinc-800 border border-zinc-700 text-white rounded-xl flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <span className="text-xs font-bold">
              Profile updated successfully! Stream set to <strong>{branch}</strong> and target year set to <strong>GATE {targetYear}</strong>.
            </span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-white hover:bg-zinc-200 text-black font-extrabold text-sm rounded-xl transition shadow-xl flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Stream & Profile Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
