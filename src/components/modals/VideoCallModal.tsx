import { motion, AnimatePresence } from 'motion/react';
import { X, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Settings, Maximize2, Users, MessageSquare, Shield, Info, MoreVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Contact } from '../../types';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
}

export default function VideoCallModal({ isOpen, onClose, contact }: VideoCallModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && !isConnecting) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isConnecting]);

  useEffect(() => {
    if (isOpen) {
      setIsConnecting(true);
      const timer = setTimeout(() => setIsConnecting(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setCallDuration(0);
    }
  }, [isOpen]);

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/95 backdrop-blur-md" 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full h-full max-w-6xl aspect-video bg-navy-mid border border-white/10 rounded-none md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Main Stage */}
          <div className="flex-1 relative bg-navy overflow-hidden">
            {/* Remote Video (Mock) */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isConnecting ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center animate-pulse">
                    <span className="text-4xl font-serif font-bold text-gold">{contact?.name?.[0] || 'A'}</span>
                  </div>
                  <div className="text-gold font-bold text-xs uppercase tracking-[0.3em] animate-pulse">Establishing Secure Link...</div>
                </div>
              ) : (
                <div className="w-full h-full relative group">
                  {/* Remote Participant Placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-b from-navy/40 to-navy-mid/80" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-32 h-32 rounded-3xl bg-gold/5 border border-gold/20 flex items-center justify-center text-5xl font-serif font-bold text-gold/30 mb-4 shadow-2xl">
                      {contact?.name?.[0] || 'A'}
                    </div>
                    <div className="text-xl font-bold text-white mb-2">{contact?.name || 'Sovereign Client'}</div>
                    <div className="text-xs text-slate-light font-bold uppercase tracking-widest bg-navy/60 px-3 py-1 rounded-full border border-white/10">In Call</div>
                  </div>

                  {/* Watermark/UI Overlay */}
                  <div className="absolute top-8 left-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center shadow-lg">
                      <VideoIcon className="w-6 h-6 text-navy" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] leading-none">Neural Meeting Pro</div>
                      <div className="text-[11px] font-bold text-white mt-1">E2E Encrypted Matrix Link</div>
                    </div>
                  </div>

                  <div className="absolute top-8 right-8 flex items-center gap-4">
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-white">{formatDuration(callDuration)}</span>
                     </div>
                     <button className="p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-slate hover:text-white transition-all">
                        <Settings className="w-4 h-4" />
                     </button>
                  </div>
                </div>
              )}
            </div>

            {/* Picture-in-Picture (Local Video) */}
            <div className="absolute bottom-24 right-8 w-48 aspect-video bg-navy-mid border border-gold/40 rounded-xl shadow-2xl overflow-hidden group">
               {!isVideoOff ? (
                 <div className="w-full h-full bg-gradient-to-br from-slate-400/20 to-navy-mid flex items-center justify-center relative">
                    <span className="text-xs font-bold text-gold/40">YOU</span>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all" />
                 </div>
               ) : (
                 <div className="w-full h-full bg-navy flex flex-col items-center justify-center">
                    <VideoOff className="w-6 h-6 text-red-400/50 mb-1" />
                    <span className="text-[8px] font-bold text-red-400/50 uppercase">Camera Off</span>
                 </div>
               )}
               <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 rounded text-[7px] font-bold text-white uppercase tracking-tighter">Local Stream</div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-4 z-50">
               <button 
                 onClick={() => setIsMuted(!isMuted)}
                 className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
               >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
               </button>
               <button 
                 onClick={() => setIsVideoOff(!isVideoOff)}
                 className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
               >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
               </button>
               <button 
                 onClick={onClose}
                 className="w-16 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center hover:bg-red-500 transition-all shadow-lg hover:shadow-red-600/20"
               >
                  <PhoneOff className="w-6 h-6" />
               </button>
               <div className="w-10 h-10 bg-white/5 mx-2 rounded-full hidden md:flex items-center justify-center text-slate">
                  <Maximize2 className="w-4 h-4" />
               </div>
               <div className="w-px h-8 bg-white/10" />
               <div className="flex items-center gap-1">
                  <button className="w-12 h-12 rounded-full flex items-center justify-center text-slate hover:bg-white/10 hover:text-white transition-all">
                     <MessageSquare className="w-5 h-5" />
                  </button>
                  <button className="w-12 h-12 rounded-full flex items-center justify-center text-slate hover:bg-white/10 hover:text-white transition-all">
                     <Users className="w-5 h-5" />
                  </button>
               </div>
            </div>

            {/* Active Specialist Overlay */}
            <div className="absolute bottom-24 left-8 max-w-xs p-4 bg-navy/40 backdrop-blur-xl border border-gold/30 rounded-2xl shadow-2xl">
               <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded bg-gold/10 flex items-center justify-center">
                     <Shield className="w-4 h-4 text-gold shadow-[0_0_8px_#C9A84C]" />
                  </div>
                  <div>
                     <div className="text-[9px] font-bold text-gold uppercase tracking-[0.2em] leading-none">Security Agent</div>
                     <div className="text-[10px] font-bold text-white mt-1">Matrix Link Verified</div>
                  </div>
               </div>
               <p className="text-[9px] text-slate leading-relaxed italic">"Orchestrator Agent has linked this meeting to the <strong>{contact?.name || 'Client'}</strong> transaction timeline."</p>
            </div>
          </div>
          
          {/* Side Info Bar (Desktop Only) */}
          <div className="hidden lg:flex w-72 bg-navy-mid border-l border-white/5 flex-col">
             <div className="p-6 border-b border-white/5">
                <h3 className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-4">Meeting Intelligence</h3>
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center border border-white/5">
                         <Users className="w-5 h-5 text-slate" />
                      </div>
                      <div>
                         <div className="text-[11px] font-bold text-white">Participants (2)</div>
                         <div className="text-[9px] text-slate mt-0.5">You, {contact?.name}</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center border border-white/5">
                         <Info className="w-5 h-5 text-slate" />
                      </div>
                      <div>
                         <div className="text-[11px] font-bold text-white">Contextual Sync</div>
                         <div className="text-[9px] text-slate mt-0.5">Asset Index: P-4422</div>
                      </div>
                   </div>
                </div>
             </div>
             <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white/5">
                <div className="text-[9px] font-bold text-slate uppercase tracking-widest mb-4">Live Transcription (AI)</div>
                <div className="space-y-4">
                   <div className="space-y-1">
                      <div className="text-[8px] font-bold text-gold uppercase">You</div>
                      <p className="text-[10px] text-white/80 bg-white/5 p-2 rounded-lg">Welcome to the briefing. I've prepared the virtual tour for 124 Park Ave...</p>
                   </div>
                   <div className="space-y-1 opacity-60">
                      <div className="text-[8px] font-bold text-blue-400 uppercase tracking-tighter">Waiting for Voice...</div>
                   </div>
                </div>
             </div>
             <div className="p-6 border-t border-white/5 space-y-3">
                <button className="w-full py-2 bg-navy border border-white/10 rounded-lg text-[9px] font-bold text-slate hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                   <MoreVertical className="w-3 h-3" /> Call Settings
                </button>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
