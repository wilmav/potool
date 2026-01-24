import React from 'react'
import { FileText, MessageSquare, ExternalLink } from 'lucide-react'
import { useStore } from '../../../store'

export const PlanWidget = ({ id, data, onOpen }) => {
    // data.config should contain { noteId: '...' }
    const { notes } = useStore()
    const noteId = data.config?.noteId
    const note = notes.find(n => n.id === noteId)

    if (!note) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <FileText className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-xs">Plan not found ({noteId})</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full justify-between group">
            <div>
                <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <FileText size={20} />
                    </div>
                    {/* Status badge placeholder - could be real later */}
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                        DRAFT
                    </span>
                </div>
                <h3 className="font-bold text-slate-200 leading-tight line-clamp-2 mb-1 group-hover:text-white transition-colors">
                    {note.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-3">
                    {note.summary || "No summary available."}
                </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <MessageSquare size={12} />
                    <span>0</span>
                </div>

                <button
                    onClick={() => onOpen(note)}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-white transition-colors"
                >
                    Open <ExternalLink size={12} />
                </button>
            </div>
        </div>
    )
}
