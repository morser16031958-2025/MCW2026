
import React from 'react';
import { ChatSession, User } from '../types';
import { Plus, Trash2, MessageSquare, Snowflake, Layers, Clock, User as UserIcon, ChevronRight, LayoutDashboard } from 'lucide-react';
import { MODELS } from '../constants';
import { translations, Language } from '../translations';

interface SidebarProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onCreateChat: () => void;
  onDeleteChat: (id: string) => void;
  onSelectChat: (id: string) => void;
  onShowDashboard: () => void;
  onLogout: () => void;
  user: User;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  chats, 
  activeChatId, 
  onCreateChat, 
  onDeleteChat, 
  onSelectChat, 
  onShowDashboard,
  onLogout,
  user,
  language,
  setLanguage
}) => {
  const t = translations[language];

  return (
    <aside className="w-80 bg-slate-950 border-r border-slate-800/80 flex flex-col h-full relative z-20 shadow-2xl">
      <div className="p-8 pb-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40 group-hover:rotate-12 transition-transform">
              <Snowflake className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tighter text-white block">{t.brand}</span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">{t.winterEdition}</span>
            </div>
          </div>
          
          <button 
            onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-white"
          >
            <span className="text-[10px] font-black">{language.toUpperCase()}</span>
          </button>
        </div>
        
        <button 
          onClick={onCreateChat}
          className="w-full flex items-center justify-between py-4 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all font-bold shadow-lg shadow-blue-950/50 group"
        >
          <span className="flex items-center gap-3">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            {t.newThread}
          </span>
          <Layers className="w-4 h-4 opacity-50" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-6 custom-scrollbar">
        <div className="px-4 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.activeChannels}</span>
            <span className="text-[10px] font-black text-slate-700 bg-slate-900 px-2 py-0.5 rounded-full">{chats.length}</span>
        </div>
        {chats.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
               <MessageSquare className="w-5 h-5 text-slate-700" />
            </div>
            <p className="text-xs font-medium text-slate-600">{t.noThreads}</p>
          </div>
        ) : (
          chats.map(chat => {
            const modelName = MODELS.find(m => m.id === chat.modelId)?.name || 'Gemini';
            return (
              <div 
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`
                  group relative flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all border
                  ${activeChatId === chat.id 
                    ? 'bg-slate-900 text-white border-blue-500/30 shadow-xl shadow-black/40' 
                    : 'text-slate-500 hover:bg-slate-900/50 hover:text-slate-300 border-transparent'}
                `}
              >
                <div className={`
                  w-2 h-2 rounded-full flex-shrink-0 transition-all
                  ${activeChatId === chat.id ? 'bg-blue-500 scale-125 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-slate-800 group-hover:bg-slate-600'}
                `} />
                
                <div className="flex-1 truncate">
                  <span className="text-sm font-bold block truncate tracking-tight">{chat.title}</span>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-[9px] font-black uppercase tracking-tighter text-blue-400/70">{modelName}</span>
                     <span className="text-[9px] text-slate-700">•</span>
                     <div className="flex items-center gap-1 text-[9px] text-slate-600 font-semibold">
                       <Clock className="w-2.5 h-2.5" />
                       {new Date(chat.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                     </div>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 hover:text-red-400 transition-all rounded-lg"
                  title="Purge thread"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Modern Sidebar Footer */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-900/50 mt-auto space-y-3">
        <button 
          onClick={onShowDashboard}
          className="w-full bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 relative overflow-hidden group hover:bg-slate-800/60 transition-all text-left"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-blue-500/10 transition-colors" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-blue-400 font-black text-sm border border-slate-700/50 shadow-inner group-hover:border-blue-500/30 transition-colors">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col flex-1 truncate">
              <span className="text-[13px] font-bold text-white truncate">{user.login}</span>
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{t.profileInfo}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        <button 
          onClick={onShowDashboard}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-blue-500/5 hover:bg-blue-500/15 border border-blue-500/10 hover:border-blue-500/30 text-blue-400/80 hover:text-blue-400 rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em] group"
        >
          <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform" />
          {t.exitToProfile}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
