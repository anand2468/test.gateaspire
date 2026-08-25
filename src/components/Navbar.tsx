import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserProfile, BranchType } from '../types';
import { 
  BarChart3, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Target,
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  selectedBranch: BranchType;
  setSelectedBranch: (branch: BranchType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onLogout,
  selectedBranch,
  setSelectedBranch
}) => {
  const branches: BranchType[] = ['CS', 'ECE', 'EE', 'ME', 'CE', 'IN'];
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full bg-black/90 backdrop-blur-md border-b border-zinc-800 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-white text-black flex items-center justify-center font-mono font-black text-lg group-hover:bg-zinc-200 transition shadow-sm">
              G
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-zinc-200 transition">GATE ASPIRE</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              </div>
              <p className="text-[10px] text-zinc-400 tracking-wider font-mono uppercase">Minimalist Prep Engine</p>
            </div>
          </button>
        </div>

        {/* Main Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`
            }
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </NavLink>

          <NavLink
            to="/pyqs"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`
            }
          >
            <BookOpen className="w-4 h-4" />
            PYQs & Practice
          </NavLink>

          <NavLink
            to="/tests"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`
            }
          >
            <FileText className="w-4 h-4" />
            Test Series
          </NavLink>

          <NavLink
            to="/planner"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`
            }
          >
            <Target className="w-4 h-4" />
            Goals & Schedule
          </NavLink>

          <NavLink
            to="/community"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`
            }
          >
            <MessageSquare className="w-4 h-4" />
            Community
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`
            }
          >
            <UserIcon className="w-4 h-4" />
            Profile & Stream
          </NavLink>
        </nav>

        {/* User Auth Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/profile')}
                className="hidden sm:flex flex-col text-right hover:opacity-80 transition"
              >
                <span className="text-xs font-bold text-white truncate max-w-[120px]">{user.displayName}</span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {user.branch || selectedBranch} • GATE {user.targetYear || 2026}
                </span>
              </button>
              <div className="relative group">
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center overflow-hidden focus:outline-none hover:border-zinc-500 transition"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-white">{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'G'}</span>
                  )}
                </button>
                <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  <div className="px-3 py-2 border-b border-zinc-800">
                    <p className="text-xs font-semibold text-white">{user.displayName}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {user.branch || selectedBranch}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-400 border border-zinc-800">
                        GATE {user.targetYear || 2026}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate('/profile')} 
                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-900 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-zinc-400" /> My Profile & Stream
                  </button>

                  <button 
                    onClick={() => navigate('/')} 
                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-900 flex items-center gap-2"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-zinc-400" /> Dashboard Analytics
                  </button>

                  {user.role === 'admin' && (
                    <button 
                      onClick={() => navigate('/admin')} 
                      className="w-full text-left px-3 py-2 text-xs text-emerald-400 hover:bg-zinc-900 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Admin Control
                    </button>
                  )}

                  <button 
                    onClick={onLogout} 
                    className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-zinc-900 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-lg transition shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tab Strip */}
      <div className="lg:hidden flex items-center justify-around border-t border-zinc-800 px-1 py-2 bg-black text-xs overflow-x-auto gap-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `flex flex-col items-center gap-1 px-2 py-1 shrink-0 ${isActive ? 'text-white font-bold' : 'text-zinc-500'}`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-[10px]">Dashboard</span>
        </NavLink>
        <NavLink
          to="/pyqs"
          className={({ isActive }) => `flex flex-col items-center gap-1 px-2 py-1 shrink-0 ${isActive ? 'text-white font-bold' : 'text-zinc-500'}`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px]">PYQs</span>
        </NavLink>
        <NavLink
          to="/tests"
          className={({ isActive }) => `flex flex-col items-center gap-1 px-2 py-1 shrink-0 ${isActive ? 'text-white font-bold' : 'text-zinc-500'}`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[10px]">Tests</span>
        </NavLink>
        <NavLink
          to="/planner"
          className={({ isActive }) => `flex flex-col items-center gap-1 px-2 py-1 shrink-0 ${isActive ? 'text-white font-bold' : 'text-zinc-500'}`}
        >
          <Target className="w-4 h-4" />
          <span className="text-[10px]">Goals</span>
        </NavLink>
        <NavLink
          to="/community"
          className={({ isActive }) => `flex flex-col items-center gap-1 px-2 py-1 shrink-0 ${isActive ? 'text-white font-bold' : 'text-zinc-500'}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-[10px]">Forum</span>
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => `flex flex-col items-center gap-1 px-2 py-1 shrink-0 ${isActive ? 'text-white font-bold' : 'text-zinc-500'}`}
        >
          <UserIcon className="w-4 h-4" />
          <span className="text-[10px]">Profile</span>
        </NavLink>
      </div>
    </header>
  );
};
