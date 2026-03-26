import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, BookOpen, Bot, Loader2, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Home() {
  const { token, client } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState({ totalAgents: 0, totalKnowledge: 0 });
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statRes, agentRes] = await Promise.all([
          fetch('/api/admin/analytics', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/admin/agents', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (statRes.ok) {
          const s = await statRes.json();
          setAnalytics({ totalAgents: s.totalAgents, totalKnowledge: s.totalKnowledge });
        }
        
        if (agentRes.ok) {
          const a = await agentRes.json();
          setAgents(a.agents);
        }
      } catch (e) {
        console.error("Dashboard Error:", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [token]);

  return (
    <div className="p-10 max-w-[1200px] w-full mx-auto max-md:p-5 h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-10">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-slate-50">Welcome, {client?.businessName || 'User'}! 👋</h2>
          <p className="text-slate-400 text-sm">Here is an overview of your AI ecosystem.</p>
        </div>
        <button 
          onClick={() => navigate('/setup')} 
          className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 shadow-lg hover:-translate-y-1 transition-all"
        >
          <Bot size={18} /> Add New Bot
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#10b981]" size={32} /></div>
      ) : (
        <div className="flex flex-col gap-10">
          
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[rgba(24,24,27,0.6)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 flex flex-col justify-between shadow-lg">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-4"><Users size={24} /></div>
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Total Active Agents</p>
                <h3 className="text-4xl font-bold text-white">{analytics.totalAgents}</h3>
              </div>
            </div>

            <div className="bg-[rgba(24,24,27,0.6)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 flex flex-col justify-between shadow-lg">
              <div className="w-12 h-12 bg-[#10b981]/20 text-[#10b981] rounded-2xl flex items-center justify-center mb-4"><BookOpen size={24} /></div>
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Total Knowledge Sources</p>
                <h3 className="text-4xl font-bold text-white">{analytics.totalKnowledge}</h3>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#10b981]/20 to-blue-500/10 backdrop-blur-xl border border-[rgba(255,255,255,0.05)] rounded-3xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/30 blur-[50px] rounded-full translate-x-10 -translate-y-10"></div>
              <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-4 z-10"><Bot size={24} /></div>
              <div className="z-10">
                <p className="text-slate-200 text-sm font-medium mb-1 line-clamp-2">Test your bots instantly in the sandbox terminal.</p>
                <button onClick={() => navigate('/tester')} className="mt-2 text-sm text-[#10b981] font-bold flex items-center gap-1 hover:text-white transition-colors">
                  Go to AI Tester <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Agents List */}
          <div>
            <h3 className="text-xl font-bold text-slate-100 mb-6">Your Intelligent Agents</h3>
            
            {agents.length === 0 ? (
              <div className="text-center bg-[rgba(24,24,27,0.6)] border border-[rgba(255,255,255,0.08)] rounded-3xl py-12 px-5">
                <div className="w-16 h-16 bg-slate-800 text-slate-500 rounded-full mx-auto flex items-center justify-center mb-4"><Bot size={32} /></div>
                <h4 className="text-lg font-bold text-white mb-2">No agents deployed yet</h4>
                <p className="text-slate-400 text-sm max-w-[300px] mx-auto mb-6">Create your first AI assistant and start training it with your business knowledge.</p>
                <button onClick={() => navigate('/setup')} className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-200 transition-colors">Start Building</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {agents.map(agent => (
                  <div key={agent.id} className="bg-[rgba(24,24,27,0.6)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center font-bold text-xl uppercase shadow-inner">
                          {agent.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-[15px]">{agent.name}</h4>
                          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md mt-1 inline-block">{agent.role}</span>
                        </div>
                      </div>
                      <Link to={`/knowledge/${agent.id}`} className="p-2 w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-[#10b981] text-slate-400 hover:text-white rounded-lg transition-colors" title="Manage Knowledge DB">
                        <BookOpen size={16} />
                      </Link>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 h-[40px] mb-5">{agent.systemPrompt}</p>
                    
                    <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.05)] pt-4 mt-2">
                       <span className="text-xs text-slate-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Active</span>
                       <Link to={`/tester?agent=${agent.id}`} className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                          Test Agent <ExternalLink size={12} />
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
