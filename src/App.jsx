import { useEffect } from 'react'
import { useStore } from './store'
import { supabase } from './supabase'
import { Sidebar } from './components/Sidebar'
import { NoteEditor } from './components/NoteEditor'
import { Auth } from './components/Auth'
import { Layout, Globe, LogOut, Sparkles } from 'lucide-react'

function App() {
    const { language, setLanguage, user, setUser, fetchBullets } = useStore()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchBullets()
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchBullets()
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
    }

    if (!user) {
        return <Auth />
    }

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
            {/* Sidebar with Bullet Library - Darker Panel */}
            <aside className="w-[400px] min-w-[350px] border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col shadow-2xl relative z-20">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
                    <h1 className="font-bold text-xl flex items-center gap-2.5 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        <Layout className="w-6 h-6 text-indigo-400" />
                        PO Tool
                    </h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setLanguage(language === 'fi' ? 'en' : 'fi')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-xs font-semibold tracking-wide transition-all text-slate-300 hover:text-white"
                        >
                            <Globe className="w-3.5 h-3.5" />
                            {language.toUpperCase()}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-all"
                            title="Log out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-hidden">
                    <Sidebar />
                </div>
            </aside>

            {/* Main Content: Note Editor - Lighter Dark Panel */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/5 via-slate-950 to-slate-950 pointer-events-none" />
                <NoteEditor />
            </main>
        </div>
    )
}

export default App
