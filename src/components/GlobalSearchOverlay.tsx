import { motion } from 'motion/react';
import { Search, Users, Target, Building2, ChevronRight, X } from 'lucide-react';
import { Contact, Lead, Listing, PanelId } from '../types';

interface GlobalSearchOverlayProps {
  onClose: () => void;
  results: {
    contacts: Contact[];
    leads: Lead[];
    listings: Listing[];
  };
  onNavigate: (panel: PanelId) => void;
  isLoading: boolean;
}

export default function GlobalSearchOverlay({ onClose, results, onNavigate, isLoading }: GlobalSearchOverlayProps) {
  const hasResults = results.contacts.length > 0 || results.leads.length > 0 || results.listings.length > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -10 }}
      className="absolute top-14 right-0 w-[480px] bg-navy-mid border border-gold/30 rounded-2xl shadow-2xl overflow-hidden z-[110] backdrop-blur-xl"
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-navy/40">
        <h3 className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">Neural Search Index</h3>
        <button onClick={onClose} className="text-slate hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        {isLoading ? (
          <div className="py-10 flex flex-col items-center justify-center gap-4">
             <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
             <span className="text-[10px] font-bold text-gold uppercase tracking-widest animate-pulse">Scanning Grid...</span>
          </div>
        ) : !hasResults ? (
          <div className="py-10 text-center">
             <Search className="w-10 h-10 text-slate/20 mx-auto mb-4" />
             <p className="text-sm text-slate-light font-medium">No matches found in cross-border index.</p>
             <p className="text-[10px] text-slate mt-1 italic">Try searching for Names, MLS Numbers, or Locations.</p>
          </div>
        ) : (
          <>
            {results.contacts.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-3.5 h-3.5 text-gold/60" />
                  <h4 className="text-[9px] font-bold text-slate uppercase tracking-widest">Contacts ({results.contacts.length})</h4>
                </div>
                <div className="space-y-2">
                  {results.contacts.map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => onNavigate('contacts')}
                      className="w-full flex items-center gap-3 p-2.5 bg-white/5 hover:bg-gold/10 border border-white/5 rounded-xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-[10px] font-bold text-gold">
                        {c.name[0]}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-xs font-bold text-white group-hover:text-gold transition-colors">{c.name}</div>
                        <div className="text-[9px] text-slate">{c.email}</div>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate group-hover:text-gold" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {results.leads.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-3.5 h-3.5 text-red-400/60" />
                  <h4 className="text-[9px] font-bold text-slate uppercase tracking-widest">Leads ({results.leads.length})</h4>
                </div>
                <div className="space-y-2">
                  {results.leads.map(l => (
                    <button 
                      key={l.id} 
                      onClick={() => onNavigate('leads')}
                      className="w-full flex items-center gap-3 p-2.5 bg-white/5 hover:bg-red-400/10 border border-white/5 rounded-xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center text-[10px] font-bold text-red-400 uppercase">
                        {l.status[0]}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">{l.name}</div>
                        <div className="text-[9px] text-slate">📍 {l.location}</div>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate group-hover:text-red-400" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {results.listings.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-3.5 h-3.5 text-blue-400/60" />
                  <h4 className="text-[9px] font-bold text-slate uppercase tracking-widest">Properties ({results.listings.length})</h4>
                </div>
                <div className="space-y-2">
                  {results.listings.map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => onNavigate('properties')}
                      className="w-full flex items-center gap-3 p-2.5 bg-white/5 hover:bg-blue-400/10 border border-white/5 rounded-xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{p.address}</div>
                        <div className="text-[9px] text-slate">MLS: {p.mlsNumber} • {p.status}</div>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate group-hover:text-blue-400" />
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
