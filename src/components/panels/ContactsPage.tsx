import { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Video,
  MapPin, 
  Zap, 
  ChevronRight, 
  RefreshCcw,
  CheckCircle2,
  Tag,
  Star,
  Download,
  Upload,
  Loader2,
  Clock,
  Edit3,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Contact, PanelId } from '../../types';
import ContactDetailsModal from '../modals/ContactDetailsModal';

interface ContactsPageProps {
  contacts: Contact[];
  onAddContact: () => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  onInitiateCall: (contact: Contact) => void;
  onNavigate?: (id: PanelId) => void;
}

export default function ContactsPage({ contacts, onAddContact, onEditContact, onDeleteContact, onInitiateCall, onNavigate }: ContactsPageProps) {
  const [isEnrichingAll, setIsEnrichingAll] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Bulk state managers
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [archivedCount, setArchivedCount] = useState<number | null>(null);

  const handleEnrichAll = () => {
    setIsEnrichingAll(true);
    setEnrichmentProgress(0);
    const interval = setInterval(() => {
      setEnrichmentProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsEnrichingAll(false), 1000);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const handleViewDetails = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailsOpen(true);
  };

  const handleExport = () => {
    // Simulated export
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Name,Email,Phone,Score"].concat(contacts.map(c => `${c.name},${c.email},${c.phone},${c.score}`)).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sovereign_contacts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk action triggers
  const handleToggleSelectId = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map(c => c.id));
    }
  };

  const executeBulkDelete = () => {
    selectedIds.forEach(id => onDeleteContact(id));
    setSelectedIds([]);
    setConfirmDelete(false);
  };

  const executeBulkArchive = () => {
    setArchivedCount(selectedIds.length);
    setSelectedIds([]);
    setTimeout(() => {
      setArchivedCount(null);
    }, 3000);
  };

  return (
    <div className="space-y-6 relative pb-20">
      {/* Header Intelligence */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-serif tracking-tight">Sovereign Contact Network</h2>
          <p className="text-[10px] text-gold font-bold uppercase tracking-[0.2em] mt-1">High-Equity Relationship Management</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate?.('import')}
            className="flex items-center gap-2 px-3 py-1.5 bg-navy/40 border border-white/10 rounded-md text-[11px] font-bold text-slate hover:text-white transition-all"
          >
            <Upload className="w-3.5 h-3.5" /> Import
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 bg-navy/40 border border-white/10 rounded-md text-[11px] font-bold text-slate hover:text-white transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export Intelligence
          </button>
          <button 
            onClick={handleEnrichAll}
            disabled={isEnrichingAll}
            className="flex items-center gap-2 px-4 py-1.5 bg-gold/10 border border-gold/30 rounded-md text-[11px] font-bold text-gold hover:bg-gold/20 transition-all disabled:opacity-50"
          >
            {isEnrichingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 shadow-[0_0_8px_#C9A84C]" />}
            {isEnrichingAll ? `Enriching (${enrichmentProgress}%)` : 'AI Enrich All'}
          </button>
          <button 
            onClick={onAddContact}
            className="flex items-center gap-2 px-4 py-1.5 bg-gold rounded-md text-[11px] font-bold text-navy hover:bg-gold-light transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Add Sovereign
          </button>
        </div>
      </div>

      {/* Advanced Filtering & Bulk Actions */}
      <div className="bg-navy-mid/60 border border-gold/18 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full flex items-center gap-3">
            <button
               onClick={handleSelectAll}
               className="flex items-center gap-2 px-3.5 py-2 bg-navy border border-white/10 rounded-lg text-[10px] font-bold text-slate hover:text-white transition-all hover:border-gold/50 cursor-pointer flex-shrink-0"
               title="Toggle Multi-Select Mode"
            >
               <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${selectedIds.length === contacts.length ? 'border-gold bg-gold text-navy' : 'border-white/20'}`}>
                  {selectedIds.length === contacts.length && <CheckCircle2 className="w-2.5 h-2.5" />}
               </div>
               <span className="uppercase tracking-widest">{selectedIds.length === contacts.length ? 'Deselect All' : 'Select All'} ({contacts.length})</span>
            </button>
            <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate" />
               <input 
                 className="w-full bg-navy border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-gold transition-all" 
                 placeholder="Query specialized contact pool..." 
               />
            </div>
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate uppercase tracking-widest hover:text-white transition-all">
               <Filter className="w-3.5 h-3.5" /> Filter Matrix
            </button>
            <div className="h-8 w-px bg-white/10 mx-1 hidden md:block" />
            <div className="flex -space-x-2">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-8 h-8 rounded-full border-2 border-navy-mid bg-gold/20 flex items-center justify-center text-[10px] font-bold text-gold">U{i}</div>
               ))}
               <div className="w-8 h-8 rounded-full border-2 border-navy-mid bg-navy-light flex items-center justify-center text-[8px] font-bold text-slate">+12</div>
            </div>
         </div>
      </div>

      {/* Contacts Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {contacts.map((contact) => (
           <ContactCard 
             key={contact.id} 
             contact={contact} 
             isSelected={selectedIds.includes(contact.id)}
             onToggleSelect={() => handleToggleSelectId(contact.id)}
             onViewDetails={handleViewDetails} 
             onEdit={() => onEditContact(contact)}
             onDelete={() => onDeleteContact(contact.id)}
             onInitiateCall={() => onInitiateCall(contact)}
           />
         ))}
      </div>

      {/* Dynamic Bulk Action Floating Dock */}
      <AnimatePresence>
         {selectedIds.length > 0 && (
           <motion.div 
             initial={{ y: 50, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: 50, opacity: 0 }}
             className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-navy/95 border-2 border-gold/30 rounded-2xl px-6 py-4 flex items-center gap-6 shadow-2xl backdrop-blur-xl"
           >
              {!confirmDelete ? (
                <>
                  <div className="flex flex-col">
                     <span className="text-[11px] font-bold text-gold uppercase tracking-widest">{selectedIds.length} Sovereign Clients Selected</span>
                     <span className="text-[9px] text-slate mt-0.5">Automated batch command interface active</span>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="flex items-center gap-3">
                     <button 
                       onClick={executeBulkArchive}
                       className="px-4 py-1.5 bg-gold/10 border border-gold/20 rounded-lg text-[10px] font-bold text-gold uppercase tracking-widest hover:bg-gold/25 transition-all"
                     >
                       Bulk Archive
                     </button>
                     <button 
                       onClick={() => setConfirmDelete(true)}
                       className="px-4 py-1.5 bg-red-600/20 border border-red-500/30 rounded-lg text-[10px] font-bold text-red-400 uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                     >
                       Bulk Delete
                     </button>
                     <button 
                       onClick={() => setSelectedIds([])}
                       className="text-[10px] font-bold text-slate hover:text-white uppercase tracking-widest"
                     >
                       Cancel
                     </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-6">
                   <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-red-400 uppercase tracking-widest">Confirm permanent deletion of {selectedIds.length} contact records?</span>
                      <span className="text-[9px] text-slate mt-0.5 font-bold">This operation is secure but completely irreversible</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <button 
                        onClick={executeBulkDelete}
                        className="px-4 py-1.5 bg-red-600 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest hover:bg-red-500 transition-all"
                      >
                        Yes, Delete
                      </button>
                      <button 
                        onClick={() => setConfirmDelete(false)}
                        className="px-4 py-1.5 bg-navy border border-white/10 rounded-lg text-[10px] font-bold text-slate hover:text-white transition-all"
                      >
                        Cancel
                      </button>
                   </div>
                </div>
              )}
           </motion.div>
         )}
      </AnimatePresence>

      {/* Bulk Archive Success Banner */}
      <AnimatePresence>
         {archivedCount !== null && (
           <motion.div 
             initial={{ x: 100, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             exit={{ x: 100, opacity: 0 }}
             className="fixed bottom-24 right-8 z-[200] px-4 py-3 bg-navy/90 border border-gold/30 rounded-lg shadow-2xl backdrop-blur-md flex items-center gap-3"
           >
             <CheckCircle2 className="w-4 h-4 text-gold" style={{ filter: 'drop-shadow(0 0 5x #C9A84C)' }} />
             <div className="flex flex-col">
               <span className="text-[8px] font-bold text-gold uppercase tracking-[0.2em] leading-none">Intelligence Archive</span>
               <span className="text-[10px] text-white/95 mt-1 font-semibold">
                 {archivedCount} contacts bulk-archived successfully.
               </span>
             </div>
           </motion.div>
         )}
      </AnimatePresence>

      <ContactDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        contact={selectedContact}
      />
    </div>
  );
}

function ContactCard({ contact, isSelected, onToggleSelect, onViewDetails, onEdit, onDelete, onInitiateCall }: { contact: Contact, isSelected: boolean, onToggleSelect: () => void, onViewDetails: (c: Contact) => void, onEdit: () => void, onDelete: () => void, onInitiateCall: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={`bg-navy-mid/60 border rounded-2xl overflow-hidden shadow-xl hover:border-gold/40 transition-all flex flex-col group relative ${isSelected ? 'border-gold shadow-[0_0_15px_rgba(201,168,76,0.15)] bg-gold/[0.02]' : 'border-gold/18'}`}
    >
       {/* Checkbox Trigger Top Left */}
       <div 
         onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
         className="absolute top-5 left-5 z-20 cursor-pointer"
         title="Select contact"
       >
          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'border-gold bg-gold text-navy' : 'border-white/20 bg-navy/80 hover:border-gold/50'}`}>
             {isSelected && <div className="w-2 h-2 bg-navy rounded-sm" />}
          </div>
       </div>

       <div className="p-6 pb-4 relative pl-12">
          <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button 
               onClick={(e) => { e.stopPropagation(); onEdit(); }}
               className="p-1.5 bg-navy/80 border border-gold/20 rounded hover:text-gold transition-colors"
               title="Edit Contact"
             >
                <Edit3 className="w-3.5 h-3.5" />
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); onDelete(); }}
               className="p-1.5 bg-navy/80 border border-red-400/20 rounded hover:text-red-400 transition-colors"
               title="Delete Contact"
             >
                <Trash2 className="w-3.5 h-3.5" />
             </button>
          </div>
          <div className="flex justify-between items-start mb-4">
             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center text-xl font-serif font-bold text-gold shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.1)_0%,transparent_70%)]" />
                {contact.name[0]}
             </div>
             <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gold/10 border border-gold/30 rounded text-[9px] font-bold text-gold uppercase tracking-widest">
                   <Star className="w-3 h-3 fill-gold" /> VIP
                </div>
                <div className="text-[10px] font-bold text-slate-light uppercase tracking-[0.1em]">{contact.score} SCORE</div>
             </div>
          </div>
          
          <h3 className="text-base font-bold text-white mb-1 group-hover:text-gold transition-colors">{contact.name}</h3>
          <div className="flex items-center gap-2 mb-4">
             <MapPin className="w-3 h-3 text-gold" />
             <span className="text-[10px] text-slate-light font-medium uppercase tracking-widest">{contact.location || 'NYC / Toronto Area'}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
             {contact.tags?.map(t => (
               <span key={t} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] font-bold text-slate-light uppercase tracking-widest group-hover:border-gold/20 transition-all">{t}</span>
             ))}
             {(!contact.tags || contact.tags.length === 0) && (
               <>
                 <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] font-bold text-slate-light uppercase tracking-widest">Investor</span>
                 <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] font-bold text-slate-light uppercase tracking-widest">High Net Worth</span>
               </>
             )}
          </div>
       </div>

       <div className="px-6 py-4 bg-navy/40 border-t border-white/5 space-y-3 mt-auto">
          <div className="flex items-center justify-between text-[10px] text-slate font-bold uppercase tracking-widest">
             <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Last Interaction</span>
             <span className="text-white">{contact.lastContact}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate font-bold uppercase tracking-widest">
             <span className="flex items-center gap-1.5"><RefreshCcw className="w-3 h-3" /> Pipeline Stage</span>
             <span className="text-gold">Nurturing Ops</span>
          </div>
       </div>

       <div className="p-4 bg-navy-mid border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <div className="flex items-center gap-2">
             <button className="p-2.5 bg-navy border border-white/10 rounded-xl hover:border-gold transition-colors">
                <Mail className="w-4 h-4 text-slate-light hover:text-gold" />
             </button>
             <button className="p-2.5 bg-navy border border-white/10 rounded-xl hover:border-gold transition-colors">
                <Phone className="w-4 h-4 text-slate-light hover:text-gold" />
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); onInitiateCall(); }}
               className="p-2.5 bg-navy border border-white/10 rounded-xl hover:border-gold transition-colors"
               title="Matrix Video Link"
             >
                <Video className="w-4 h-4 text-slate-light hover:text-gold" />
             </button>
          </div>
          <button 
            onClick={() => onViewDetails(contact)}
            className="flex items-center gap-1.5 text-[10px] font-bold text-gold uppercase tracking-widest hover:text-white transition-all"
          >
             View Intelligence <ChevronRight className="w-3.5 h-3.5" />
          </button>
       </div>
    </motion.div>
  );
}
