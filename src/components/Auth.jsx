import { useState } from 'react'
import { supabase } from '../supabase'
import { Loader2, Layout } from 'lucide-react'

export function Auth({ onBack }) {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        // 1. Guest Login "Backdoor"
        if (email.trim() === 'guest-mode') {
            const { error } = await supabase.auth.signInWithPassword({
                email: 'guest@potool.com',
                password: 'guest-password-123',
            })

            if (error) {
                console.error('Guest login failed:', error)
                setMessage('Vieras-kirjautuminen epäonnistui. (Guest login failed.)')
            } else {
                // Success is handled by onAuthStateChange in App.jsx
            }
            setLoading(false)
            return
        }

        // 2. Allowlist Check for Magic Link
        const ALLOWED_EMAILS = [
            'wilma.vertaiskuntoutus@gmail.com',
            'guest@potool.com',
            'iao@iki.fi',
            'orangelemon@live.com'
        ]

        if (!ALLOWED_EMAILS.includes(email.trim().toLowerCase())) {
            setMessage('Pääsy evätty. Vain valtuutetut käyttäjät. (Access Denied.)')
            setLoading(false)
            return
        }

        // 3. Standard Magic Link
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        })

        if (error) {
            setMessage('Error: ' + error.message)
        } else {
            setMessage('Tarkista sähköpostisi! Lähetimme sinulle kirjautumislinkin. (Check your email!)')
        }
        setLoading(false)
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4 text-slate-200">
            <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-8 sm:p-10 relative">
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 text-slate-500 hover:text-slate-300 transition-colors text-sm font-medium"
                >
                    ← Back
                </button>

                <div className="flex flex-col items-center mb-10 mt-4">
                    <div className="p-3 bg-indigo-500/10 rounded-xl mb-4">
                        <Layout className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                        PO Tool
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Bilingual Specification & Planning</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:outline-none text-slate-200 placeholder-slate-600 transition-all font-medium"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Magic Link'}
                    </button>
                </form>

                {message && (
                    <div className={`mt-6 p-4 rounded-xl text-sm font-medium text-center ${message.startsWith('Error') ? 'bg-rose-950/30 text-rose-400 border border-rose-900/50' : 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/50'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    )
}
