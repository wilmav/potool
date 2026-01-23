import React from 'react'
import { useStore } from '../../../store'
import { FileText, Clock, ChevronRight } from 'lucide-react'

export const NotesWidget = () => {
    const { notes, loadNote, activeNoteId } = useStore()

    // Get top 5 most recent notes
    const recentNotes = notes.slice(0, 5)

    const handleNoteClick = async (noteId) => {
        if (noteId !== activeNoteId) {
            await loadNote(noteId)
        }
        // Navigation is handled by App state (NoteEditor shows activeNote)
        // Ideally we should redirect or switch view if we were in a "Dashboard View" separate from Editor
        // For now, let's assume the user wants to go to the editor.
        // We might need a way to signal App to switch view?
        // But App.jsx renders DashboardPage if URL is /dashboard.
        // So we need to change URL to / (root) to see editor.
        window.location.href = '/'
    }

    if (recentNotes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <FileText className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-sm">Ei suunnitelmia vielä.</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {recentNotes.map((note) => (
                <div
                    key={note.id}
                    onClick={() => handleNoteClick(note.id)}
                    className="group bg-slate-800/40 p-3 rounded-xl border border-white/5 hover:bg-slate-700/60 cursor-pointer transition-all flex items-center justify-between"
                >
                    <div className="min-w-0">
                        <h4 className="font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                            {note.title || 'Nimetön suunnitelma'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                            <Clock size={12} className="text-slate-500" />
                            <span className="text-xs text-slate-500">
                                {new Date(note.updated_at || note.created_at).toLocaleDateString('fi-FI', {
                                    day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </div>
            ))}
        </div>
    )
}
