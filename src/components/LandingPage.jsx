import { Layout, Globe, Check, Sparkles, Cloud, Languages, Lock, Zap } from 'lucide-react'
import { useStore } from '../store'

export function LandingPage({ onLogin }) {
    const { language, setLanguage } = useStore()

    const t = {
        hero: {
            title: language === 'fi' ? 'Kaksikielinen, tekoälyä hyödyntävä työkalu tuoteomistajan arkeen.' : 'A bilingual, AI-assisted tool for everyday PO work.',
            subtitle: language === 'fi'
                ? 'Valmistele suunnitelmia suomeksi ja englanniksi yhdellä työkalulla.'
                : 'Create plans in Finnish and English with a single tool.',
            login: language === 'fi' ? 'Kirjaudu sisään' : 'Log in'
        },
        features: {
            bilingual: {
                title: language === 'fi' ? 'Kaksikielinen käyttöliittymä ja sisältötyöskentely' : 'Bilingual interface and content workflow',
                desc: language === 'fi'
                    ? 'Vaihda suomen ja englannin välillä helposti. Käännä sisältö tekoälyllä sekunneissa.'
                    : 'Switch between Finnish and English with ease. Translate content with AI in seconds.'
            },
            cloud: {
                title: language === 'fi' ? 'Sisällöt tallentuvat automaattisesti pilveen' : 'Automatic cloud saving',
                desc: language === 'fi'
                    ? 'Kaikki muutokset tallentuvat pilveen reaaliajassa. Selaa versiohistoriaa ja palauta aiempi versio.'
                    : 'Changes sync to the cloud in real-time. Browse version history and restore anytime.'
            },
            templates: {
                title: language === 'fi' ? 'Termikirjastosta apua rakenteeseen' : 'Support for structure from the terminology library',
                desc: language === 'fi'
                    ? 'Kattava kirjasto yleisimmille PO-termeille ja hyödyllisille ilmauksille.'
                    : 'Curated library of common PO terms and sentence structures widely used in the industry.'
            }
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                            <Layout className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-100">PO Tool</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setLanguage(language === 'fi' ? 'en' : 'fi')}
                            className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <Globe className="w-4 h-4" />
                            {language.toUpperCase()}
                        </button>
                        <button
                            onClick={onLogin}
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
                        >
                            {t.hero.login}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-slate-900 border border-indigo-500/30 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)] text-indigo-200 text-sm font-medium transition-transform hover:scale-105 cursor-default">
                        <span>🔥</span>
                        {language === 'fi' ? 'Uutta: Versiohistoria' : 'New: Version History'}
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8 pb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                        {t.hero.title}
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg lg:text-xl text-indigo-400 mb-10 leading-relaxed">
                        {t.hero.subtitle}
                    </p>



                    {/* Dashboard Preview Mockup */}
                    <div className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-2xl overflow-hidden group">
                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900">
                            <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                            <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                            <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                            <div className="ml-4 px-3 py-1 rounded-md bg-slate-800 text-xs text-slate-500 font-mono">po-tool.com</div>
                        </div>
                        <div className="p-1 bg-slate-900">
                            {/* Simulated UI Area */}
                            <div className="grid grid-cols-4 h-[400px] gap-1">
                                <div className="hidden md:block col-span-1 bg-slate-900/50 border-r border-slate-800 p-4 space-y-3">
                                    <div className="h-2 w-3/4 bg-slate-800 rounded"></div>
                                    <div className="h-2 w-1/2 bg-slate-800 rounded"></div>
                                    <div className="pt-4 space-y-2">
                                        <div className="h-8 w-full bg-indigo-500/20 rounded-lg border border-indigo-500/30"></div>
                                        <div className="h-8 w-full bg-slate-800/30 rounded-lg"></div>
                                        <div className="h-8 w-full bg-slate-800/30 rounded-lg"></div>
                                    </div>
                                </div>
                                <div className="col-span-4 md:col-span-3 bg-slate-950 p-6 md:p-8">
                                    <div className="h-8 w-1/3 bg-slate-800 rounded mb-6"></div>
                                    <div className="space-y-4">
                                        <div className="h-4 w-full bg-slate-800/60 rounded"></div>
                                        <div className="h-4 w-5/6 bg-slate-800/60 rounded"></div>
                                        <div className="h-4 w-4/6 bg-slate-800/60 rounded"></div>
                                    </div>
                                    <div className="mt-8 p-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 flex items-center justify-center text-slate-600 text-sm">
                                        <Sparkles className="w-4 h-4 mr-2" /> AI Assistant Ready
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 bg-slate-900/30 border-t border-slate-800/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-colors group">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Languages className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-100 mb-3">{t.features.bilingual.title}</h3>
                            <p className="text-slate-400 leading-relaxed">
                                {t.features.bilingual.desc}
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 transition-colors group">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Cloud className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-100 mb-3">{t.features.cloud.title}</h3>
                            <p className="text-slate-400 leading-relaxed">
                                {t.features.cloud.desc}
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 transition-colors group">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Zap className="w-6 h-6 text-amber-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-100 mb-3">{t.features.templates.title}</h3>
                            <p className="text-slate-400 leading-relaxed">
                                {t.features.templates.desc}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-800 bg-slate-950 py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                        <Layout className="w-5 h-5 text-indigo-500" />
                        <span className="font-semibold tracking-tight">PO Tool</span>
                    </div>
                    <div className="text-sm text-slate-500">
                        &copy; 2026 po-tool.com. {language === 'fi' ? 'Kaikki oikeudet pidätetään.' : 'All rights reserved.'}
                    </div>
                </div>
            </footer>
        </div>
    )
}
