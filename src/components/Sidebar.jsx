import { useState } from 'react'
import { useStore } from '../store'
import { Search, ChevronDown, ChevronRight, Check, EyeOff, Plus, Star } from 'lucide-react'

export function Sidebar() {
    const { language, bullets, loadingBullets, toggleBulletActive, hideBullet, addToNote } = useStore()
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedThemes, setExpandedThemes] = useState(new Set(['Discovery', 'Riskit', 'Ideointi', 'Määrittely']))

    // Group bullets by theme
    const themes = [...new Set(bullets.map(b => b.theme))]

    const toggleTheme = (theme) => {
        const next = new Set(expandedThemes)
        if (next.has(theme)) next.delete(theme)
        else next.add(theme)
        setExpandedThemes(next)
    }

    // Filter logic: Search + Hidden check
    const filteredBullets = bullets.filter(b => {
        if (b.is_hidden) return false
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return b.fi_text.toLowerCase().includes(term) || b.en_text.toLowerCase().includes(term)
    })

    // Group filtered bullets
    const groupedBullets = themes.reduce((acc, theme) => {
        const inTheme = filteredBullets.filter(b => b.theme === theme)
        if (inTheme.length > 0) acc[theme] = inTheme
        return acc
    }, {})

    return (
        <div className="p-4 space-y-6 h-full flex flex-col">
            {/* Search */}
            <div className="relative shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder={language === 'fi' ? "Hae avainsanoja..." : "Search keywords..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:outline-none text-sm text-slate-200 placeholder-slate-500 transition-all shadow-sm"
                />
            </div>

            {/* Accordions */}
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loadingBullets ? (
                    <div className="flex justify-center py-8 text-slate-500">
                        <span className="text-sm animate-pulse">Loading library...</span>
                    </div>
                ) : (
                    Object.entries(groupedBullets).map(([theme, items]) => (
                        <div key={theme} className="bg-slate-800/30 rounded-xl border border-slate-700/30 overflow-hidden backdrop-blur-sm">
                            <button
                                onClick={() => toggleTheme(theme)}
                                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-300 hover:text-indigo-400 hover:bg-slate-800/50 transition-all"
                            >
                                <span>{theme}</span>
                                {expandedThemes.has(theme) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>

                            {expandedThemes.has(theme) && (
                                <div className="px-2 pb-2 space-y-1">
                                    {items.sort((a, b) => {
                                        const textA = language === 'fi' ? a.fi_text : a.en_text
                                        const textB = language === 'fi' ? b.fi_text : b.en_text
                                        return textA.localeCompare(textB)
                                    }).map(bullet => (
                                        <BulletCard key={bullet.id} bullet={bullet} language={language} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

function BulletCard({ bullet, language }) {
    const { toggleBulletActive, hideBullet, addToNote } = useStore()

    const primaryText = language === 'fi' ? bullet.fi_text : bullet.en_text
    const secondaryText = language === 'fi' ? bullet.en_text : bullet.fi_text

    return (
        <div className={`
      group flex items-start justify-between p-2.5 rounded-lg border transition-all duration-200
      ${bullet.is_active
                ? 'bg-indigo-900/20 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                : 'bg-transparent border-transparent hover:bg-slate-700/30 hover:border-slate-600/30'}
    `}>
            <div className="flex-1 mr-2 min-w-0">
                <div className="flex flex-col">
                    <span className={`font-medium text-sm truncate ${bullet.is_active ? 'text-indigo-300' : 'text-slate-300 group-hover:text-slate-200'}`}>
                        {primaryText}
                    </span>
                    <span className="text-xs text-slate-500 truncate group-hover:text-slate-400 transition-colors">
                        {secondaryText}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-95 group-hover:scale-100">
                <ActionBtn
                    onClick={() => toggleBulletActive(bullet.id)}
                    active={bullet.is_active}
                    icon={Check}
                    label={language === 'fi' ? "Aktivoi" : "Activate"}
                />
                <ActionBtn
                    onClick={() => addToNote(primaryText)}
                    icon={Plus}
                    label={language === 'fi' ? "Lisää" : "Add"}
                />
                <button
                    onClick={() => hideBullet(bullet.id)}
                    title={language === 'fi' ? "Piilota" : "Hide"}
                    className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-900/20 transition-colors"
                >
                    <EyeOff className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}

function ActionBtn({ onClick, active, icon: Icon, label }) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={`p-1.5 rounded-md transition-all ${active
                    ? 'text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30'
                    : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-600/50'
                }`}
        >
            <Icon className="w-3.5 h-3.5" />
        </button>
    )
}
