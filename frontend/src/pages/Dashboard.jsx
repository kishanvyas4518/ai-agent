import { BookOpen, Link as LinkIcon, FileText, MessageCircleQuestion, Upload, Trash2, Plus, Type, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';

export default function Dashboard() {
  const { token } = useAuth();
  const { agentId } = useParams();
  
  const [activeTab, setActiveTab] = useState('text');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [agentInfo, setAgentInfo] = useState(null);
  
  // Tab Inputs
  const [textContent, setTextContent] = useState('');
  const [urlLink, setUrlLink] = useState('');
  const [file, setFile] = useState(null);
  const [qnaPairs, setQnaPairs] = useState([{ q: '', a: '' }]);

  const [history, setHistory] = useState([]);

  useEffect(() => {
    if(agentId && token) {
      fetchHistory();
      fetchAgentInfo();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, agentId]);

  const fetchAgentInfo = async () => {
    try {
      const res = await fetch('/api/admin/agents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const currentAgent = data.agents.find(a => a.id === agentId);
        setAgentInfo(currentAgent);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/admin/knowledge/${agentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setHistory(data.knowledge);
    } catch (e) {
      console.error(e);
    }
  };

  const addQnaPair = () => setQnaPairs([...qnaPairs, { q: '', a: '' }]);
  const removeQnaPair = (index) => setQnaPairs(qnaPairs.filter((_, i) => i !== index));
  const updateQnaPair = (index, field, value) => {
    const newPairs = [...qnaPairs];
    newPairs[index][field] = value;
    setQnaPairs(newPairs);
  };

  const handleCopyKey = () => {
    if (!agentInfo?.apiKey) return;
    navigator.clipboard.writeText(agentInfo.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpload = async (type) => {
    setLoading(true);
    setStatus(null);
    const formData = new FormData();
    formData.append('agentId', agentId);
    formData.append('type', type);

    try {
      if (type === 'TEXT') {
        if (!textContent) throw new Error("Please enter some text");
        formData.append('title', 'Text Snippet');
        formData.append('content', textContent);
      } 
      else if (type === 'LINK') {
        if (!urlLink) throw new Error("Please enter a valid URL");
        formData.append('title', `Website: ${urlLink}`);
        formData.append('content', urlLink);
      } 
      else if (type === 'FILE') {
        if (!file) throw new Error("Please select a PDF or TXT file");
        formData.append('title', `Doc: ${file.name}`);
        formData.append('file', file);
      } 
      else if (type === 'QNA') {
        const validPairs = qnaPairs.filter(p => p.q.trim() && p.a.trim());
        if (validPairs.length === 0) throw new Error("Please enter at least one Q&A pair");
        formData.append('title', `Q&A Data (${validPairs.length} pairs)`);
        formData.append('content', JSON.stringify(validPairs));
      }

      const res = await fetch('/api/admin/knowledge', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setStatus({ type: 'success', msg: 'Knowledge successfully trained and stored!' });
      
      // Clear inputs
      setTextContent(''); setUrlLink(''); setFile(null); setQnaPairs([{ q: '', a: '' }]);
      
      fetchHistory();
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Are you sure you want to delete this data? The AI will forget it forever.")) return;
    try {
      const res = await fetch(`/api/admin/knowledge/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchHistory();
    } catch (e) {
      console.error(e);
    }
  };

  if(!agentId) return <div className="p-10 text-white">No Agent Selected</div>;

  const curlExample = `curl -X POST ${window.location.origin}/api/public/chat \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${agentInfo?.apiKey || 'YOUR_API_KEY'}" \\
  -d '{"message": "Hello!"}'`;

  const jsExample = `const chatWithAI = async (text) => {
  const response = await fetch("${window.location.origin}/api/public/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "${agentInfo?.apiKey || 'YOUR_API_KEY'}"
    },
    body: JSON.stringify({ message: text })
  });
  const data = await response.json();
  return data.reply;
};`;

  return (
    <div className="p-10 max-w-[1200px] w-full mx-auto max-md:p-5 h-full overflow-y-auto pb-20">
      <Link to="/home" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors w-fit font-medium">
        <ArrowLeft size={16} /> Back to Overview
      </Link>

      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-slate-50">Manage {agentInfo?.name || 'Agent'}</h2>
          <p className="text-slate-400 text-sm">Upload documents, crawl websites, or integrate via Open API.</p>
        </div>
        {agentInfo && (
          <div className="bg-[#10b981]/10 px-4 py-2 rounded-xl border border-[#10b981]/20">
            <span className="text-xs text-slate-400 block mb-0.5">Current Role</span>
            <span className="text-[#10b981] font-bold text-sm">{agentInfo.role}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-[#18181b] p-2 rounded-2xl w-fit border border-[rgba(255,255,255,0.05)]">
        {[
          { id: 'text', icon: Type, label: 'KNOWLEDGE' },
          { id: 'link', icon: LinkIcon, label: 'LINK' },
          { id: 'document', icon: FileText, label: 'DOCUMENT' },
          { id: 'qna', icon: MessageCircleQuestion, label: 'QUESTIONS & ANSWER' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === tab.id 
                ? 'bg-[#10b981] text-white shadow-[0_2px_10px_rgba(16,185,129,0.3)]' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#27272a]'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Input Form Containers */}
      <div className="bg-[rgba(24,24,27,0.6)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-3xl p-8 mb-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#10b981]/5 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        
        {activeTab === 'text' && (
          <div className="flex flex-col gap-4 relative z-10">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Type size={20} className="text-[#10b981]" /> Paste Unstructured Text
            </h3>
            <textarea
              className="w-full h-48 bg-black/40 border border-[#27272a] rounded-2xl p-5 text-sm text-slate-200 focus:outline-none focus:border-[#10b981] transition-colors resize-y shadow-inner"
              placeholder="Paste any company policy, product descriptions, or rules here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
            />
            <button 
              disabled={loading} onClick={() => handleUpload('TEXT')}
              className="self-end bg-[#10b981] hover:bg-[#059669] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-[0_4px_14px_rgba(16,185,129,0.4)]"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} Teach AI
            </button>
          </div>
        )}

        {activeTab === 'link' && (
          <div className="flex flex-col gap-4 relative z-10">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <LinkIcon size={20} className="text-[#10b981]" /> Scrape Website
            </h3>
            <p className="text-sm text-slate-400">The AI will visit this URL and read its visible text content.</p>
            <input
              type="url"
              className="w-full bg-black/40 border border-[#27272a] rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-[#10b981] transition-colors"
              placeholder="https://yourwebsite.com/about"
              value={urlLink}
              onChange={(e) => setUrlLink(e.target.value)}
            />
            <button 
              disabled={loading} onClick={() => handleUpload('LINK')}
              className="self-end bg-[#10b981] hover:bg-[#059669] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-[0_4px_14px_rgba(16,185,129,0.4)]"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} Fetch & Train
            </button>
          </div>
        )}

        {activeTab === 'document' && (
          <div className="flex flex-col gap-4 relative z-10">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <FileText size={20} className="text-[#10b981]" /> Upload Document
            </h3>
            <p className="text-sm text-slate-400">Supported formats: PDF, TXT. Text will be extracted directly.</p>
            <div className="border-2 border-dashed border-[#27272a] rounded-2xl p-10 flex flex-col items-center justify-center bg-black/20 hover:bg-black/40 transition-colors">
              <FileText size={40} className="text-[#10b981] mb-4 opacity-50" />
              <input
                type="file"
                accept=".pdf,.txt"
                className="text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#10b981] file:text-white hover:file:bg-[#059669] cursor-pointer"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
            <button 
              disabled={loading} onClick={() => handleUpload('FILE')}
              className="self-end bg-[#10b981] hover:bg-[#059669] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-[0_4px_14px_rgba(16,185,129,0.4)] mt-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} Upload File
            </button>
          </div>
        )}

        {activeTab === 'qna' && (
          <div className="flex flex-col gap-4 relative z-10">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <MessageCircleQuestion size={20} className="text-[#10b981]" /> Questions & Answers
            </h3>
            <p className="text-sm text-slate-400 mb-2">Directly feed the bot specific answers to expected questions.</p>
            
            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4">
              {qnaPairs.map((pair, idx) => (
                <div key={idx} className="bg-black/30 p-5 rounded-2xl border border-[#27272a] flex items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <input
                      className="w-full bg-transparent border-b border-[#27272a] p-2 text-sm text-slate-200 focus:outline-none focus:border-[#10b981] placeholder-slate-600 font-medium"
                      placeholder="e.g. What are your working hours?"
                      value={pair.q}
                      onChange={(e) => updateQnaPair(idx, 'q', e.target.value)}
                    />
                    <textarea
                      className="w-full bg-black/50 border border-[#27272a] rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-[#10b981] resize-y h-20"
                      placeholder="e.g. We are open Monday to Friday from 9 AM to 5 PM."
                      value={pair.a}
                      onChange={(e) => updateQnaPair(idx, 'a', e.target.value)}
                    />
                  </div>
                  {qnaPairs.length > 1 && (
                    <button onClick={() => removeQnaPair(idx)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg mt-2">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <button onClick={addQnaPair} className="text-[#10b981] font-bold text-sm flex items-center gap-1 hover:text-[#059669]">
                <Plus size={16} /> Add Another Pair
              </button>
              <button 
                disabled={loading} onClick={() => handleUpload('QNA')}
                className="bg-[#10b981] hover:bg-[#059669] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-[0_4px_14px_rgba(16,185,129,0.4)]"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} Save Q&A List
              </button>
            </div>
          </div>
        )}

        {status && (
          <div className={`mt-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 relative z-10 border ${
            status.type === 'success' 
              ? 'bg-[rgba(16,185,129,0.1)] text-[#10b981] border-[rgba(16,185,129,0.2)]' 
              : 'bg-red-500/10 text-red-500 border-red-500/20'
          }`}>
            {status.msg}
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="animate-in fade-in duration-500">
        <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
          <BookOpen size={20} className="text-[#10b981]" /> Agent Memory History
        </h3>
        {history.length === 0 ? (
          <div className="text-center py-10 bg-[rgba(24,24,27,0.4)] border border-[#27272a] rounded-2xl">
            <p className="text-slate-500 font-medium">No training data provided yet.</p>
          </div>
        ) : (
          <div className="bg-[rgba(24,24,27,0.6)] backdrop-blur-xl border border-[#27272a] rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#18181b] text-slate-400 font-semibold border-b border-[#27272a]">
                  <th className="p-4">Type</th>
                  <th className="p-4">Detail</th>
                  <th className="p-4">Date Added</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-[#27272a]/50 hover:bg-[#18181b] transition-colors">
                    <td className="p-4 font-medium">
                      <span className="bg-[#10b981]/10 text-[#10b981] px-2.5 py-1 rounded-md text-xs tracking-wider">{h.type}</span>
                    </td>
                    <td className="p-4 truncate max-w-[250px]" title={h.title}>{h.title}</td>
                    <td className="p-4 text-slate-500 text-xs">{(new Date(h.createdAt)).toLocaleDateString()}</td>
                    <td className="p-4">
                      {h.status === 'processed' 
                        ? <span className="flex items-center gap-1.5 text-xs text-[#10b981] font-bold"><span className="w-2 h-2 bg-[#10b981] rounded-full"></span> Trained</span>
                        : <span className="flex items-center gap-1.5 text-xs text-yellow-500 font-bold"><Loader2 size={12} className="animate-spin" /> Processing</span>
                      }
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDelete(h.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
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
