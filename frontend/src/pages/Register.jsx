import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, Building, Phone } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '', password: '', businessName: '', whatsappNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
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
            <UserPlus size={28} />
          </div>
          <h2 className="text-2xl font-bold mt-4 mb-1 text-slate-50">Create Workspace</h2>
          <p className="text-slate-400 text-sm">Get started with WhatsApp RAG</p>
        </div>
        
        {error && <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-3 rounded-xl mb-5 text-sm text-center">{error}</div>}
        {success && <div className="bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 p-3 rounded-xl mb-5 text-sm text-center">{success}</div>}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="relative flex items-center">
            <Building size={18} className="absolute left-4 text-slate-400" />
            <input type="text" name="businessName" placeholder="Business Name" onChange={handleChange} className="w-full bg-black/20 border border-[rgba(255,255,255,0.08)] text-slate-50 py-3 pr-4 pl-11 rounded-xl text-sm transition-all focus:outline-none focus:border-[#10b981] focus:bg-black/30" required />
          </div>
          <div className="relative flex items-center">
            <Mail size={18} className="absolute left-4 text-slate-400" />
            <input type="email" name="email" placeholder="Email address" onChange={handleChange} className="w-full bg-black/20 border border-[rgba(255,255,255,0.08)] text-slate-50 py-3 pr-4 pl-11 rounded-xl text-sm transition-all focus:outline-none focus:border-[#10b981] focus:bg-black/30" required />
          </div>
          <div className="relative flex items-center">
            <Lock size={18} className="absolute left-4 text-slate-400" />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full bg-black/20 border border-[rgba(255,255,255,0.08)] text-slate-50 py-3 pr-4 pl-11 rounded-xl text-sm transition-all focus:outline-none focus:border-[#10b981] focus:bg-black/30" required />
          </div>
          <div className="relative flex items-center">
            <Phone size={18} className="absolute left-4 text-slate-400" />
            <input type="text" name="whatsappNumber" placeholder="WhatsApp Number" onChange={handleChange} className="w-full bg-black/20 border border-[rgba(255,255,255,0.08)] text-slate-50 py-3 pr-4 pl-11 rounded-xl text-sm transition-all focus:outline-none focus:border-[#10b981] focus:bg-black/30" required />
          </div>
          
          <button type="submit" className="bg-[#10b981] hover:bg-[#059669] text-white py-3.5 mt-2 rounded-xl font-semibold text-[15px] cursor-pointer transition-all flex items-center justify-center gap-2 hover:-translate-y-[1px] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none" disabled={loading}>
            {loading ? 'Creating workspace...' : 'Register'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-[#10b981] font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
