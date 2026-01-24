import React from 'react'
import { useStore } from '../../../store'
import { FileText, Clock, ChevronRight } from 'lucide-react'

export const NotesWidget = () => {
    const { notes, loadNote, activeNoteId } = useStore()

    // Get top 5 most recent notes
    const recentNotes = notes.slice(0, 5)

    const handleNoteClick = async (noteId) => {
        // Set the active note in store
        await loadNote(noteId)
        // If we are on /dashboard, we want to go back to the main view
        // Since this is a single page app where /dashboard is a separate route content in App.jsx,
        // we might just need to change browser URL or state.
        // Assuming hitting root '/' renders the editor view.
        if (window.location.pathname !== '/') {
            window.history.pushState({}, '', '/')
            // Force a popstate event or similar if we are using a router that listens to it, 
            // but since we don't have a visible router hook here, hard refresh might be safest for "Demo" 
            // or just dispatch event. 
            // Actually, looking at App.jsx (from memory/previous steps), it uses a simple state or URL check.
            // Let's use a hard nav to be safe for now, or if we had 'navigate' function.
            window.location.href = '/'
        }
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
