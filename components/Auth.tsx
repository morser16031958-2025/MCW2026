
import React, { useState } from 'react';
import { db } from '../services/db';
import { User } from '../types';
import { Snowflake, User as UserIcon, Lock, ArrowRight, Sparkles, Languages, Loader2 } from 'lucide-react';
import { translations, Language } from '../translations';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, language, setLanguage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      if (!login || !password) throw new Error(t.errorFields);
      
      const user = isLogin 
        ? await db.login(login, password) 
        : await db.register(login, password);
        
      if (user) {
        onAuthSuccess(user);
      } else {
        throw new Error("Не удалось получить данные пользователя");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#020617] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[160px] animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-1 bg-gradient-to-b from-blue-500/20 to-transparent rounded-[3rem]">
        <div className="bg-slate-900/80 backdrop-blur-3xl border border-white/5 rounded-[2.9rem] p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-700 relative">
          
          <button 
            onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
            className="absolute top-8 right-8 flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
          >
            <Languages className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">
              {language === 'en' ? 'RU' : 'EN'}
            </span>
          </button>

          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/40 relative group">
              <div className="absolute inset-0 bg-white/20 rounded-3xl animate-ping opacity-20"></div>
              <Snowflake className="w-10 h-10 text-white animate-spin-slow" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">{t.brand}</h1>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">{t.winterEdition}</p>
          </div>

          <div className="flex bg-slate-950/50 p-1.5 rounded-2xl mb-8 border border-white/5">
            <button 
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t.signIn}
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${!isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t.register}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.username}</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder={t.loginPlaceholder}
                  className="w-full bg-slate-950/50 border border-slate-800/50 focus:border-blue-500/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-700 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.password}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full bg-slate-950/50 border border-slate-800/50 focus:border-blue-500/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-700 outline-none text-sm font-medium"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold uppercase tracking-wider text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isPending}
              className="group w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : isLogin ? t.accessBtn : t.createBtn}
              {!isPending && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-10 flex items-center justify-center gap-2 opacity-30">
             <Sparkles className="w-4 h-4 text-blue-400" />
             <span className="text-[9px] font-black text-white uppercase tracking-[0.4em]">{t.portal}</span>
          </div>
        </div>
      </div>
      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Auth;
