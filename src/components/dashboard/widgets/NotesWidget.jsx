import React, { useState } from 'react'
import { useStore } from '../../../store'
import { FileText, Clock, ChevronRight, Search, Eye, EyeOff, Monitor } from 'lucide-react'

export const NotesWidget = ({ onOpen }) => {
    const { notes, loadNote, language } = useStore()
    const [searchTerm, setSearchTerm] = useState('')
    const [isPrivate, setIsPrivate] = useState(false)

    // Filter notes based on search
    const filteredNotes = notes.filter(note =>
        (note.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleNoteClick = async (noteId) => {
        await loadNote(noteId)
        if (window.location.pathname !== '/') {
            window.location.href = '/'
        }
    }

    const handlePresent = (e, note) => {
        e.stopPropagation()
        if (onOpen) onOpen(note)
    }

    return (
        <div className="h-full flex flex-col">
            {/* Widget Toolbar */}
            <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-hover:text-slate-400 transition-colors" />
                    <input
                        type="text"
                        placeholder={language === 'fi' ? "Etsi..." : "Search..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800/40 border border-slate-700/50 rounded-full py-1.5 pl-9 pr-4 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:bg-slate-800/60 transition-all"
                    />
                </div>
                <button
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={`p-2 rounded-full transition-all ${isPrivate ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800/40 text-slate-400 hover:text-white'}`}
                    title={language === 'fi' ? (isPrivate ? "Näytä sisältö" : "Piilota (Yksityinen)") : (isPrivate ? "Show content" : "Hide (Private)")}
                >
                    {isPrivate ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1">
                {isPrivate ? (
                    <div className="flex flex-col items-center justify-center h-24 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700/30">
                        <EyeOff className="w-6 h-6 text-slate-600 mb-2" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sisältö piilotettu</span>
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-24 text-slate-500">
                        <FileText className="w-6 h-6 opacity-20 mb-2" />
                        <p className="text-[10px] uppercase font-bold tracking-wider opacity-40">Ei tuloksia</p>
                    </div>
                ) : (
                    <div className="space-y-2 pb-2">
                        {filteredNotes.map((note) => (
                            <div
                                key={note.id}
                                onClick={() => handleNoteClick(note.id)}
                                className="group bg-slate-800/30 p-2.5 rounded-2xl border border-white/5 hover:bg-slate-700/40 cursor-pointer transition-all flex items-center justify-between"
                            >
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                                        {note.title || (language === 'fi' ? 'Nimetön suunnitelma' : 'Untitled Plan')}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Clock size={10} className="text-slate-500" />
                                        <span className="text-[9px] text-slate-500 font-mono">
                                            {new Date(note.updated_at || note.created_at).toLocaleDateString('fi-FI', {
                                                day: 'numeric', month: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => handlePresent(e, note)}
                                        className="p-1.5 hover:bg-indigo-500/20 text-slate-500 hover:text-indigo-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title={language === 'fi' ? 'Esitä' : 'Present'}
                                    >
                                        <Monitor size={14} />
                                    </button>
                                    <ChevronRight size={14} className="text-slate-600" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
