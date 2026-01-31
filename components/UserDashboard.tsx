
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Snowflake, Calendar, ShieldCheck, DollarSign, User as UserIcon, ArrowRight, LogOut, Key, Save } from 'lucide-react';
import { translations, Language } from '../translations';
import { db } from '../services/db';

interface UserDashboardProps {
  user: User;
  onProceed: (updatedUser: User) => void;
  onLogout: () => void;
  language: Language;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onProceed, onLogout, language }) => {
  const t = translations[language];
  const [apiKey, setApiKey] = useState(user.apiKey || '');
  // Fix: User type uses 'balance' property for tracking funds, corrected from 'usdLimit'.
  const [usdLimit, setUsdLimit] = useState(user.balance.toString());
  const [isSaved, setIsSaved] = useState(false);

  // Sync API Key to DB when changed
  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    db.updateApiKey(user.login, val);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Sync Limit to DB when changed
  const handleLimitChange = (val: string) => {
    setUsdLimit(val);
    const numericLimit = parseFloat(val);
    if (!isNaN(numericLimit)) {
      // Fix: Corrected method name to 'updateBalance' which exists on the db service.
      db.updateBalance(user.login, numericLimit);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleStart = () => {
    const numericLimit = parseFloat(usdLimit);
    onProceed({ 
      ...user, 
      apiKey, 
      // Fix: Ensuring the property is correctly mapped back to 'balance'.
      balance: !isNaN(numericLimit) ? numericLimit : user.balance 
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617] flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-blue-600/10 rounded-full blur-[160px] animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-4xl animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                <Snowflake className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-none">{t.authorized}</h1>
                <p className="text-blue-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-1">{t.neuralSession}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {isSaved && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in fade-in slide-in-from-right-4">
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Saved to DB</span>
                </div>
              )}
              <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-slate-950/50 rounded-2xl border border-white/5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.secureConnection}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
            <div className="lg:col-span-1 space-y-6">
              <div className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <UserIcon className="w-20 h-20" />
                </div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-3xl bg-slate-950 flex items-center justify-center mb-6 border border-blue-500/30">
                    <span className="text-2xl font-black text-blue-500">{user.login[0].toUpperCase()}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1">{user.fullName}</h2>
                  <p className="text-xs text-slate-500 font-medium lowercase">@{user.login}</p>
                  
                  <div className="mt-6 w-full pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {t.lastEntry}</span>
                      <span className="text-blue-400">{new Date(user.lastLoginDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
              <div className="bg-slate-950/50 rounded-[2.5rem] border border-white/5 overflow-hidden">
                <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{t.bridgeConfig}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[9px] font-black text-blue-400 uppercase">{t.systemReady}</span>
                  </div>
                </div>
                
                <div className="p-8 space-y-6">
                   <div className="grid grid-cols-1 gap-4">
                      <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5">
                        <span className="text-[9px] font-black text-slate-500 uppercase block mb-3">{t.allocatedLimit} ($)</span>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <input 
                            type="number"
                            step="0.01"
                            value={usdLimit}
                            onChange={(e) => handleLimitChange(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-3 px-4 text-white text-lg font-black tabular-nums outline-none transition-colors"
                          />
                        </div>
                      </div>
                      
                      <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5">
                        <span className="text-[9px] font-black text-slate-500 uppercase block mb-3">{t.apiKey}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                            <Key className="w-5 h-5" />
                          </div>
                          <input 
                            type="password"
                            value={apiKey}
                            onChange={(e) => handleApiKeyChange(e.target.value)}
                            placeholder="sk-or-v1-..."
                            className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500/50 rounded-xl py-3 px-4 text-white placeholder-slate-700 outline-none text-xs font-medium transition-colors"
                          />
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <button 
                  onClick={onLogout}
                  className="flex-1 py-5 bg-slate-800/50 hover:bg-red-500/10 hover:text-red-400 border border-slate-700/50 text-slate-300 font-black rounded-[2rem] transition-all uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-4 group"
                >
                  <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  {t.signOut}
                </button>
                <button 
                  onClick={handleStart}
                  className="flex-[2] py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[2rem] transition-all shadow-2xl shadow-blue-900/40 uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-4 group"
                >
                  {t.accessInterface}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
