import { useState } from 'react';
import { Bot, Save, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AGENT_ROLES = [
  { id: 'Customer Support', icon: '💬', label: 'Customer Support', desc: 'General queries & guidance', prompt: "You are a helpful customer support agent. Answer user queries politely, resolve issues efficiently, and always provide clear guidance based on the company's policies strictly using the provided knowledge base." },
  { id: 'Recruitment', icon: '💼', label: 'Recruitment', desc: 'Hiring & candidate screening', prompt: "You are an AI recruitment assistant. Help candidates find relevant job openings, answer questions about the interview process and company culture, and guide them through submitting their applications." },
  { id: 'Feedback', icon: '⭐', label: 'Feedback', desc: 'Surveys & experience collection', prompt: "You are a customer feedback and survey bot. Politely ask users about their experience, gather constructive feedback, address initial complaints gracefully, and thank them for their valuable time." },
  { id: 'Appointment', icon: '🕒', label: 'Appointment', desc: 'Scheduling & bookings', prompt: "You are an appointment scheduling assistant. Help users book, reschedule, or cancel appointments smoothly while checking availability guidelines and confirming their details." },
  { id: 'Customer Service', icon: '👨‍💼', label: 'Customer Service', desc: 'Orders, refunds & tracking', prompt: "You are a dedicated customer service representative. Focus on troubleshooting technical issues, tracking active orders, explaining refund policies, and ensuring high customer satisfaction." },
  { id: 'E-commerce', icon: '🛍️', label: 'E-commerce', desc: 'Shopping & product discovery', prompt: "You are an e-commerce shopping assistant. Guide users through browsing products, placing orders, tracking shipments, handling returns, and recommending relevant deals or product bundles to enhance their shopping experience." }
];

export default function BotSetup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [role, setRole] = useState(AGENT_ROLES[5]);
  const [prompt, setPrompt] = useState(AGENT_ROLES[5].prompt);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setPrompt(selectedRole.prompt);
  };

  const handleSave = async () => {
    if (!name.trim()) return setStatus({ type: 'error', msg: 'Please provide an Agent Name' });
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, role: role.id, systemPrompt: prompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create agent');
      setStatus({ type: 'success', msg: 'Agent Created! Preparing Knowledge Base...' });
      
      setTimeout(() => navigate(`/knowledge/${data.agent.id}`), 1500);

    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-[1200px] w-full mx-auto max-md:p-5 flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-slate-50">Create New AI Agent</h2>
        <p className="text-slate-400 text-sm">Design a specialized bot with a custom name and focus.</p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-6">
          
          <div>
             <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">1. Agent Identity</h3>
             <input
               className="w-full bg-[rgba(24,24,27,0.6)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] text-slate-50 p-4 rounded-xl text-[15px] focus:outline-none focus:border-[#10b981] shadow-inner"
               placeholder="e.g. Sales Assistant, HR Bot, Support Team"
               value={name}
               onChange={e => setName(e.target.value)}
             />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">2. Choose AI Focus</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AGENT_ROLES.map((r) => (
                <button 
                  key={r.id}
                  onClick={() => handleRoleSelect(r)}
                  className={`flex flex-col items-start gap-2 p-4 rounded-2xl text-left border transition-all duration-200 ${
                    role.id === r.id 
                      ? 'bg-[rgba(16,185,129,0.1)] border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.15)] transform scale-[1.02]' 
                      : 'bg-[rgba(24,24,27,0.6)] border-[rgba(255,255,255,0.08)] text-slate-300 hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)]'
                  }`}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <div>
                    <span className={`block font-bold text-sm ${role.id === r.id ? 'text-[#10b981]' : 'text-slate-200'}`}>{r.label}</span>
                    <span className="block text-xs text-slate-500 mt-1">{r.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2">
            <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">3. Refine Instructions</h3>
            <textarea
              className="w-full h-40 bg-[rgba(24,24,27,0.6)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] text-slate-50 p-5 rounded-2xl text-[15px] leading-relaxed transition-all focus:outline-none focus:border-[#10b981] resize-y shadow-inner"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="bg-[#10b981] hover:bg-[#059669] text-white px-8 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Deploy & Train Knowledge</span>}
              {!loading && <ArrowRight size={18} />}
            </button>
            {status && (
              <div className={`flex items-center gap-2 text-sm font-medium ${status.type === 'success' ? 'text-[#10b981]' : 'text-red-500'}`}>
                {status.type === 'success' && <CheckCircle2 size={18} />}
                <span>{status.msg}</span>
              </div>
            )}
          </div>
        </div>

        <div className="w-[300px] hidden lg:flex items-center justify-center p-6 relative shrink-0">
          <div className="absolute inset-0 bg-[#10b981]/10 blur-[100px] rounded-full"></div>
          <div className="w-full h-[580px] bg-slate-50 rounded-[40px] border-[8px] border-slate-200 shadow-2xl relative overflow-hidden flex flex-col z-10">
            <div className="bg-white border-b border-slate-200 p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center text-white shrink-0 shadow-inner">
                <Bot size={16} />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-slate-800 leading-tight truncate">{name || `${role.label} Bot`}</h4>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 block"></span> online
                </p>
              </div>
            </div>
            <div className="flex-1 bg-slate-50 p-4 flex flex-col gap-4 text-xs overflow-hidden">
              <div className="self-center text-[10px] text-slate-400 font-medium mb-2">Today</div>
              
              <div className="self-end bg-[#10b981]/20 text-slate-800 p-3 rounded-2xl rounded-tr-sm max-w-[85%] relative">
                Hi! {role.id === 'Customer Support' ? "I need help with my account." : role.id === 'Recruitment' ? "Are there any open roles?" : role.id === 'Appointment' ? "I want to schedule a meeting." : "Can you assist me?"}
              </div>
              
              <div className="self-start bg-white border border-slate-200 text-slate-800 p-3 rounded-2xl rounded-tl-sm max-w-[85%] relative shadow-sm mt-2">
                <div className="absolute -left-10 top-6 w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-200">
                  <img src={`https://ui-avatars.com/api/?name=${name?.[0] || role.label.charAt(0)}&background=10b981&color=fff`} alt="bot" className="w-full h-full object-cover" />
                </div>
                {role.id === 'Customer Support' ? "Hello! 👋 I'm here to help. Could you please provide your registered email?" 
                : role.id === 'Recruitment' ? "Hi there! We have several exciting openings. What field are you interested in?" 
                : role.id === 'Appointment' ? "Certainly! 📅 Let's get that scheduled. What date works best for you?" 
                : "Hello! 😊 I'd be happy to assist you today. How can I help?"}
              </div>
              
               <div className="mt-auto bg-white border border-slate-200 text-slate-400 p-3 rounded-full text-[10px] flex items-center shadow-sm">
                Type a message...
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
