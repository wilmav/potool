import { useEffect, useState, useRef } from 'react'
import { useStore } from './store'
import { supabase } from './supabase'
import { Sidebar } from './components/Sidebar'
import { NoteEditor } from './components/NoteEditor'
import { Auth } from './components/Auth'
import { LandingPage } from './components/LandingPage'
import { Layout, Globe, LogOut, Sparkles, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react'

function App() {
    const { language, setLanguage, user, setUser, fetchBullets, activeNoteId, saveNote } = useStore()
    const [loadingAuth, setLoadingAuth] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchBullets()
            setLoadingAuth(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchBullets()
            setLoadingAuth(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = () => {
        if (activeNoteId) {
            setShowLogoutConfirm(true)
        } else {
            // No active note, just logout
            performLogout(false)
        }
    }

    const [view, setView] = useState('landing') // 'landing' | 'login'
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [sidebarWidth, setSidebarWidth] = useState(400)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isResizing, setIsResizing] = useState(false)
    const sidebarRef = useRef(null)

    const startResizing = (mouseDownEvent) => {
        setIsResizing(true)
    }

    const stopResizing = () => {
        setIsResizing(false)
    }

    const resize = (mouseMoveEvent) => {
        if (isResizing) {
            const newWidth = mouseMoveEvent.clientX
            if (newWidth > 250 && newWidth < 800) {
                setSidebarWidth(newWidth)
            }
        }
    }

    useEffect(() => {
        window.addEventListener("mousemove", resize)
        window.addEventListener("mouseup", stopResizing)
        return () => {
            window.removeEventListener("mousemove", resize)
            window.removeEventListener("mouseup", stopResizing)
        }
    }, [isResizing])

    if (loadingAuth) {
        return <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>
    }

    if (!user) {
        if (view === 'login') {
            return <Auth onBack={() => setView('landing')} />
        }
        return <LandingPage onLogin={() => setView('login')} />
    }

    const performLogout = async (shouldSave = false) => {
        if (shouldSave && activeNoteId) {
            await saveNote(true)
        }
        await supabase.auth.signOut()
        setUser(null)
        setView('landing')
        setShowLogoutConfirm(false)
    }

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 relative">
            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-slate-100 mb-2">
                                {language === 'fi' ? 'Kirjaudutaanko ulos?' : 'Log out?'}
                            </h3>
                            <p className="text-slate-400 mb-6 leading-relaxed">
                                {language === 'fi'
                                    ? 'Haluatko tallentaa nykyisen tilanteen uudeksi versioksi historiaan ennen poistumista?'
                                    : 'Do you want to create a new version snapshot in history before logging out?'}
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => performLogout(true)}
                                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    {language === 'fi' ? 'Tallenna versio ja kirjaudu ulos' : 'Save Version & Log Out'}
                                </button>

                                <button
                                    onClick={() => performLogout(false)}
                                    className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all active:scale-[0.98]"
                                >
                                    {language === 'fi' ? 'Kirjaudu ulos (vain luonnos)' : 'Log Out (Draft only)'}
                                </button>

                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="w-full py-2 px-4 text-slate-500 hover:text-slate-300 font-medium transition-colors mt-2"
                                >
                                    {language === 'fi' ? 'Peruuta' : 'Cancel'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar with Bullet Library - Darker Panel */}
            <aside
                ref={sidebarRef}
                className={`border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col shadow-2xl relative z-20 transition-all duration-300 ease-in-out`}
                style={{ width: isSidebarOpen ? sidebarWidth : 0, opacity: isSidebarOpen ? 1 : 0, overflow: 'hidden' }}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 min-w-[350px]">
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
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
                            title={language === 'fi' ? "Sulje sivupalkki" : "Close Sidebar"}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-hidden min-w-[350px]">
                    <Sidebar />
                </div>
            </aside>

            {/* Resizer Handle */}
            {isSidebarOpen && (
                <div
                    className="w-1.5 bg-transparent hover:bg-indigo-500/50 cursor-col-resize z-30 flex items-center justify-center group transition-colors"
                    onMouseDown={startResizing}
                >
                    <div className="h-8 w-1 rounded-full bg-slate-700 group-hover:bg-indigo-400 transition-colors"></div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/5 via-slate-950 to-slate-950 pointer-events-none" />
                <NoteEditor
                    onLogout={handleLogout}
                    isSidebarOpen={isSidebarOpen}
                    onOpenSidebar={() => setIsSidebarOpen(true)}
                />
            </main>
        </div>
    )
}

export default App
