import { useState, useEffect } from 'react';
import { Lead, Listing } from '../types';
import { AlertCircle, CheckCircle2, Mail, Link, Bell, Zap, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MlsNotificationSystemProps {
  leads: Lead[];
  listings: Listing[];
}

interface MatchNotification {
  id: string;
  leadName: string;
  listingAddress: string;
  listingPrice: string;
  matchScore: string;
  matchedCriteria: string;
  timestamp: string;
  status: 'pending' | 'notified' | 'dismissed';
}

export default function MlsNotificationSystem({ leads, listings }: MlsNotificationSystemProps) {
  const [matches, setMatches] = useState<MatchNotification[]>([]);
  const [activeNotification, setActiveNotification] = useState<MatchNotification | null>(null);

  // Hardcoded match templates that correspond to our Hottest 5 Leads in constants
  const matchingPool = [
    {
      leadName: 'Alex Turner',
      listingAddress: '64 Birchwood Crescent, Toronto',
      listingPrice: '$1,180,000',
      matchScore: '98%',
      matchedCriteria: 'Toronto, Budget < $1.2M, Single Family'
    },
    {
      leadName: 'Nicole Park',
      listingAddress: '402-98 Waterfront Rd, Vancouver',
      listingPrice: '$830,000',
      matchScore: '95%',
      matchedCriteria: 'Vancouver, Budget < $850K, Condo'
    },
    {
      leadName: 'Robert Chen',
      listingAddress: '15-E 11th St, New York',
      listingPrice: '$620,000',
      matchScore: '94%',
      matchedCriteria: 'New York, Budget < $650K, Townhouse'
    },
    {
      leadName: 'Samantha Lee',
      listingAddress: '104 Lakeshore Dr, Oakville',
      listingPrice: '$1,950,000',
      matchScore: '97%',
      matchedCriteria: 'Oakville, Budget < $2.1M, Single Family'
    },
    {
      leadName: 'Linda Duarte',
      listingAddress: '312 Birchwood Rd, Markham',
      listingPrice: '$1,150,000',
      matchScore: '92%',
      matchedCriteria: 'Markham, Single Family'
    }
  ];

  useEffect(() => {
    // Initial load some matches
    setMatches([
      {
        id: 'match-1',
        leadName: 'Alex Turner',
        listingAddress: '102-52 Maple Ave, Toronto',
        listingPrice: '$1,150,000',
        matchScore: '96%',
        matchedCriteria: 'Toronto, Budget < $1.2M, Single Family',
        timestamp: '5 min ago',
        status: 'pending'
      },
      {
        id: 'match-2',
        leadName: 'Nicole Park',
        listingAddress: '88 Coal Harbour Blvd, Vancouver',
        listingPrice: '$825,000',
        matchScore: '94%',
        matchedCriteria: 'Vancouver, Budget < $850K, Condo',
        timestamp: '42 min ago',
        status: 'notified'
      }
    ]);

    // Simulate real-time background parsing of MLS ticker
    const timer = setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * matchingPool.length);
      const matchCandidate = matchingPool[randomIndex];
      
      const newMatch: MatchNotification = {
        id: `match-${Date.now()}`,
        leadName: matchCandidate.leadName,
        listingAddress: matchCandidate.listingAddress,
        listingPrice: matchCandidate.listingPrice,
        matchScore: matchCandidate.matchScore,
        matchedCriteria: matchCandidate.matchedCriteria,
        timestamp: 'Just now',
        status: 'pending'
      };

      setMatches(prev => [newMatch, ...prev]);
      setActiveNotification(newMatch);
    }, 8000); 

    return () => clearTimeout(timer);
  }, []);

  const handleTriggerCampaign = (matchId: string) => {
    setMatches(prev => 
      prev.map(m => m.id === matchId ? { ...m, status: 'notified' } : m)
    );
    if (activeNotification?.id === matchId) {
      setActiveNotification(null);
    }
  };

  const handleDismiss = (matchId: string) => {
    setMatches(prev => 
      prev.map(m => m.id === matchId ? { ...m, status: 'dismissed' } : m)
    );
    if (activeNotification?.id === matchId) {
      setActiveNotification(null);
    }
  };

  // Only display non-dismissed alerts
  const displayMatches = matches.filter(m => m.status !== 'dismissed');

  return (
    <div className="bg-navy-mid/60 border border-gold/18 rounded-lg p-5 flex flex-col justify-between" id="mls-match-matrix">
      {/* Real-time Toast Match popups */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-8 z-[210] max-w-sm bg-navy border-2 border-gold rounded-xl p-4 shadow-[0_0_30px_rgba(201,168,76,0.3)] backdrop-blur-xl"
          >
             <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0 animate-bounce">
                   <Bell className="w-4 h-4 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gold uppercase tracking-wider">AI Instant Match Engine</span>
                      <button onClick={() => setActiveNotification(null)} className="text-slate hover:text-white"><X className="w-3.5 h-3.5" /></button>
                   </div>
                   <h5 className="text-xs font-bold text-white mt-1">New MLS listing found!</h5>
                   <p className="text-[11px] text-slate-light mt-0.5 leading-normal">
                      Matched to top lead <strong className="text-white">{activeNotification.leadName}</strong> with <span className="text-gold font-bold">{activeNotification.matchScore} compatibility</span>.
                   </p>
                   <div className="mt-2 text-[9px] bg-white/5 p-1.5 rounded text-slate-light font-mono truncate">
                      📍 {activeNotification.listingAddress} ({activeNotification.listingPrice})
                   </div>
                   <div className="flex items-center gap-2 mt-3">
                      <button 
                        onClick={() => handleTriggerCampaign(activeNotification.id)}
                        className="px-2.5 py-1 bg-gold text-navy text-[9px] font-bold uppercase tracking-widest rounded-md hover:bg-gold-light transition-all flex items-center gap-1"
                      >
                         <Zap className="w-2.5 h-2.5" /> Launch Inbound Campaign
                      </button>
                      <button 
                        onClick={() => setActiveNotification(null)}
                        className="px-2.5 py-1 bg-white/5 border border-white/10 text-slate hover:text-white text-[9px] font-bold uppercase rounded-md transition-all"
                      >
                         Review Later
                      </button>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center border border-gold/25 shadow-[0_0_10px_rgba(201,168,76,0.1)]">
              <Bell className="w-4 h-4 text-gold" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Automated MLS Match Matrix Alerts</h3>
              <p className="text-[9px] text-slate font-bold uppercase tracking-widest mt-0.5">Dual-cross-indexing leads parameters to live MLS</p>
            </div>
          </div>
          <span className="text-[8px] bg-green-500/10 border border-green-500/20 text-green-400 font-bold uppercase px-2 py-0.5 rounded animate-pulse">
             Monitor Online
          </span>
        </div>

        <div className="space-y-3 max-h-[295px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/5">
          {displayMatches.length === 0 ? (
            <div className="py-12 text-center text-slate">
              <ShieldAlert className="w-8 h-8 text-slate/20 mx-auto mb-2" />
              <p className="text-xs">No active listing matches registered in local grid queue.</p>
            </div>
          ) : (
            displayMatches.map(m => (
              <div 
                key={m.id}
                className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col gap-2 relative group hover:border-gold/20 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-gold" />
                     <span className="text-xs font-bold text-white leading-none">Matched Lead: {m.leadName}</span>
                  </div>
                  <span className="text-[10px] text-gold font-bold font-mono">{m.matchScore} Match</span>
                </div>

                <div className="text-[11px] text-slate-light pl-4 leading-relaxed">
                   New listing index: <strong className="text-cream">{m.listingAddress}</strong> listed for <strong className="text-gold">{m.listingPrice}</strong>.
                   <div className="text-[9px] text-slate font-bold uppercase tracking-[1px] mt-1 flex items-center gap-1.5">
                      <span className="inline-block px-1 bg-white/5 rounded">Criteria:</span> {m.matchedCriteria}
                   </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-2 pl-4 mt-1">
                   <span className="text-[9px] text-slate italic">{m.timestamp}</span>
                   <div className="flex items-center gap-2">
                      {m.status === 'pending' ? (
                        <>
                           <button 
                             onClick={() => handleTriggerCampaign(m.id)}
                             className="px-2.5 py-1 bg-gold/10 border border-gold/20 text-gold hover:bg-gold hover:text-navy text-[9px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1"
                             title="Automatically drafts CRM email with comparative analysis"
                           >
                              <Mail className="w-3 h-3" /> Draft AI Match Sequence
                           </button>
                           <button 
                             onClick={() => handleDismiss(m.id)}
                             className="text-slate hover:text-white px-2.5 py-1 text-[9px] font-bold uppercase"
                           >
                              Ignore
                           </button>
                        </>
                      ) : (
                        <span className="text-green-400 font-bold text-[9px] flex items-center gap-1">
                           <CheckCircle2 className="w-3 h-3 text-green-400" /> A2A Sequences Triggered
                        </span>
                      )}
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-light">
         <span>Sync interval: Immediately upon MLS update</span>
         <span className="text-slate">Total matches parsed MTD: 34</span>
      </div>
    </div>
  );
}
