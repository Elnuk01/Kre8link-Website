import React, { useEffect, useState } from 'react';
import {
  Building2,
  FileSearch,
  Sparkles,
  Users,
  MessageSquare,
  ArrowUpRight,
  Clock,
  RefreshCw,
  AlertCircle,
  Activity,
  ChevronRight,
} from 'lucide-react';
import {
  fetchDashboardMetrics,
  DashboardMetrics,
  RecentActivityItem,
} from '../../lib/adminData';
import { supabase } from '../../lib/supabase';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = React.useRef(0);
  const latestProcessedRef = React.useRef(0);

  const loadData = async () => {
    const currentReqId = ++requestIdRef.current;

    setIsLoading(true);
    setError(null);

    if (!supabase) {
      setError('Database client is not initialized');
      setIsLoading(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (!session) {
      setError('Authentication session expired or missing. Please sign in to access admin data.');
      setIsLoading(false);
      return;
    }

    const dashRes = await fetchDashboardMetrics();

    if (currentReqId >= latestProcessedRef.current) {
      latestProcessedRef.current = currentReqId;

      if (dashRes.error) {
        setError(dashRes.error);
      } else {
        setMetrics(dashRes.metrics);
        setRecentActivity(dashRes.recentActivity);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();

    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          loadData();
        } else if (event === 'SIGNED_OUT') {
          setMetrics(null);
          setError('User logged out.');
        }
      });
      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const metricCards = [
    {
      title: 'TOTAL BUSINESSES',
      count: metrics?.totalBusinesses ?? 0,
      icon: Building2,
      path: '/admin/audits',
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    },
    {
      title: 'AI AUDITS',
      count: metrics?.totalAudits ?? 0,
      icon: FileSearch,
      path: '/admin/audits',
      color: 'bg-teal-500/10 text-teal-600 border-teal-200',
    },
    {
      title: 'AI OPPORTUNITIES',
      count: metrics?.totalOpportunities ?? 0,
      icon: Sparkles,
      path: '/admin/opportunities',
      color: 'bg-amber-500/10 text-amber-600 border-amber-200',
    },
    {
      title: 'LEADS',
      count: metrics?.totalLeads ?? 0,
      icon: Users,
      path: '/admin/leads',
      color: 'bg-[#F05323]/10 text-[#F05323] border-[#F05323]/30',
    },
    {
      title: 'CONTACT REQUESTS',
      count: metrics?.totalContactRequests ?? 0,
      icon: MessageSquare,
      path: '/admin/contact-requests',
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0A292C] text-white p-6 rounded-2xl shadow-xs border border-teal-900/50">
        <div>
          <span className="text-xs font-mono text-teal-300 tracking-wider uppercase font-semibold">
            Operational Dashboard
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
            System Performance & Inbound Overview
          </h2>
        </div>
        <button
          onClick={() => loadData()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-900/60 hover:bg-teal-800/80 border border-teal-700/50 text-xs font-semibold text-teal-200 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Real-time Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(card.path)}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {isLoading ? (
                <div className="h-9 w-16 bg-slate-200 animate-pulse rounded-md my-1" />
              ) : (
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-[#0A292C] tracking-tight">
                    {card.count}
                  </span>
                  <span className="text-xs font-medium text-slate-400 group-hover:text-[#F05323] transition-colors flex items-center gap-0.5">
                    View <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Content Split: Recent Activity Stream & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-[#F05323]" />
              <h3 className="text-base font-bold text-[#0A292C]">Recent System Activity</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Live Sync</span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="p-4 bg-slate-50 rounded-xl space-y-2 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No activity recorded yet</p>
              <p className="text-xs text-slate-400 mt-1">
                New scanner audits, leads, and contact requests will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item, idx) => (
                <div
                  key={item.id ? `recent-${item.id}` : `recent-idx-${idx}`}
                  onClick={() => {
                    if (item.type === 'lead') onNavigate('/admin/leads');
                    else if (item.type === 'audit') onNavigate('/admin/audits');
                    else onNavigate('/admin/contact-requests');
                  }}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        item.type === 'lead'
                          ? 'bg-[#F05323]/10 text-[#F05323]'
                          : item.type === 'audit'
                          ? 'bg-teal-500/10 text-teal-700'
                          : 'bg-indigo-500/10 text-indigo-700'
                      }`}
                    >
                      {item.type === 'lead' && <Users className="w-4 h-4" />}
                      {item.type === 'audit' && <FileSearch className="w-4 h-4" />}
                      {item.type === 'contact' && <MessageSquare className="w-4 h-4" />}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[#0A292C] group-hover:text-[#F05323] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-300" />
                      {item.timestamp}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#F05323] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Admin Actions & Database Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0A292C] uppercase tracking-wider">
              Quick Management Shortcuts
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('/admin/leads')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-[#F05323] hover:bg-orange-50/30 transition-all flex items-center justify-between group text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#F05323]" />
                  <span className="text-xs font-bold text-slate-800">Manage Inbound Leads</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#F05323]" />
              </button>

              <button
                onClick={() => onNavigate('/admin/audits')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition-all flex items-center justify-between group text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileSearch className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold text-slate-800">Review AI Audits</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
              </button>

              <button
                onClick={() => onNavigate('/admin/opportunities')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 transition-all flex items-center justify-between group text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-800">Opportunity Catalogue</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
              </button>

              <button
                onClick={() => onNavigate('/admin/contact-requests')}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all flex items-center justify-between group text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">Contact Requests</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </button>
            </div>
          </div>

          {/* RLS Policy Security Info */}
          <div className="bg-[#0A292C] text-white p-5 rounded-2xl border border-teal-900/50 space-y-2">
            <span className="text-[10px] font-mono text-teal-400 uppercase font-bold tracking-wider">
              Security Protocol
            </span>
            <h4 className="text-sm font-bold text-white">Row Level Security Active</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Public access is strictly restricted to insert-only. Full read and update permissions are enforced via Supabase Auth for your administrator session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

