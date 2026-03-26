import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export default function Tester() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultAgentId = searchParams.get('agent');

  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(defaultAgentId || '');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch available agents
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/admin/agents', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.agents.length > 0) {
          setAgents(data.agents);
          if (!selectedAgent) setSelectedAgent(data.agents[0].id);
        }
      } catch (e) {
        console.error("Agents fetch error:", e);
      }
    };
    fetchAgents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedAgent) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/test-chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ message: userMsg, agentId: selectedAgent })
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: data.reply,
          context: data.contextUsed 
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', content: '❌ Error: ' + data.error }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: '❌ Connection error' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeAgentInfo = agents.find(a => a.id === selectedAgent);

  return (
    <div className="flex flex-col h-full bg-[#09090b] relative">
      {/* Header */}
      <header className="h-[72px] shrink-0 border-b border-[#27272a] bg-[rgba(12,12,14,0.8)] backdrop-blur-md px-8 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-lg">AI Scenario Tester</h2>
            <p className="text-xs text-slate-400">Sandbox environment to validate your bots.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-400 max-md:hidden">Target Agent:</label>
          <select 
            className="bg-[#18181b] border border-[#27272a] text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#10b981]"
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
          >
            {agents.length === 0 && <option value="">No agents available</option>}
            {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.role})</option>)}
          </select>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col items-center">
        
        {!activeAgentInfo && agents.length === 0 && (
           <div className="text-slate-500 text-sm mt-10 p-6 bg-[#18181b] rounded-2xl border border-[#27272a] flex items-center gap-3">
              <AlertCircle size={20} className="text-yellow-500" /> Please setup an AI Agent first!
           </div>
        )}

        {messages.length === 0 && activeAgentInfo && (
          <div className="flex flex-col items-center justify-center text-center mt-20 max-w-[400px]">
            <div className="w-20 h-20 rounded-full bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.15)]">
              <Bot size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">Test '{activeAgentInfo?.name}'</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Send a message to see how your agent responds based on its role and assigned knowledge base.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex max-w-[800px] w-full gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
              msg.role === 'user' ? 'bg-slate-700 text-white' : 'bg-[#10b981] text-white'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm max-w-[600px] ${
                msg.role === 'user'
                  ? 'bg-[#18181b] border border-[#27272a] text-slate-200 rounded-tr-sm'
                  : 'bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] text-emerald-50 rounded-tl-sm font-medium'
              }`}>
                {msg.role === 'user' ? (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                ) : (
                  <ReactMarkdown
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-2 last:mb-0 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-2 last:mb-0 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-white relative z-10" {...props} />,
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 text-white" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 text-white" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-md font-bold mb-1 text-white" {...props} />,
                      code: ({node, inline, ...props}) => 
                        inline ? <code className="bg-black/30 px-1.5 py-0.5 rounded text-emerald-200 text-sm font-mono" {...props} />
                               : <pre className="bg-black/40 p-3 rounded-xl overflow-x-auto text-sm mb-2 border border-emerald-500/20 font-mono"><code className="text-emerald-200" {...props} /></pre>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex max-w-[800px] w-full gap-4 flex-row">
            <div className="w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center shrink-0 mt-1">
              <Bot size={16} />
            </div>
            <div className="px-5 py-4 rounded-2xl bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] text-[#10b981] rounded-tl-sm flex gap-1.5 items-center">
               <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-bounce" style={{animationDelay: '0ms'}}></span>
               <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-bounce" style={{animationDelay: '150ms'}}></span>
               <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-bounce" style={{animationDelay: '300ms'}}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-8 shrink-0 flex justify-center pb-8 border-t border-[#27272a] bg-[#0c0c0e]">
        <div className="max-w-[800px] w-full relative">
          <textarea
            className="w-full bg-[#18181b] border border-[#27272a] rounded-2xl pl-5 pr-14 py-4 text-[15px] text-slate-200 focus:outline-none focus:border-[#10b981] shadow-inner resize-none overflow-hidden"
            rows="1"
            placeholder="Type a message to test the AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            style={{ minHeight: '56px', maxHeight: '200px' }}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading || !selectedAgent}
            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-[#10b981] hover:bg-[#059669] disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-xl transition-colors shadow-sm"
          >
            <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
