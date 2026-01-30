import React, { useState, useEffect } from 'react'
import { X, Search, Replace, Type, Palette, ChevronDown, Check, ArrowRight, ArrowLeft } from 'lucide-react'

export const FindReplaceModal = ({ isOpen, onClose, onFindHost, onReplace, onReplaceAll, recentColors, onSaveColor }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [searchScope, setSearchScope] = useState('global') // global, h1, h2, h3, paragraph
    const [replaceTerm, setReplaceTerm] = useState('')
    const [replaceColor, setReplaceColor] = useState('#000000')
    const [useReplaceColor, setUseReplaceColor] = useState(false)

    // Results navigation
    const [matchIndex, setMatchIndex] = useState(0)
    const [totalMatches, setTotalMatches] = useState(0)

    useEffect(() => {
        if (!isOpen) {
            // Reset state on close if needed
            setMatchIndex(0)
            setTotalMatches(0)
        }
    }, [isOpen])

    const handleFind = () => {
        onFindHost({ searchTerm, searchScope }, (count) => {
            setTotalMatches(count)
            setMatchIndex(count > 0 ? 1 : 0)
        })
    }

    // Auto-search when criteria changes (debounced could be better but this is fine for now)
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                handleFind()
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [searchTerm, searchScope, isOpen])

    const handleNext = () => {
        onFindHost({ searchTerm, searchScope, index: matchIndex + 1 }, (count, newIndex) => {
            setTotalMatches(count)
            setMatchIndex(newIndex)
        })
    }

    const handlePrev = () => {
        onFindHost({ searchTerm, searchScope, index: matchIndex - 1 }, (count, newIndex) => {
            setTotalMatches(count)
            setMatchIndex(newIndex)
        })
    }

    const handleReplaceClick = () => {
        onReplace({
            searchTerm,
            searchScope,
            replaceTerm,
            replaceColor: useReplaceColor ? replaceColor : null
        })
        // Refresh count after replace
        setTimeout(handleFind, 100)
    }

    const handleReplaceAllClick = () => {
        onReplaceAll({
            searchTerm,
            searchScope,
            replaceTerm,
            replaceColor: useReplaceColor ? replaceColor : null
        })
        // Refresh count
        setTimeout(handleFind, 100)
    }

    const handleColorSave = () => {
        if (replaceColor && onSaveColor) {
            onSaveColor(replaceColor)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed top-24 right-8 z-[100] w-full max-w-sm pointer-events-auto">
            {/* Modal - now a Floating Panel */}
            <div className="relative w-full bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-1 bg-gradient-to-r from-indigo-500/20 via-blue-500/20 to-purple-500/20">
                    <div className="bg-slate-900/90 p-5 rounded-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Search className="w-5 h-5 text-indigo-400" />
                                Etsi ja korvaa
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search Section */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Etsi</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Hakusana..."
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        />
                                    </div>
                                    <select
                                        value={searchScope}
                                        onChange={(e) => setSearchScope(e.target.value)}
                                        className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    >
                                        <option value="global">Kaikki</option>
                                        <option value="heading1">Otsikko 1</option>
                                        <option value="heading2">Otsikko 2</option>
                                        <option value="heading3">Otsikko 3</option>
                                        <option value="paragraph">Leipäteksti</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between mt-2 text-xs text-slate-500 px-1">
                                    <span>{totalMatches} tulosta</span>
                                    <div className="flex gap-1">
                                        <button onClick={handlePrev} disabled={totalMatches === 0} className="p-1 hover:text-white disabled:opacity-30"><ArrowLeft className="w-4 h-4" /></button>
                                        <span className="flex items-center">{matchIndex} / {totalMatches}</span>
                                        <button onClick={handleNext} disabled={totalMatches === 0} className="p-1 hover:text-white disabled:opacity-30"><ArrowRight className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>

                            {/* Replace Section */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Korvaa</label>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={replaceTerm}
                                        onChange={(e) => setReplaceTerm(e.target.value)}
                                        placeholder="Korvaava teksti..."
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    />

                                    <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="useColor"
                                                    checked={useReplaceColor}
                                                    onChange={(e) => setUseReplaceColor(e.target.checked)}
                                                    className="rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="useColor" className="text-sm text-slate-300">Vaihda väri</label>
                                            </div>
                                            {useReplaceColor && (
                                                <div className="flex items-center gap-2 flex-1 justify-end">
                                                    <div className="relative group">
                                                        <div
                                                            className="w-6 h-6 rounded border border-slate-600 shadow-sm"
                                                            style={{ backgroundColor: replaceColor }}
                                                        />
                                                        <input
                                                            type="color"
                                                            value={replaceColor}
                                                            onChange={(e) => setReplaceColor(e.target.value)}
                                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                        />
                                                    </div>
                                                    <span className="text-xs font-mono text-slate-400">{replaceColor}</span>
                                                    <button
                                                        onClick={handleColorSave}
                                                        className="ml-2 p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-indigo-400"
                                                        title="Tallenna väri"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Recent Colors Grid */}
                                        {useReplaceColor && recentColors && recentColors.length > 0 && (
                                            <div className="pt-2 border-t border-slate-700/50">
                                                <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Tallennetut värit</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {recentColors.map((color, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setReplaceColor(color)}
                                                            className="w-6 h-6 rounded-full border border-slate-600 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-slate-900"
                                                            style={{ backgroundColor: color }}
                                                            title={color}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 justify-end pt-4 border-t border-slate-800">
                            <button
                                onClick={handleReplaceClick}
                                disabled={totalMatches === 0}
                                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                Korvaa
                            </button>
                            <button
                                onClick={handleReplaceAllClick}
                                disabled={totalMatches === 0}
                                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                            >
                                Korvaa kaikki
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
