import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  Calendar,
  X,
  CheckCircle2,
} from 'lucide-react';
import { fetchContactRequests, updateContactRequestStatus } from '../../lib/adminData';
import { ContactRequest } from '../../types';

const ALLOWED_STATUSES = [
  { value: 'new', label: 'NEW', bg: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'read', label: 'READ', bg: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'responded', label: 'RESPONDED', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
];

export function AdminContactRequests() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadRequests = async () => {
    setIsLoading(true);
    const res = await fetchContactRequests();
    setRequests(res.requests);
    setIsLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusChange = async (reqId: string, newStatus: string) => {
    // Optimistic update
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: newStatus } : r))
    );
    if (selectedRequest && selectedRequest.id === reqId) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    const res = await updateContactRequestStatus(reqId, newStatus);
    if (!res.success) {
      setStatusMessage(`Status update error: ${res.error || 'Failed'}`);
    } else {
      setStatusMessage('Contact request status updated.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const term = searchTerm.toLowerCase();
    return (
      req.name.toLowerCase().includes(term) ||
      req.email.toLowerCase().includes(term) ||
      (req.company && req.company.toLowerCase().includes(term)) ||
      (req.message && req.message.toLowerCase().includes(term)) ||
      (req.phone && req.phone.toLowerCase().includes(term))
    );
  });

  const getBadgeStyle = (statusVal?: string) => {
    const match = ALLOWED_STATUSES.find((s) => s.value === (statusVal || 'new').toLowerCase());
    return match ? match.bg : 'bg-blue-100 text-blue-800 border-blue-300';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-700 rounded-xl border border-indigo-200">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0A292C]">Contact & Consultation Requests</h2>
            <p className="text-xs text-slate-500">Inbound general inquiries submitted via the website modal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contact requests..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F05323]"
            />
          </div>

          <button
            onClick={loadRequests}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Requests"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{statusMessage}</span>
          </span>
          <button onClick={() => setStatusMessage(null)} className="text-teal-600 hover:text-teal-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Contact Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Loading contact requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No contact requests yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No website contact forms submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Message Snippet</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredRequests.map((req, idx) => {
                  const currentStat = req.status || 'new';
                  return (
                    <tr
                      key={req.id ? `req-${req.id}` : `req-idx-${idx}`}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      <td
                        onClick={() => setSelectedRequest(req)}
                        className="py-3.5 px-4 font-bold text-[#0A292C] group-hover:text-[#F05323]"
                      >
                        {req.name}
                      </td>
                      <td onClick={() => setSelectedRequest(req)} className="py-3.5 px-4 font-mono text-slate-600">
                        {req.email}
                      </td>
                      <td onClick={() => setSelectedRequest(req)} className="py-3.5 px-4">
                        {req.company || '—'}
                      </td>
                      <td onClick={() => setSelectedRequest(req)} className="py-3.5 px-4 max-w-xs truncate text-slate-500">
                        {req.message || 'No message text provided.'}
                      </td>
                      <td onClick={() => setSelectedRequest(req)} className="py-3.5 px-4 text-slate-400 font-mono">
                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={currentStat}
                          onChange={(e) => handleStatusChange(req.id!, e.target.value)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border cursor-pointer focus:outline-none ${getBadgeStyle(
                            currentStat
                          )}`}
                        >
                          {ALLOWED_STATUSES.map((s) => (
                            <option key={s.value} value={s.value} className="bg-white text-slate-800">
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Read Message
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Message Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-6 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-700 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0A292C]">Contact Request Details</h3>
                  <span className="text-xs font-mono text-slate-400">
                    {selectedRequest.created_at
                      ? new Date(selectedRequest.created_at).toLocaleString()
                      : 'Recent'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Request Meta Info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Name</span>
                <span className="font-bold text-[#0A292C]">{selectedRequest.name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Email</span>
                <a
                  href={`mailto:${selectedRequest.email}`}
                  className="font-semibold text-[#F05323] hover:underline block truncate"
                >
                  {selectedRequest.email}
                </a>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Company</span>
                <span className="font-medium text-slate-800">{selectedRequest.company || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Phone</span>
                <span className="font-medium text-slate-800">{selectedRequest.phone || 'Not provided'}</span>
              </div>
            </div>

            {/* Status Control */}
            <div className="flex items-center justify-between bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
              <span className="text-xs font-bold text-indigo-950 font-mono uppercase">Request Status:</span>
              <select
                value={selectedRequest.status || 'new'}
                onChange={(e) => handleStatusChange(selectedRequest.id!, e.target.value)}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider border cursor-pointer ${getBadgeStyle(
                  selectedRequest.status
                )}`}
              >
                {ALLOWED_STATUSES.map((s) => (
                  <option key={s.value} value={s.value} className="bg-white text-slate-800">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Full Message Body */}
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono block mb-2">
                Message Content
              </span>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedRequest.message || 'No text message was provided.'}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-[#0A292C] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
