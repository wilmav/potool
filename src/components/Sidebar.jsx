import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { Search, ChevronDown, ChevronRight, Check, EyeOff, Plus, Eye, Info, FileText, Layout, FolderOpen } from 'lucide-react'

export function Sidebar() {
    const {
        language, bullets, loadingBullets,
        toggleBulletActive, hideBullet, unhideBullet, addToNote,
        notes, fetchNotes, loadNote, createNote, activeNoteId
    } = useStore()

    const [view, setView] = useState('library') // 'library' | 'plans'
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedThemes, setExpandedThemes] = useState(new Set(['Discovery', 'Riskit', 'Ideointi', 'Määrittely']))

    // Load notes on mount
    useEffect(() => {
        fetchNotes()
    }, [])

    // Theme translation map
    const THEME_LABELS = {
        'Discovery': { fi: 'Discovery', en: 'Discovery' },
        'Ideointi': { fi: 'Ideointi', en: 'Ideation' },
        'Määrittely': { fi: 'Vaatimusmäärittely', en: 'Requirements' },
        'Go-to-market': { fi: 'Go-to-market & Julkaisu', en: 'Go-to-market & Release' },
        'Kommunikaatio': { fi: 'Kommunikaatio & Yhteistyö', en: 'Communication & Collab' },
        'Työkalut': { fi: 'Työkalut & Teknologiat', en: 'Tools & Tech' },
        'Riskit': { fi: 'Riskit', en: 'Risks' }
    }

    // Group bullets by theme
    const themes = [...new Set(bullets.map(b => b.theme))]

    const toggleTheme = (theme) => {
        const next = new Set(expandedThemes)
        if (next.has(theme)) next.delete(theme)
        else next.add(theme)
        setExpandedThemes(next)
    }

    // Filter logic: Search + Hidden check for Library
    const filteredBullets = bullets.filter(b => {
        if (!searchTerm) return !b.is_hidden
        const term = searchTerm.toLowerCase()
        const matchesSearch = b.fi_text.toLowerCase().includes(term) || b.en_text.toLowerCase().includes(term)
        return !b.is_hidden && matchesSearch
    })

    const hiddenBullets = bullets.filter(b => b.is_hidden)

    const groupedBullets = themes.reduce((acc, theme) => {
        const inTheme = filteredBullets.filter(b => b.theme === theme)
        acc[theme] = inTheme
        return acc
    }, {})

    const getHiddenCount = (theme) => hiddenBullets.filter(b => b.theme === theme).length

    const restoreHiddenInTheme = (theme, e) => {
        e.stopPropagation()
        const hiddenInTheme = hiddenBullets.filter(b => b.theme === theme)
        hiddenInTheme.forEach(b => unhideBullet(b.id))
    }

    return (
        <div className="flex flex-col h-full">
            {/* View Switcher */}
            <div className="p-4 pb-0 grid grid-cols-2 gap-2">
                <button
                    onClick={() => setView('library')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${view === 'library'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                >
                    <Layout className="w-4 h-4" />
                    {language === 'fi' ? 'Kirjasto' : 'Library'}
                </button>
                <button
                    onClick={() => setView('plans')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${view === 'plans'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                >
                    <FolderOpen className="w-4 h-4" />
                    {language === 'fi' ? 'Suunnitelmat' : 'My Plans'}
                </button>
            </div>

            <div className="p-4 space-y-6 flex-1 flex flex-col min-h-0">

                {view === 'library' && (
                    <>
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
                                themes.map((theme) => {
                                    const items = groupedBullets[theme] || []
                                    const hiddenCount = getHiddenCount(theme)

                                    if (items.length === 0 && hiddenCount === 0) return null

                                    return (
                                        <div key={theme} className="bg-slate-800/30 rounded-xl border border-slate-700/30 overflow-hidden backdrop-blur-sm">
                                            <div className="flex items-center justify-between pr-4 hover:bg-slate-800/50 transition-all">
                                                <button
                                                    onClick={() => toggleTheme(theme)}
                                                    className="flex-1 flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-300 text-left"
                                                >
                                                    <span className="uppercase tracking-wide text-xs">
                                                        {THEME_LABELS[theme]
                                                            ? THEME_LABELS[theme][language]
                                                            : theme}
                                                    </span>
                                                    {expandedThemes.has(theme) ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                                                </button>

                                                {hiddenCount > 0 && (
                                                    <button
                                                        onClick={(e) => restoreHiddenInTheme(theme, e)}
                                                        title={language === 'fi' ? `Palauta ${hiddenCount} piilotettua` : `Restore ${hiddenCount} hidden`}
                                                        className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-500 hover:text-emerald-400 bg-slate-800/50 hover:bg-emerald-950/30 border border-slate-700 hover:border-emerald-500/30 rounded-md transition-all ml-2"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        <span>{hiddenCount}</span>
                                                    </button>
                                                )}
                                            </div>

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
                                    )
                                })
                            )}
                        </div>
                    </>
                )}

                {view === 'plans' && (
                    <div className="flex flex-col h-full">
                        <button
                            onClick={createNote}
                            className="w-full flex items-center justify-center gap-2 py-3 mb-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
                        >
                            <Plus className="w-5 h-5" />
                            {language === 'fi' ? 'Uusi suunnitelma' : 'New Plan'}
                        </button>

                        <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {notes.length === 0 ? (
                                <div className="text-center py-10 text-slate-500 text-sm">
                                    {language === 'fi' ? 'Ei tallennettuja suunnitelmia.' : 'No saved plans yet.'}
                                </div>
                            ) : (
                                notes.map(note => (
                                    <button
                                        key={note.id}
                                        onClick={() => loadNote(note.id)}
                                        className={`w-full p-4 rounded-xl border text-left transition-all group ${activeNoteId === note.id
                                            ? 'bg-indigo-900/20 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                                            : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800 hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${activeNoteId === note.id ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className={`font-semibold text-sm ${activeNoteId === note.id ? 'text-indigo-100' : 'text-slate-200 group-hover:text-white'}`}>
                                                        {note.title || (language === 'fi' ? 'Nimetön' : 'Untitled')}
                                                    </h3>
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(note.updated_at).toLocaleDateString()} {new Date(note.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            {activeNoteId === note.id && (
                                                <div className="text-indigo-400 bg-indigo-500/10 p-1.5 rounded-full">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function BulletCard({ bullet, language }) {
    const { toggleBulletActive, hideBullet, addToNote } = useStore()
    const [showInfo, setShowInfo] = useState(false)

    const primaryText = language === 'fi' ? bullet.fi_text : bullet.en_text
    const secondaryText = language === 'fi' ? bullet.en_text : bullet.fi_text
    const description = language === 'fi' ? bullet.fi_description : bullet.en_description

    return (
        <div className={`
      flex flex-col rounded-lg border transition-all duration-200
      ${bullet.is_active
                ? 'bg-indigo-900/20 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                : 'bg-transparent border-transparent hover:bg-slate-700/30 hover:border-slate-600/30'}
    `}>
            <div className="group flex items-start justify-between p-2.5">
                <div className="flex-1 mr-2 min-w-0 pointer-events-none">
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
                        onClick={() => setShowInfo(!showInfo)}
                        active={showInfo}
                        icon={Info}
                        label={language === 'fi' ? "Lisätietoa" : "Info"}
                        extraClass="text-sky-400 hover:text-sky-300 hover:bg-sky-900/20 mr-1"
                    />

                    <ActionBtn
                        onClick={() => toggleBulletActive(bullet.id)}
                        active={bullet.is_active}
                        icon={Check}
                        label={language === 'fi' ? "Aktivoi" : "Activate"}
                    />
                    <button
                        onClick={() => hideBullet(bullet.id)}
                        title={language === 'fi' ? "Piilota" : "Hide"}
                        className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-900/20 transition-colors"
                    >
                        <EyeOff className="w-3.5 h-3.5" />
                    </button>
                    <ActionBtn
                        onClick={() => addToNote(primaryText)}
                        icon={Plus}
                        label={language === 'fi' ? "Lisää" : "Add"}
                    />
                </div>
            </div>

            {/* Tooltip / Description Area */}
            {showInfo && (
                <div className="px-3 pb-3 pt-0">
                    <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/50 text-xs text-slate-300 leading-relaxed shadow-inner">
                        <p>{description || (language === 'fi' ? "Ei kuvausta saatavilla." : "No description available.")}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

function ActionBtn({ onClick, active, icon: Icon, label, extraClass = '' }) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={`p-1.5 rounded-md transition-all ${extraClass} ${active && !extraClass
                ? 'text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30'
                : !extraClass ? 'text-slate-400 hover:text-indigo-300 hover:bg-slate-600/50' : ''
                }`}
        >
            <Icon className="w-3.5 h-3.5" />
        </button>
    )
}
