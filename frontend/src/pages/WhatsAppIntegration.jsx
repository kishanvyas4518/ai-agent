import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Zap, Copy, Check, Eye, EyeOff, Save,
  ChevronRight, Loader2, AlertCircle, CheckCircle2, Link2,
  ShieldCheck, Webhook, Bot, Sparkles, Globe, Key, RefreshCw, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function WhatsAppIntegration() {
  const { token } = useAuth();
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingCreds, setLoadingCreds] = useState(false);

  const [authToken, setAuthToken] = useState('');
  const [originWebsite, setOriginWebsite] = useState('');
  const [showAuthToken, setShowAuthToken] = useState(false);

  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const backendUrl = window.location.origin;
  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  const webhookUrl = selectedAgent
    ? `${backendUrl}/webhook/11za/${selectedAgent.id}`
    : '';

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/agents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAgents(data.agents || []);
        if (data.agents?.length > 0 && !selectedAgentId) {
          setSelectedAgentId(data.agents[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, selectedAgentId]);

  const fetchCredentials = useCallback(async (agentId) => {
    if (!agentId) return;
    try {
      setLoadingCreds(true);
      setAuthToken('');
      setOriginWebsite('');
      const res = await fetch(`/api/admin/agents/${agentId}/11za-credentials`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.agent) {
        setAuthToken(data.agent.za11AuthToken || '');
        setOriginWebsite(data.agent.za11OriginWebsite || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCreds(false);
    }
  }, [token]);

  useEffect(() => { fetchAgents(); }, [token]);
  useEffect(() => { if (selectedAgentId) fetchCredentials(selectedAgentId); }, [selectedAgentId]);

  const handleSelectAgent = (id) => {
    setSelectedAgentId(id);
  };

  const handleSave = async () => {
    if (!selectedAgentId) return;
    if (!authToken.trim() || !originWebsite.trim()) {
      showToast('error', 'Auth Token aur Origin Website required hain');
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/agents/${selectedAgentId}/11za-credentials`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ za11AuthToken: authToken, za11OriginWebsite: originWebsite })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', '11za credentials saved! Webhook ab ready hai.');
      } else {
        showToast('error', data.error || 'Save failed');
      }
    } catch (e) {
      showToast('error', 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyWebhook = () => {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const isConfigured = authToken && originWebsite;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#25D366] animate-spin" />
          <span className="text-xs font-bold text-[#25D366]/80 uppercase tracking-widest animate-pulse">
            Loading WhatsApp Integration...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-slate-200 overflow-hidden relative">
      {/* Background glows */}
      <div className="absolute top-10 left-20 w-[500px] h-[500px] bg-[#25D366]/4 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-20 w-[400px] h-[400px] bg-emerald-600/4 blur-[130px] rounded-full pointer-events-none" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-xl text-sm font-semibold transition-all animate-in slide-in-from-top-2 duration-300 ${
          toast.type === 'success'
            ? 'bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366]'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="px-8 py-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#09090b]/70 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#25D366]/20 to-emerald-600/10 border border-[#25D366]/20 flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.15)]">
            <MessageSquare size={22} className="text-[#25D366]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#25D366] to-emerald-400">
                WhatsApp Integration
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#25D366]/10 text-[#25D366] text-[10px] font-black uppercase tracking-wider border border-[#25D366]/20">
                11za Powered
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Agent-wise webhooks for incoming WhatsApp messages
            </p>
          </div>
        </div>
        <button
          onClick={fetchAgents}
          className="p-2.5 rounded-xl bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/15 text-slate-400 hover:text-white transition-all active:scale-95"
        >
          <RefreshCw size={18} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 md:px-8 py-8 max-w-[1400px] mx-auto space-y-8">

          {/* How It Works Banner */}
          <div className="bg-[rgba(37,211,102,0.04)] border border-[#25D366]/15 rounded-3xl p-6 flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(37,211,102,0.1)]">
              <Info size={22} className="text-[#25D366]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-100 text-sm mb-2">Kaise kaam karta hai?</h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                {[
                  { icon: MessageSquare, label: 'User WhatsApp pe message karta hai' },
                  { icon: Webhook, label: '11za webhook trigger hota hai' },
                  { icon: Bot, label: 'Agent AI reply generate karta hai' },
                  { icon: Zap, label: '"11za API se reply bheji jati hai' },
                ].map((step, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {i > 0 && <ChevronRight size={14} className="text-slate-600" />}
                    <span className="flex items-center gap-1.5 bg-white/3 px-3 py-1.5 rounded-lg border border-white/5">
                      <step.icon size={13} className="text-[#25D366]" />
                      {step.label}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Main Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Agent selector */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-4">
              <div className="flex items-center gap-2 px-1 mb-3">
                <div className="w-1.5 h-4 bg-[#25D366] rounded-full shadow-[0_0_8px_rgba(37,211,102,0.5)]" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Select Agent</span>
              </div>

              {agents.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-3xl bg-white/2">
                  <Bot size={36} className="mx-auto mb-3 text-slate-600" />
                  <p className="text-sm text-slate-500 font-medium">No agents found</p>
                  <p className="text-xs text-slate-600 mt-1">Pehle Create Agent se agent banao</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {agents.map(agent => {
                    const isSelected = selectedAgentId === agent.id;
                    return (
                      <button
                        key={agent.id}
                        onClick={() => handleSelectAgent(agent.id)}
                        className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-3.5 group relative overflow-hidden ${
                          isSelected
                            ? 'bg-[rgba(37,211,102,0.07)] border border-[#25D366]/30 ring-1 ring-[#25D366]/15 shadow-[0_8px_25px_rgba(37,211,102,0.08)]'
                            : 'bg-white/2 border border-white/4 hover:border-white/10 hover:bg-white/4'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#25D366] shadow-[0_0_10px_rgba(37,211,102,0.7)]" />
                        )}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shrink-0 transition-all ${
                          isSelected ? 'bg-[#25D366] text-white shadow-[0_0_15px_rgba(37,211,102,0.4)]' : 'bg-black/40 text-slate-500 border border-white/5 group-hover:text-slate-300'
                        }`}>
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden min-w-0">
                          <h4 className={`text-sm font-bold truncate transition-colors ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                            {agent.name}
                          </h4>
                          <span className="text-[10px] font-bold uppercase tracking-wide text-[#25D366]/60">{agent.role}</span>
                        </div>
                        <ChevronRight size={15} className={`shrink-0 transition-all ${isSelected ? 'text-[#25D366] opacity-100' : 'text-slate-600 opacity-0 group-hover:opacity-50'}`} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Config Panel */}
            <div className="lg:col-span-8 xl:col-span-9">
              {selectedAgent ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
                  
                  {/* Webhook URL Card */}
                  <div className="bg-[rgba(24,24,27,0.7)] backdrop-blur-2xl border border-white/8 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="px-8 py-6 border-b border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center">
                        <Webhook size={20} className="text-[#25D366]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">Webhook URL</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Is URL ko 11za dashboard ke Webhook section mein paste karo</p>
                      </div>
                      <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20">
                        <div className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-[#25D366] shadow-[0_0_6px_rgba(37,211,102,0.8)]' : 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.8)]'} animate-pulse`} />
                        <span className={`text-[10px] font-black uppercase tracking-wide ${isConfigured ? 'text-[#25D366]' : 'text-yellow-500'}`}>
                          {isConfigured ? 'Ready' : 'Setup Required'}
                        </span>
                      </div>
                    </div>

                    <div className="px-8 py-6">
                      <div className="flex items-center gap-3 bg-black/40 border border-white/6 rounded-2xl p-2 pl-5 group hover:border-[#25D366]/20 transition-colors">
                        <Link2 size={15} className="text-[#25D366]/70 shrink-0" />
                        <span className="flex-1 font-mono text-sm text-[#25D366] truncate select-all leading-relaxed">
                          {webhookUrl}
                        </span>
                        <button
                          onClick={handleCopyWebhook}
                          className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg ${
                            copiedWebhook
                              ? 'bg-[#25D366] text-white shadow-[0_0_15px_rgba(37,211,102,0.4)]'
                              : 'bg-[#1a1a1f] hover:bg-[#27272a] text-slate-300 border border-white/6'
                          }`}
                        >
                          {copiedWebhook ? <Check size={15} /> : <Copy size={15} />}
                          {copiedWebhook ? 'Copied!' : 'Copy URL'}
                        </button>
                      </div>

                      {/* Setup instruction */}
                      <div className="mt-4 flex items-start gap-3 p-4 bg-yellow-500/5 border border-yellow-500/15 rounded-2xl">
                        <Sparkles size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-400/80 leading-relaxed">
                          <span className="font-bold text-yellow-400">11za Setup:</span> Apne 11za dashboard → Settings → Webhook URL field mein yeh URL paste karo.
                          Jab bhi koi message aayega, 11za automatically is URL ko call karega.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Credentials Card */}
                  <div className="bg-[rgba(24,24,27,0.7)] backdrop-blur-2xl border border-white/8 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="px-8 py-6 border-b border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                        <ShieldCheck size={20} className="text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">11za Credentials</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Ye details 11za account se milenge • Agent: <span className="text-[#25D366] font-bold">{selectedAgent.name}</span></p>
                      </div>
                    </div>

                    <div className="px-8 py-8 space-y-6">
                      {loadingCreds ? (
                        <div className="flex items-center justify-center py-8 gap-3">
                          <Loader2 size={20} className="text-[#25D366] animate-spin" />
                          <span className="text-sm text-slate-500">Loading credentials...</span>
                        </div>
                      ) : (
                        <>
                          {/* Auth Token field */}
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                              <Key size={13} className="text-[#25D366]" />
                              11za Auth Token
                            </label>
                            <div className="flex items-center gap-2 bg-black/30 border border-white/6 rounded-2xl p-2 pl-4 focus-within:border-[#25D366]/30 focus-within:shadow-[0_0_0_2px_rgba(37,211,102,0.08)] transition-all">
                              <input
                                type={showAuthToken ? 'text' : 'password'}
                                value={authToken}
                                onChange={e => setAuthToken(e.target.value)}
                                placeholder="Apna 11za authToken yahan daalo..."
                                className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none font-mono"
                              />
                              <button
                                onClick={() => setShowAuthToken(!showAuthToken)}
                                className="p-2.5 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/8 transition-all"
                              >
                                {showAuthToken ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>

                          {/* Origin Website field */}
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                              <Globe size={13} className="text-[#25D366]" />
                              Origin Website
                            </label>
                            <div className="flex items-center gap-2 bg-black/30 border border-white/6 rounded-2xl p-2 pl-4 focus-within:border-[#25D366]/30 focus-within:shadow-[0_0_0_2px_rgba(37,211,102,0.08)] transition-all">
                              <input
                                type="text"
                                value={originWebsite}
                                onChange={e => setOriginWebsite(e.target.value)}
                                placeholder="e.g. yourbusiness.com ya 11za business ID..."
                                className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
                              />
                            </div>
                          </div>

                          {/* Save button */}
                          <div className="pt-2 flex items-center gap-4">
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              className={`flex items-center gap-2.5 px-8 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95 shadow-lg ${
                                saving
                                  ? 'bg-[#25D366]/50 text-white/60 cursor-not-allowed'
                                  : 'bg-[#25D366] hover:bg-[#1db954] text-white shadow-[0_4px_20px_rgba(37,211,102,0.35)] hover:shadow-[0_4px_25px_rgba(37,211,102,0.5)]'
                              }`}
                            >
                              {saving ? (
                                <><Loader2 size={16} className="animate-spin" /> Saving...</>
                              ) : (
                                <><Save size={16} /> Save Credentials</>
                              )}
                            </button>
                            {isConfigured && (
                              <div className="flex items-center gap-2 text-xs text-[#25D366] font-semibold">
                                <CheckCircle2 size={16} />
                                Configured & Active
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Incoming Payload Preview */}
                  <div className="bg-[rgba(24,24,27,0.6)] backdrop-blur-xl border border-white/6 rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
                    <div className="px-8 py-6 border-b border-white/5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Webhook size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">11za Webhook Payload Format</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Jab 11za webhook bhejega tab kuch aisa payload milega</p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="bg-[#0d0d10] px-4 py-3 flex items-center gap-2 border-b border-white/4">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-500" />
                          <div className="w-3 h-3 rounded-full bg-green-500/80 border border-green-500" />
                        </div>
                        <span className="ml-2 text-[10px] font-mono text-slate-500">POST /webhook/11za/{selectedAgent?.id?.substring(0, 8)}...</span>
                      </div>
                      <pre className="bg-[#09090b] p-6 font-mono text-[12px] leading-6 text-slate-400 overflow-x-auto selection:bg-[#25D366]/25">
                        <code>{`{
  "messageId": "wamid.HBgMOTE3MDk2...",
  "channel": "whatsapp",
  "from": "<span style="color:#25D366">917096423003</span>",       // ← Sender ka number
  "to": "917016875366",
  "content": {
    "contentType": "text",
    "text": "<span style="color:#25D366">User ka message yahan aayega</span>"  // ← Yeh AI ko jayega
  },
  "whatsapp": {
    "senderName": "Kishan Vyas"
  },
  "event": "MoMessage",
  "isin24window": true
}`}</code>
                      </pre>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed border-white/5 rounded-[2rem] bg-white/1 backdrop-blur-sm group">
                  <div className="w-20 h-20 relative mb-6">
                    <div className="absolute inset-0 bg-[#25D366]/15 blur-[30px] rounded-full group-hover:bg-[#25D366]/30 transition-colors duration-700" />
                    <div className="w-full h-full bg-[rgba(24,24,27,0.8)] border border-white/8 rounded-[2rem] flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-500">
                      <MessageSquare size={36} className="text-slate-500 group-hover:text-[#25D366] transition-colors duration-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-slate-300">Agent Select Karo</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-[260px] text-center leading-relaxed">
                    Left side se koi bhi agent select karo aur WhatsApp integration configure karo
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        @keyframes slide-in-from-bottom-3 {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }  
        }
        .animate-in { animation-fill-mode: both; }
        .fade-in { animation-name: fade-in; }
        .slide-in-from-bottom-3 { animation-name: slide-in-from-bottom-3; }
        .duration-400 { animation-duration: 400ms; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-top-2 {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide-in-from-top-2 { animation-name: slide-in-from-top-2; }
        .duration-300 { animation-duration: 300ms; }
      `}} />
    </div>
  );
}
