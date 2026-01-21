import { useState } from 'react'
import { useStore } from '../store'
import { Search, ChevronDown, ChevronRight, Check, EyeOff, Plus } from 'lucide-react'

export function Sidebar() {
    const { language, bullets, loadingBullets, toggleBulletActive, hideBullet, addToNote } = useStore()
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedThemes, setExpandedThemes] = useState(new Set(['Discovery', 'Riskit']))

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
        <div className="p-4 space-y-6">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder={language === 'fi' ? "Hae avainsanoja..." : "Search keywords..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
            </div>

            {/* Accordions */}
            <div className="space-y-4">
                {loadingBullets ? (
                    <div className="flex justify-center py-8 text-gray-400">
                        <span className="text-sm">Loading...</span>
                    </div>
                ) : (
                    Object.entries(groupedBullets).map(([theme, items]) => (
                        <div key={theme} className="bg-white">
                            <button
                                onClick={() => toggleTheme(theme)}
                                className="w-full flex items-center justify-between py-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 border-b border-gray-100"
                            >
                                <span>{theme}</span>
                                {expandedThemes.has(theme) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>

                            {expandedThemes.has(theme) && (
                                <div className="mt-2 space-y-2">
                                    {items.sort((a, b) => {
                                        // Sort based on current language
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
      group flex items-start justify-between p-3 rounded-lg border transition-all
      ${bullet.is_active ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'}
    `}>
            <div className="flex-1 mr-3">
                <div className="flex items-baseline gap-2">
                    <span className={`font-medium text-sm ${bullet.is_active ? 'text-indigo-900' : 'text-gray-800'}`}>
                        {primaryText}
                    </span>
                    <span className="text-xs text-gray-400 font-normal">
                        – {secondaryText}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => toggleBulletActive(bullet.id)}
                    title={language === 'fi' ? "Ota käyttöön" : "Mark active"}
                    className={`p-1.5 rounded-md hover:bg-white ${bullet.is_active ? 'text-indigo-600 bg-indigo-100' : 'text-gray-400 hover:text-green-600'}`}
                >
                    <Check className="w-4 h-4" />
                </button>
                <button
                    onClick={() => addToNote(primaryText)}
                    title={language === 'fi' ? "Lisää muistioon" : "Add to note"}
                    className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-gray-50"
                >
                    <Plus className="w-4 h-4" />
                </button>
                <button
                    onClick={() => hideBullet(bullet.id)}
                    title={language === 'fi' ? "Piilota" : "Hide"}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-50"
                >
                    <EyeOff className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
