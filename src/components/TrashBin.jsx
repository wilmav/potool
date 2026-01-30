import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../store'
import { Trash2, RotateCcw, X, AlertTriangle, CheckSquare } from 'lucide-react'

export function TrashBin({ onClose }) {
    const { trashNotes, fetchTrash, loadingTrash, restoreNotes, permanentDeleteNotes, language } = useStore()
    const [selected, setSelected] = useState(new Set())
    const [showConfirm, setShowConfirm] = useState(false)

    useEffect(() => {
        fetchTrash()
    }, [])

    const toggleSelect = (id, type) => {
        const key = `${type}:${id}`
        const newSet = new Set(selected)
        if (newSet.has(key)) newSet.delete(key)
        else newSet.add(key)
        setSelected(newSet)
    }

    const getSelectedItems = () => {
        return Array.from(selected).map(key => {
            const [type, id] = key.split(':')
            return { type, id }
        })
    }

    const handleRestore = async () => {
        await restoreNotes(getSelectedItems())
        setSelected(new Set())
    }

    const handleDeleteForever = async () => {
        await permanentDeleteNotes(getSelectedItems())
        setSelected(new Set())
        setShowConfirm(false)
    }

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                            <Trash2 className="w-6 h-6 text-rose-500" />
                            {language === 'fi' ? 'Roskakori' : 'Trash Bin'}
                        </h2>
                        {trashNotes.length > 0 && (
                            <div className="flex items-center gap-2 pl-6 border-l border-slate-800">
                                <div
                                    onClick={() => {
                                        if (selected.size === trashNotes.length) {
                                            setSelected(new Set())
                                        } else {
                                            const newSet = new Set()
                                            trashNotes.forEach(item => newSet.add(`${item.type}:${item.id}`))
                                            setSelected(newSet)
                                        }
                                    }}
                                    className="flex items-center gap-2 cursor-pointer group"
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selected.size === trashNotes.length && trashNotes.length > 0
                                        ? 'bg-indigo-500 border-indigo-500'
                                        : 'border-slate-600 group-hover:border-slate-500'
                                        }`}>
                                        {selected.size === trashNotes.length && trashNotes.length > 0 && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <span className="text-sm text-slate-400 group-hover:text-slate-300 font-medium">
                                        {language === 'fi' ? 'Valitse kaikki' : 'Select All'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {loadingTrash ? (
                        <div className="text-center py-8 text-slate-500 animate-pulse">
                            {language === 'fi' ? 'Ladataan...' : 'Loading...'}
                        </div>
                    ) : trashNotes.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            {language === 'fi' ? 'Roskakori on tyhjä.' : 'Trash is empty.'}
                        </div>
                    ) : (
                        trashNotes.map(item => {
                            const isSelected = selected.has(`${item.type}:${item.id}`)
                            const deletedDate = new Date(item.deleted_at)
                            const daysLeft = 30 - Math.floor((new Date() - deletedDate) / (1000 * 60 * 60 * 24))

                            return (
                                <div
                                    key={`${item.type}:${item.id}`}
                                    onClick={() => toggleSelect(item.id, item.type)}
                                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${isSelected
                                        ? 'bg-rose-900/20 border-rose-500/50'
                                        : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-rose-500 border-rose-500' : 'border-slate-600'
                                        }`}>
                                        {isSelected && <X className="w-3.5 h-3.5 text-white" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.type === 'note'
                                                ? 'bg-indigo-500/20 text-indigo-300'
                                                : 'bg-emerald-500/20 text-emerald-300'
                                                }`}>
                                                {item.type === 'note'
                                                    ? (language === 'fi' ? 'Suunnitelma' : 'Plan')
                                                    : (language === 'fi' ? 'Versio' : 'Version')}
                                            </span>
                                            <h3 className="font-semibold text-slate-200 break-all leading-tight">
                                                {item.title || (language === 'fi' ? 'Nimetön' : 'Untitled')}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                                            <span>
                                                {language === 'fi' ? 'Poistettu:' : 'Deleted:'} {deletedDate.toLocaleDateString()}
                                            </span>
                                            <span className={daysLeft < 5 ? 'text-rose-400 font-bold' : ''}>
                                                {daysLeft} {language === 'fi' ? 'päivää jäljellä' : 'days left'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-4 bg-slate-900/50">
                    <div className="text-xs text-slate-500 font-medium">
                        {selected.size} {language === 'fi' ? 'valittu' : 'selected'}
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={handleRestore}
                            disabled={selected.size === 0}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
                        >
                            <RotateCcw className="w-4 h-4" />
                            {language === 'fi' ? 'Palauta' : 'Restore'}
                        </button>
                        <button
                            onClick={() => setShowConfirm(true)}
                            disabled={selected.size === 0}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm shadow-lg shadow-rose-500/20"
                        >
                            <Trash2 className="w-4 h-4" />
                            {language === 'fi' ? 'Poista pysyvästi' : 'Delete Forever'}
                        </button>
                    </div>
                </div>

                {/* Confirm Dialog */}
                {showConfirm && (
                    <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur flex items-center justify-center p-6 rounded-2xl">
                        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/20 mb-4 mx-auto">
                                <AlertTriangle className="w-6 h-6 text-rose-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white text-center mb-2">
                                {language === 'fi' ? 'Oletko varma?' : 'Are you sure?'}
                            </h3>
                            <p className="text-sm text-slate-400 text-center mb-6">
                                {language === 'fi'
                                    ? 'Tätä toimintoa ei voi kumota. Valitut kohteet poistetaan pysyvästi.'
                                    : 'This action cannot be undone. Selected items will be permanently deleted.'}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm transition-colors"
                                >
                                    {language === 'fi' ? 'Peruuta' : 'Cancel'}
                                </button>
                                <button
                                    onClick={handleDeleteForever}
                                    className="flex-1 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-500/20 transition-colors"
                                >
                                    {language === 'fi' ? 'Poista' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}
