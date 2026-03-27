import { useState, useEffect } from 'react';
import { Bot, Copy, Check, Palette, Type, Code2, Globe, Cpu, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AiAssistant() {
  const { token } = useAuth();
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [copiedScript, setCopiedScript] = useState(false);
  
  // Customization State
  const [widgetColor, setWidgetColor] = useState('#4F46E5');
  const [widgetTitle, setWidgetTitle] = useState('AI Assistant');

  useEffect(() => {
    fetchCredentials();
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

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const selectedAgent = credentials?.agents?.find(a => a.id === selectedAgentId);
  const clientSecret = credentials?.clientSecret || 'YOUR_CLIENT_SECRET';
  const agentKey = selectedAgent?.apiKey || 'YOUR_AGENT_KEY';
  const baseUrl = window.location.origin; // Vercel Live URL

  const generatedScript = `<!-- Start of AIAgent Widget -->
<script>
  window.AIAssistantConfig = {
    apiUrl: "${baseUrl}/api/public/chat",
    clientSecret: "${clientSecret}",
    agentKey: "${agentKey}",
    color: "${widgetColor}",
    title: "${widgetTitle}"
  };
</script>
<script src="${baseUrl}/widget.js?v=1"></script>
<!-- End of AIAgent Widget -->`;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#09090b]">
         <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
           <span className="text-xs font-bold text-blue-500/80 uppercase tracking-widest animate-pulse">Loading Widget Builder...</span>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-slate-200 overflow-hidden relative">
      <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <header className="px-8 py-6 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between shrink-0 bg-[#09090b]/60 backdrop-blur-xl relative z-20">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Website UI Widget</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-500/20">Generator</span>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">Embed your AI Agent directly into your Website, Shopify, or external apps.</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-10 space-y-8 max-w-[1400px] w-full mx-auto relative z-10">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
           {/* Left Sidebar - Agent Selection */}
           <div className="lg:col-span-4 xl:col-span-3 space-y-4">
              <div className="flex items-center gap-3 px-1">
                 <div className="w-1.5 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                 <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Select Agent</span>
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
                        ? 'bg-[rgba(59,130,246,0.08)] border border-blue-500/30 shadow-[0_10px_30px_rgba(59,130,246,0.1)]' 
                        : 'bg-[rgba(24,24,27,0.4)] border border-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] hover:bg-[rgba(24,24,27,0.8)]'
                      }`}
                    >
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.8)]"></div>}

                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all duration-300 ${
                        isSelected ? 'bg-blue-500 text-white' : 'bg-black text-slate-500 group-hover:bg-[#18181b]'
                      }`}>
                        <Cpu size={18} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                         <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{agent.name}</h4>
                      </div>
                      <ArrowRight size={16} className={`transition-all duration-300 ${isSelected ? 'text-blue-400 opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                    </button>
                  );
                })}
              </div>
           </div>

           {/* Right Side - Customization & Code */}
           <div className="lg:col-span-8 xl:col-span-9 space-y-6">
              {selectedAgent ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                  
                  {/* Customization Panel */}
                  <div className="bg-[rgba(24,24,27,0.6)] backdrop-blur-2xl border border-[rgba(255,255,255,0.08)] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8">
                     <h3 className="text-xl font-black text-white flex items-center gap-3 mb-6">
                        <Palette size={22} className="text-blue-400" /> Style Customization
                     </h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Title Input */}
                        <div className="space-y-3">
                           <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                              <Type size={14} /> Widget Header Title
                           </label>
                           <input 
                              type="text" 
                              value={widgetTitle}
                              onChange={(e) => setWidgetTitle(e.target.value)}
                              className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium placeholder-slate-600"
                              placeholder="e.g. Chat with Sales"
                           />
                        </div>

                        {/* Color Input */}
                        <div className="space-y-3">
                           <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                              <Palette size={14} /> Primary Brand Color
                           </label>
                           <div className="flex gap-4 items-center">
                              <input 
                                 type="color" 
                                 value={widgetColor}
                                 onChange={(e) => setWidgetColor(e.target.value)}
                                 className="w-12 h-12 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] cursor-pointer focus:outline-none"
                              />
                              <input 
                                 type="text" 
                                 value={widgetColor}
                                 onChange={(e) => setWidgetColor(e.target.value)}
                                 className="flex-1 bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-blue-500 transition-all"
                              />
                           </div>
                           <div className="flex gap-2 mt-3">
                              {['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'].map(color => (
                                 <button
                                    key={color}
                                    onClick={() => setWidgetColor(color)}
                                    className="w-6 h-6 rounded-full border-2 border-transparent hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color, borderColor: widgetColor === color ? 'white' : 'transparent' }}
                                 />
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Generated Code Snippet */}
                  <div className="bg-[rgba(24,24,27,0.6)] backdrop-blur-2xl border border-[rgba(255,255,255,0.08)] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                     <div className="p-6 border-b border-[rgba(255,255,255,0.04)] flex items-center justify-between">
                        <h3 className="text-lg font-black text-white flex items-center gap-3">
                           <Code2 size={20} className="text-blue-400" /> Embed Script
                        </h3>
                        <button 
                           onClick={() => handleCopy(generatedScript)}
                           className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg ${
                             copiedScript ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-blue-600 hover:bg-blue-500 text-white'
                           }`}
                        >
                           {copiedScript ? <Check size={16} /> : <Copy size={16} />}
                           {copiedScript ? 'Copied to Clipboard' : 'Copy Script'}
                        </button>
                     </div>
                     <div className="bg-[#0c0c0e] p-6 relative group">
                        <pre className="font-mono text-[13px] leading-loose text-slate-300 overflow-x-auto whitespace-pre-wrap">
                           <code>
                              <span className="text-slate-500">&lt;!-- Paste this anywhere inside the &lt;body&gt; tags of your website --&gt;</span>{'\n'}
                              {generatedScript}
                           </code>
                        </pre>
                     </div>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-[rgba(255,255,255,0.05)] rounded-[2rem] bg-[rgba(24,24,27,0.3)]">
                   <Bot size={48} className="text-slate-600 mb-4" />
                   <h3 className="text-xl font-black text-slate-300">Select an Agent</h3>
                   <p className="text-sm text-slate-500 mt-2">Pick an agent from the sidebar to generate its unique embed code.</p>
                </div>
              )}
           </div>
        </section>
      </div>

    </div>
  );
}
