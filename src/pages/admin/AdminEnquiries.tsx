import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/dataService';
import { useToast } from '../../context/ToastContext';
import { ContactEnquiry } from '../../types';
import { initialEnquiries } from '../../data/initialData';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import { 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  CheckCircle2, 
  Search, 
  Download, 
  RefreshCw, 
  Trash2, 
  Eye, 
  X, 
  Send,
  AlertCircle,
  Inbox
} from 'lucide-react';

export const AdminEnquiries: React.FC = () => {
  const { showToast } = useToast();
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>(initialEnquiries);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactEnquiry | null>(null);
  
  // Resend state & Delete state
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactEnquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    const data = await dataService.getEnquiries();
    setEnquiries(data);
  };

  useEffect(() => {
    loadData();

    window.addEventListener('ravan_data_updated', loadData);
    return () => window.removeEventListener('ravan_data_updated', loadData);
  }, []);

  const handleStatusChange = async (id: string, status: ContactEnquiry['status']) => {
    await dataService.updateEnquiryStatus(id, status);
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry(prev => prev ? { ...prev, status } : null);
    }
    showToast(`Inquiry status updated to ${status.toUpperCase()}.`, 'success');
  };

  const handleResendEmail = async (id: string) => {
    setResendingId(id);
    try {
      const res = await dataService.resendInquiryEmail(id);
      if (res.success) {
        showToast('Confirmation email successfully resent to client.', 'success');
        setEnquiries(prev => prev.map(e => e.id === id ? { ...e, email_status: 'sent' } : e));
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry(prev => prev ? { ...prev, email_status: 'sent' } : null);
        }
      } else {
        showToast('Email delivery failed. Edge Function returned error.', 'error');
      }
    } catch {
      showToast('Failed to resend confirmation email.', 'error');
    } finally {
      setResendingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dataService.deleteEnquiry(deleteTarget.id);
      setEnquiries(prev => prev.filter(e => e.id !== deleteTarget.id));
      if (selectedEnquiry?.id === deleteTarget.id) {
        setSelectedEnquiry(null);
      }
      showToast(`Permanently deleted inquiry [${deleteTarget.reference_id || deleteTarget.id}] from Supabase.`, 'success');
      setDeleteTarget(null);
    } catch {
      showToast('Failed to delete inquiry.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = enquiries.filter(e => {
    const matchesFilter = filter === 'all' || e.status === filter;
    const matchesType = typeFilter === 'all' || e.inquiry_type === typeFilter;
    const query = search.toLowerCase();
    const matchesSearch = 
      (e.name || '').toLowerCase().includes(query) ||
      (e.email || '').toLowerCase().includes(query) ||
      (e.organization || e.company || '').toLowerCase().includes(query) ||
      (e.reference_id || '').toLowerCase().includes(query) ||
      (e.message || '').toLowerCase().includes(query);
    return matchesFilter && matchesType && matchesSearch;
  });

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(enquiries, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `ravan_enquiries_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchor.click();
    showToast('Exported inquiries database to JSON.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6 max-w-6xl pb-12">
        {/* Controls & Filter Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0a192f] border border-slate-800 rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search reference, name, email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs focus:border-secondary outline-none font-mono"
              />
            </div>

            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-semibold focus:border-secondary outline-none"
            >
              <option value="all">All Statuses ({enquiries.length})</option>
              <option value="new">New ({enquiries.filter(e => e.status === 'new').length})</option>
              <option value="read">Read</option>
              <option value="in_progress">In Progress</option>
              <option value="responded">Responded</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-white text-xs font-semibold focus:border-secondary outline-none"
            >
              <option value="all">All Scopes</option>
              <option value="Enterprise Engineering">Enterprise Engineering</option>
              <option value="Applied AI & ML">Applied AI & ML</option>
              <option value="Tech Park Lease">Tech Park Lease</option>
              <option value="Film Studio">Film Studio</option>
              <option value="Hackathon Partnership">Hackathon Partnership</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={exportJSON}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Inquiry List */}
        {filtered.length === 0 ? (
          <div className="p-16 rounded-2xl bg-[#0a192f] border border-slate-800 text-center">
            <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">No Inquiries Matching Filter</h3>
            <p className="text-xs text-slate-400">All customer directives will appear here dynamically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(enq => {
              const isNew = enq.status === 'new';
              const emailSent = enq.email_status === 'sent';
              const emailFailed = enq.email_status === 'failed';

              return (
                <div
                  key={enq.id}
                  className={`p-6 rounded-xl border transition-all ${
                    isNew
                      ? 'bg-[#0a192f] border-secondary/50 shadow-lg'
                      : 'bg-[#0a192f]/70 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="px-2.5 py-0.5 bg-slate-800 text-secondary font-mono text-[11px] font-bold rounded border border-slate-700">
                          {enq.reference_id || 'RT-2026-000100'}
                        </span>
                        <h3 className="text-base font-bold text-white">{enq.name}</h3>
                        <span className="px-2.5 py-0.5 bg-primary-fixed/20 text-secondary text-[10px] font-bold uppercase rounded border border-secondary/30">
                          {enq.inquiry_type}
                        </span>
                        {enq.budget_range && (
                          <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded">
                            {enq.budget_range}
                          </span>
                        )}

                        {/* Email Status Badge */}
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded flex items-center gap-1 ${
                          emailSent 
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' 
                            : emailFailed 
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-500/30' 
                            : 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${emailSent ? 'bg-emerald-400' : emailFailed ? 'bg-rose-400' : 'bg-amber-400'}`} />
                          <span>EMAIL: {enq.email_status || 'PENDING'}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          <span>{enq.organization || enq.company || 'Direct Entity'}</span>
                        </span>
                        <a href={`mailto:${enq.email}`} className="flex items-center gap-1 hover:text-white transition-colors">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{enq.email}</span>
                        </a>
                        {enq.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{enq.phone}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={enq.status}
                        onChange={e => handleStatusChange(enq.id, e.target.value as any)}
                        className="px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-xs font-bold text-white focus:border-secondary outline-none"
                      >
                        <option value="new">NEW</option>
                        <option value="read">READ</option>
                        <option value="in_progress">IN PROGRESS</option>
                        <option value="responded">RESPONDED</option>
                        <option value="closed">CLOSED</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => setSelectedEnquiry(enq)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="View Full Specifications"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleResendEmail(enq.id)}
                        disabled={resendingId === enq.id}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-secondary rounded text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                        title="Resend Confirmation Email"
                      >
                        <RefreshCw className={`w-3 h-3 ${resendingId === enq.id ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Resend Email</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(enq)}
                        className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 rounded hover:text-white transition-colors"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-[#07111e] rounded-lg border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line line-clamp-3">
                    {enq.message}
                  </div>

                  <div className="mt-3 text-[10px] font-mono text-slate-500 text-right">
                    Received: {new Date(enq.created_at).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed Inquiry Drawer Modal */}
      {selectedEnquiry && (
        <div 
          onClick={() => setSelectedEnquiry(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-body"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#0a192f] border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 text-slate-100 relative space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setSelectedEnquiry(null)}
              className="absolute top-6 right-6 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 bg-secondary text-[#0a192f] font-mono text-xs font-bold rounded">
                  {selectedEnquiry.reference_id || 'RT-2026-DIRECTIVE'}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(selectedEnquiry.created_at).toLocaleString()}
                </span>
              </div>
              <h2 className="text-2xl font-bold font-display text-white">
                {selectedEnquiry.name}
              </h2>
              <p className="text-xs text-secondary font-semibold uppercase tracking-wider mt-0.5">
                {selectedEnquiry.organization || selectedEnquiry.company || 'Private Entity'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#07111e] rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-0.5">Email</span>
                <a href={`mailto:${selectedEnquiry.email}`} className="text-white font-mono hover:text-secondary">
                  {selectedEnquiry.email}
                </a>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-0.5">Phone</span>
                <span className="text-white font-mono">{selectedEnquiry.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-0.5">Scope</span>
                <span className="text-white font-semibold">{selectedEnquiry.inquiry_type}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-0.5">Budget</span>
                <span className="text-emerald-400 font-bold">{selectedEnquiry.budget_range || 'Standard'}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 uppercase text-[10px] font-bold block mb-2">Full Specifications Narrative</span>
              <div className="p-4 bg-[#07111e] rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-line">
                {selectedEnquiry.message}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase">Status:</span>
                <select
                  value={selectedEnquiry.status}
                  onChange={e => handleStatusChange(selectedEnquiry.id, e.target.value as any)}
                  className="px-3 py-1.5 rounded bg-[#07111e] border border-slate-700 text-xs font-bold text-white"
                >
                  <option value="new">NEW</option>
                  <option value="read">READ</option>
                  <option value="in_progress">IN PROGRESS</option>
                  <option value="responded">RESPONDED</option>
                  <option value="closed">CLOSED</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleResendEmail(selectedEnquiry.id)}
                  disabled={resendingId === selectedEnquiry.id}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendingId === selectedEnquiry.id ? 'animate-spin' : ''}`} />
                  <span>Resend Email</span>
                </button>
                <a
                  href={`mailto:${selectedEnquiry.email}?subject=Re: Ravan Technologies Inquiry [${selectedEnquiry.reference_id}]`}
                  className="px-4 py-2 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteTarget !== null}
        itemTitle={`Inquiry [${deleteTarget?.reference_id || deleteTarget?.name}]`}
        itemType="Client Inquiry"
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
