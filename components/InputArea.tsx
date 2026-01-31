
import React, { useState, useRef } from 'react';
import { Attachment } from '../types';
import { Send, Paperclip, Mic, X, Video, Music, Loader2, AlertTriangle } from 'lucide-react';
import { translations, Language } from '../translations';

interface InputAreaProps {
  onSend: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
  language: Language;
  isOutOfBalance?: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading, language, isOutOfBalance = false }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const t = translations[language];
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  const handleSubmit = () => {
    if (isOutOfBalance || isLoading) return;
    if (!text.trim() && attachments.length === 0) return;
    onSend(text, attachments);
    setText('');
    setAttachments([]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isOutOfBalance) return;
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files) as File[]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = (event.target?.result as string).split(',')[1];
        setAttachments(prev => [...prev, {
          id: crypto.randomUUID(),
          type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'audio',
          mimeType: file.type,
          data: base64Data,
          url: URL.createObjectURL(file),
        }]);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`p-6 pt-2 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md relative ${isOutOfBalance ? 'opacity-50' : ''}`}>
      {isOutOfBalance && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm rounded-t-3xl">
           <div className="flex items-center gap-3 px-6 py-3 bg-red-600/20 border border-red-500/40 rounded-full animate-pulse">
             <AlertTriangle className="w-4 h-4 text-red-500" />
             <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
               {language === 'ru' ? 'Баланс пуст. Доступ заблокирован.' : 'Balance empty. Access locked.'}
             </span>
           </div>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4 max-h-32 overflow-y-auto p-2">
          {attachments.map(att => (
            <div key={att.id} className="relative group">
              <div className="w-20 h-20 rounded-xl border border-slate-700 overflow-hidden bg-slate-800 shadow-lg">
                {att.type === 'image' ? <img src={att.url} alt="p" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><Music className="w-6 h-6 text-slate-500" /></div>}
              </div>
              <button onClick={() => setAttachments(p => p.filter(a => a.id !== att.id))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-3 max-w-5xl mx-auto">
        <div className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-inner flex flex-col">
          <textarea
            value={text}
            disabled={isOutOfBalance}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            placeholder={isOutOfBalance ? "" : t.inputPlaceholder}
            className="w-full bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 p-4 resize-none min-h-[56px] outline-none"
            rows={1}
          />
          <div className="flex items-center justify-between px-3 py-2 border-t border-slate-700/50 bg-slate-900/30">
            <div className="flex items-center gap-1">
              <button onClick={() => fileInputRef.current?.click()} disabled={isOutOfBalance} className="p-2 text-slate-400 hover:text-blue-400"><Paperclip className="w-5 h-5" /></button>
              <button disabled={isOutOfBalance} className="p-2 text-slate-400 hover:text-blue-400"><Mic className="w-5 h-5" /></button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
            <span className="text-[10px] text-slate-600 font-medium uppercase tracking-tighter">{t.pressEnter}</span>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={isLoading || isOutOfBalance || (!text.trim() && attachments.length === 0)} className={`p-4 rounded-2xl flex items-center justify-center ${isLoading || isOutOfBalance || (!text.trim() && attachments.length === 0) ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 text-white shadow-lg'}`}>
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};

export default InputArea;
