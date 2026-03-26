import { useState, useEffect } from 'react';
import { Key, Copy, Check, Eye, EyeOff, Terminal, Code, Info, ShieldCheck, Cpu, ArrowRight, Zap, Globe, Package, LayoutGrid, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OpenAPI() {
  const { token } = useAuth();
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTab, setActiveTab] = useState('curl');

  useEffect(() => {
    fetchCredentials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/api-credentials', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCredentials(data);
        if (data.agents?.length > 0) setSelectedAgentId(data.agents[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedKey(type);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const selectedAgent = credentials?.agents?.find(a => a.id === selectedAgentId);
  const clientSecret = credentials?.clientSecret || '•'.repeat(32);
  const agentKey = selectedAgent?.apiKey || 'YOUR_AGENT_KEY';
  const baseUrl = window.location.origin;

  const codeSnippets = {
    curl: `curl -X POST ${baseUrl}/api/public/chat \\
  -H "Content-Type: application/json" \\
  -H "x-client-secret: ${clientSecret}" \\
  -H "x-agent-key: ${agentKey}" \\
  -d '{"message": "Hello!"}'`,
    javascript: `const response = await fetch("${baseUrl}/api/public/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-client-secret": "${clientSecret}",
    "x-agent-key": "${agentKey}"
  },
  body: JSON.stringify({ message: "Hello!" })
});
const result = await response.json();`,
    node: `const axios = require('axios');

const sendMessage = async () => {
  const { data } = await axios.post('${baseUrl}/api/public/chat', {
    message: 'Hello AI Agent!'
  }, {
    headers: {
      'x-client-secret': '${clientSecret}',
      'x-agent-key': '${agentKey}'
    }
  });
  console.log(data.reply);
};`
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <span className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest animate-pulse">Initialising API Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-slate-200 overflow-hidden relative">
      <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none"></div>

      <header className="px-8 py-6 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between shrink-0 bg-[#09090b]/60 backdrop-blur-xl sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Open API</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">Production</span>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage global auth tokens & agent-specific routing keys.</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-end px-5 border-r border-white/10 hidden md:flex">
            <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Gateway</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"><Zap size={12} fill="currentColor" /> Operational</span>
          </div>
          <button onClick={fetchCredentials} className="p-2.5 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] text-slate-400 hover:text-white transition-all border border-[rgba(255,255,255,0.05)] hover:border-white/20 active:scale-95 shadow-lg">
             <LayoutGrid size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-10 space-y-8 max-w-[1400px] w-full mx-auto relative z-10">
        <section className="bg-[rgba(24,24,27,0.6)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 lg:p-8 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 shadow-[0_8px_30px_rgba(0,0,0,0.5)] group hover:border-[rgba(255,255,255,0.12)] transition-all duration-500">
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)] group-hover:scale-110 transition-transform duration-500">
                 <ShieldCheck size={28} />
              </div>
              <div>
                 <h3 className="font-bold text-slate-100 text-base">Account AuthToken <span className="text-slate-500 text-xs font-normal ml-2 tracking-wide">(Master Secret)</span></h3>
                 <p className="text-xs text-slate-400 font-medium mt-1">Include this strict credential in the <code className="bg-black/30 px-1.5 py-0.5 rounded text-emerald-400/80 mx-1 border border-white/5">x-client-secret</code> header.</p>
              </div>
           </div>

           <div className="flex flex-col md:flex-row items-center gap-3 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.06)] p-2 rounded-2xl w-full xl:max-w-xl shadow-inner">
              <div className="flex-1 px-4 py-2 font-mono text-xs md:text-sm text-emerald-400 tracking-wider w-full truncate select-all relative">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 animate-pulse pointer-events-none transition-opacity duration-700"></div>
                 {showSecret ? credentials?.clientSecret : '••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
              </div>
              <div className="flex items-center w-full md:w-auto mt-2 md:mt-0 gap-2">
                <button 
                  onClick={() => setShowSecret(!showSecret)}
                  className="flex-1 md:flex-none flex justify-center p-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-[rgba(255,255,255,0.1)] transition-all active:scale-95"
                  title="Toggle Visibility"
                >
                  {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button 
                  onClick={() => handleCopy(credentials?.clientSecret, 'secret')}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg ${
                    copiedSecret ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-[#18181b] hover:bg-[#27272a] text-slate-300 border border-[rgba(255,255,255,0.05)]'
                  }`}
                >
                  {copiedSecret ? <Check size={16} /> : <Copy size={16} />}
                  {copiedSecret ? 'Copied' : 'Copy'}
                </button>
              </div>
           </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           <div className="lg:col-span-4 xl:col-span-3 space-y-4">
              <div className="flex items-center gap-3 px-1">
                 <div className="w-1.5 h-4 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                 <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Routing Agents</span>
              </div>
              
              <div className="space-y-3">
                {credentials?.agents?.map(agent => {
                  const isSelected = selectedAgentId === agent.id;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group relative overflow-hidden ${
                        isSelected
                        ? 'bg-[rgba(16,185,129,0.08)] border border-emerald-500/30 ring-1 ring-emerald-500/20 shadow-[0_10px_30px_rgba(16,185,129,0.1)]' 
                        : 'bg-[rgba(24,24,27,0.4)] border border-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] hover:bg-[rgba(24,24,27,0.8)]'
                      }`}
                    >
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>}

                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 transition-all duration-300 ${
                        isSelected ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-black text-slate-500 group-hover:bg-[#18181b] group-hover:text-slate-300 border border-[rgba(255,255,255,0.05)]'
                      }`}>
                        {agent.name.charAt(0)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                         <h4 className={`text-sm font-bold truncate transition-colors ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{agent.name}</h4>
                         <span className="text-[10px] font-black opacity-60 uppercase tracking-wide text-emerald-500/70">{agent.role}</span>
                      </div>
                      <ArrowRight size={16} className={`transition-all duration-300 ${isSelected ? 'text-emerald-400 opacity-100 translate-x-0' : 'text-slate-600 opacity-0 -translate-x-2'}`} />
                    </button>
                  );
                })}
              </div>
           </div>

           <div className="lg:col-span-8 xl:col-span-9 space-y-6">
              {selectedAgent ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-[rgba(24,24,27,0.6)] backdrop-blur-2xl border border-[rgba(255,255,255,0.08)] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col">
                    <div className="p-8 pb-6 border-b border-[rgba(255,255,255,0.04)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
                       <div className="relative z-10">
                          <h3 className="text-2xl font-black text-white flex items-center gap-3">
                             <Cpu size={24} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> {selectedAgent.name}
                          </h3>
                          <p className="text-sm text-slate-400 font-medium mt-1">Include this routing identifier in the <code className="text-xs bg-black/40 px-1.5 py-0.5 rounded text-slate-300 border border-white/5">x-agent-key</code> header.</p>
                       </div>
                       <button 
                          onClick={() => handleCopy(selectedAgent.apiKey, 'agent')}
                          className={`relative z-10 flex items-center justify-center w-full md:w-auto gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-xl ${
                            copiedKey === 'agent' 
                            ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                            : 'bg-[#18181b] hover:bg-[#27272a] text-slate-200 border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)]'
                          }`}
                        >
                          {copiedKey === 'agent' ? <Check size={18} /> : <Copy size={18} />}
                          {copiedKey === 'agent' ? 'Identifier Copied!' : 'Copy Agent ID'}
                        </button>
                    </div>

                    <div className="px-8 py-5 bg-[rgba(0,0,0,0.3)] border-b border-[rgba(255,255,255,0.02)] relative group">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">Routing Key</span>
                           <div className="font-mono text-sm text-emerald-400 select-all truncate">
                              {selectedAgent.apiKey}
                           </div>
                       </div>
                    </div>

                    <div className="p-8 space-y-6 flex-1 bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.2)]">
                       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <h4 className="text-base font-bold text-white flex items-center gap-2">
                             <Terminal size={18} className="text-slate-400" /> Endpoint Integration
                          </h4>
                          
                          <div className="flex bg-[rgba(0,0,0,0.5)] p-1.5 rounded-xl border border-[rgba(255,255,255,0.05)] relative w-full md:w-auto shadow-inner">
                             {[
                               { id: 'curl', icon: <Package size={14} />, label: 'cURL' },
                               { id: 'javascript', icon: <Globe size={14} />, label: 'Fetch' },
                               { id: 'node', icon: <Code size={14} />, label: 'Node.js' }
                             ].map(tab => (
                               <button
                                 key={tab.id}
                                 onClick={() => setActiveTab(tab.id)}
                                 className={`relative z-10 flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                                   activeTab === tab.id 
                                   ? 'text-emerald-400 bg-[#18181b] shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.05)]' 
                                   : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                 }`}
                               >
                                 {tab.icon} {tab.label}
                               </button>
                             ))}
                          </div>
                       </div>

                       <div className="relative group rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)] shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
                          <div className="bg-[#18181b] px-4 py-3 flex items-center gap-2 border-b border-[rgba(255,255,255,0.05)]">
                             <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80 border border-green-500"></div>
                             </div>
                             <span className="ml-2 text-[10px] font-mono text-slate-500">post /api/public/chat</span>
                          </div>
                          <pre className="bg-[#0c0c0e] p-6 font-mono text-[13px] leading-relaxed text-slate-300 overflow-x-auto min-h-[180px] group-hover:bg-[#0a0a0c] transition-colors selection:bg-emerald-500/30">
                             <code className="block whitespace-pre">
                               {codeSnippets[activeTab]}
                             </code>
                          </pre>
                          <button 
                            onClick={() => handleCopy(codeSnippets[activeTab], 'snippet')}
                            className="absolute bottom-4 right-4 p-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all duration-300 shadow-2xl backdrop-blur-md active:scale-95 hover:bg-emerald-500 hover:border-emerald-400"
                            title="Copy snippet"
                          >
                            {copiedKey === 'snippet' ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                    <div className="p-6 rounded-3xl bg-[rgba(24,24,27,0.4)] border border-[rgba(255,255,255,0.05)] flex gap-5 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_10px_30px_rgba(59,130,246,0.1)] transition-all duration-300 group backdrop-blur-sm">
                       <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0 group-hover:scale-110 transition-transform">
                          <Info size={22} />
                       </div>
                       <div>
                          <h5 className="text-sm font-bold text-slate-200">Security Requirement</h5>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Both headers <code className="text-emerald-400/70">x-client-secret</code> and <code className="text-emerald-400/70">x-agent-key</code> are strictly required for validation.</p>
                       </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-[rgba(24,24,27,0.4)] border border-[rgba(255,255,255,0.05)] flex gap-5 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-[0_10px_30px_rgba(249,115,22,0.1)] transition-all duration-300 group backdrop-blur-sm">
                       <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20 shrink-0 group-hover:scale-110 transition-transform">
                          <ShieldCheck size={22} />
                       </div>
                       <div>
                          <h5 className="text-sm font-bold text-slate-200">Rate Limits Applied</h5>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Standard production accounts are limited to <strong className="text-slate-300">60 req/min</strong> based on active tier.</p>
                       </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed border-[rgba(255,255,255,0.05)] rounded-[2rem] bg-[rgba(24,24,27,0.3)] backdrop-blur-sm relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none"></div>
                   
                   <div className="w-24 h-24 relative mb-6">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-[30px] rounded-full group-hover:bg-emerald-500/40 transition-colors duration-700"></div>
                      <div className="w-full h-full bg-[rgba(24,24,27,0.8)] border border-[rgba(255,255,255,0.1)] rounded-[2rem] flex items-center justify-center text-slate-500 shadow-xl relative z-10 group-hover:scale-110 group-hover:text-emerald-400 transition-all duration-500">
                         <Cpu size={40} className="group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all duration-500" />
                      </div>
                   </div>
                   
                   <h3 className="text-xl font-black text-slate-300 relative z-10 tracking-tight">Select Routing Agent</h3>
                   <p className="text-sm text-slate-500 mt-2 max-w-[280px] text-center relative z-10 leading-relaxed font-medium">Click on an agent from the sidebar list to view its unique routing key and API integration guides.</p>
                </div>
              )}
           </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          border: 2px solid #09090b;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
