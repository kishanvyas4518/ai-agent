import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      login(data.token, data.client);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-5">
      <div className="w-full max-w-[420px] p-10 rounded-3xl bg-[rgba(24,24,27,0.6)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="text-center mb-8">
          <div className="bg-[rgba(16,185,129,0.1)] text-[#10b981] w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <LogIn size={28} />
          </div>
          <h2 className="text-2xl font-bold mt-4 mb-1 text-slate-50">Welcome Back</h2>
          <p className="text-slate-400 text-sm">Sign in to your RAG SaaS workspace</p>
        </div>
        
        {error && <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-3 rounded-xl mb-5 text-sm text-center">{error}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="relative flex items-center">
            <Mail size={18} className="absolute left-4 text-slate-400" />
            <input 
              type="email" 
              placeholder="Email address" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full bg-black/20 border border-[rgba(255,255,255,0.08)] text-slate-50 py-3 pr-4 pl-11 rounded-xl text-sm transition-all focus:outline-none focus:border-[#10b981] focus:bg-black/30"
              required 
            />
          </div>
          <div className="relative flex items-center">
            <Lock size={18} className="absolute left-4 text-slate-400" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full bg-black/20 border border-[rgba(255,255,255,0.08)] text-slate-50 py-3 pr-4 pl-11 rounded-xl text-sm transition-all focus:outline-none focus:border-[#10b981] focus:bg-black/30"
              required 
            />
          </div>
          <button type="submit" className="bg-[#10b981] hover:bg-[#059669] text-white py-3.5 mt-2 rounded-xl font-semibold text-[15px] cursor-pointer transition-all flex items-center justify-center gap-2 hover:-translate-y-[1px] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-slate-400">
          Don't have an account? <Link to="/register" className="text-[#10b981] font-medium hover:underline">Create a workspace</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
