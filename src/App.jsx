import { useEffect } from 'react'
import { useStore } from './store'
import { supabase } from './supabase'
import { Sidebar } from './components/Sidebar'
import { NoteEditor } from './components/NoteEditor'
import { Auth } from './components/Auth'
import { Layout, Globe, LogOut } from 'lucide-react'

function App() {
    const { language, setLanguage, user, setUser, fetchBullets } = useStore()

    useEffect(() => {
        // 1. Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchBullets()
        })

        // 2. Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
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
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Sidebar with Bullet Library */}
            <div className="w-1/3 min-w-[320px] max-w-[450px] border-r border-gray-200 bg-white flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h1 className="font-bold text-lg flex items-center gap-2 text-indigo-700">
                        <Layout className="w-5 h-5" />
                        PO Tool
                    </h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setLanguage(language === 'fi' ? 'en' : 'fi')}
                            className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
                        >
                            <Globe className="w-4 h-4" />
                            {language.toUpperCase()}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            title="Log out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <Sidebar />
                </div>
            </div>

            {/* Main Content: Note Editor */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
                <NoteEditor />
            </div>
        </div>
    )
}

export default App
