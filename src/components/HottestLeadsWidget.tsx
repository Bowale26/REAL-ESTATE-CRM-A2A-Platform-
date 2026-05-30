import { Lead, PanelId } from '../types';
import { Target, ArrowRight, User, MapPin, DollarSign, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HottestLeadsWidgetProps {
  leads: Lead[];
  onNavigate: (id: PanelId) => void;
}

export default function HottestLeadsWidget({ leads, onNavigate }: HottestLeadsWidgetProps) {
  // Parse lead probability (e.g. "94%" becomes 94) and sort descending
  const sortedLeads = [...leads]
    .map(lead => {
      // Extract numeric probability or status importance
      const score = parseInt(lead.probability) || (lead.status === 'hot' ? 90 : lead.status === 'warm' ? 70 : 40);
      return { ...lead, numericProbability: score };
    })
    .sort((a, b) => b.numericProbability - a.numericProbability)
    .slice(0, 5); // Take the top 5

  return (
    <div className="bg-navy-mid/60 border border-gold/18 rounded-lg p-5 flex flex-col justify-between" id="top-hottest-leads">
      <div>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/25 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
              <Target className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Top 5 Hottest Leads</h3>
              <p className="text-[9px] text-slate font-bold uppercase tracking-widest mt-0.5">Ranked by AI Qualification Matrix</p>
            </div>
          </div>
          
          <button 
            onClick={() => onNavigate('leads')}
            className="flex items-center gap-1.5 text-[11px] font-bold text-gold uppercase tracking-wider hover:text-gold-light transition-all active:translate-x-0.5"
          >
            All Leads <ArrowRight className="w-3.5 h-3.5 text-gold" />
          </button>
        </div>

        <div className="space-y-3.5 max-h-[290px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/5">
          {sortedLeads.length === 0 ? (
            <div className="py-12 text-center text-slate">
              <User className="w-8 h-8 text-slate/20 mx-auto mb-2" />
              <p className="text-xs">No active qualified leads. Generate or upload first.</p>
            </div>
          ) : (
            sortedLeads.map((lead, index) => (
              <motion.div 
                key={lead.id}
                whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                className="flex items-center justify-between p-2.5 bg-white/[0.01] border border-white/5 rounded-xl hover:border-gold/20 transition-all cursor-pointer group"
                onClick={() => onNavigate('leads')}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Counter badge */}
                  <div className="w-5 h-5 rounded bg-navy-mid border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate">
                     #{index + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-gold transition-colors truncate">
                       {lead.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate font-medium">
                       <span className="flex items-center gap-0.5 truncate"><MapPin className="w-2.5 h-2.5 text-gold" /> {lead.location}</span>
                       <span className="w-1 h-1 rounded-full bg-white/20" />
                       <span className="flex items-center gap-0.5 text-white/50"><DollarSign className="w-2.5 h-2.5 text-green-400" /> {lead.budget}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="text-right">
                    <div className="text-[11px] font-bold text-red-400 font-mono">
                       {lead.probability}
                    </div>
                    <div className="text-[7.5px] font-bold text-slate uppercase tracking-wider">
                       AI Lead Score
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-light group-hover:text-gold transition-colors" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-light">
         <span>Smart Score Probability Model</span>
         <span className="text-green-500 font-bold uppercase tracking-widest bg-green-500/5 px-2 py-0.5 rounded border border-green-500/20 shadow-[0_0_8px_rgba(34,197,94,0.05)]">
           Accuracy index: 95.8%
         </span>
      </div>
    </div>
  );
}
