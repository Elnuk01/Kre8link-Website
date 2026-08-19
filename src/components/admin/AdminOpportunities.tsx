import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Search,
  RefreshCw,
  Building2,
  Calendar,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { fetchAIOpportunities } from '../../lib/adminData';
import { AIOpportunity } from '../../types';

export function AdminOpportunities() {
  const [opportunities, setOpportunities] = useState<AIOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterImpact, setFilterImpact] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'PRIORITY'>('NEWEST');

  const loadOpps = async () => {
    setIsLoading(true);
    const res = await fetchAIOpportunities();
    setOpportunities(res.opportunities);
    setIsLoading(false);
  };

  useEffect(() => {
    loadOpps();
  }, []);

  // Filter & Sort Logic
  const filteredOpps = opportunities
    .filter((opp) => {
      // 1. Filter by impact tab
      if (filterImpact !== 'ALL') {
        const imp = String(opp.impact || '').toUpperCase();
        if (imp !== filterImpact) return false;
      }

      // 2. Search term
      const term = searchTerm.toLowerCase();
      const bus = opp.business_name || '';
      return (
        opp.title.toLowerCase().includes(term) ||
        opp.description.toLowerCase().includes(term) ||
        bus.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'PRIORITY') {
        const getPriorityNum = (p?: any) => {
          if (typeof p === 'number') return p;
          if (p === 'HIGH' || p === 'CRITICAL') return 1;
          if (p === 'MEDIUM') return 2;
          return 3;
        };
        return getPriorityNum(a.priority) - getPriorityNum(b.priority);
      } else {
        // NEWEST
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      }
    });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0A292C]">AI Opportunities Catalogue</h2>
            <p className="text-xs text-slate-500">
              Generated transformation initiatives categorized by impact and priority
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search opportunities..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F05323]"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="NEWEST">Newest First</option>
              <option value="PRIORITY">Highest Priority</option>
            </select>
          </div>

          <button
            onClick={loadOpps}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Opportunities"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterImpact(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              filterImpact === tab
                ? 'bg-[#0A292C] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {tab === 'ALL' ? 'ALL IMPACTS' : `${tab} IMPACT`}
          </button>
        ))}
        <span className="text-xs text-slate-400 font-mono ml-auto">
          Showing {filteredOpps.length} opportunities
        </span>
      </div>

      {/* Opportunities List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Loading AI opportunities...</p>
          </div>
        ) : filteredOpps.length === 0 ? (
          <div className="p-12 text-center">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No opportunities found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try selecting a different impact filter or adjusting your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Opportunity</th>
                  <th className="py-3.5 px-4">Business</th>
                  <th className="py-3.5 px-4">Impact</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredOpps.map((opp, idx) => (
                  <tr key={opp.id ? `opp-${opp.id}` : `opp-idx-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 max-w-md">
                      <span className="font-bold text-[#0A292C] text-sm block">
                        {opp.title}
                      </span>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {opp.description}
                      </p>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800">
                      {opp.business_name || '—'}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-md text-[10px] font-mono font-extrabold uppercase">
                        {opp.impact}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 bg-teal-100 text-teal-900 border border-teal-300 rounded-md text-[10px] font-mono font-extrabold uppercase">
                        {String(opp.priority || '1').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono">
                      {opp.created_at ? new Date(opp.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
