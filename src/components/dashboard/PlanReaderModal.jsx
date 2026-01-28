import React, { useEffect, useState } from 'react'
import { X, MessageSquare, Send, CheckCircle2, Circle } from 'lucide-react'
import { useStore } from '../../store'
// We reuse the TipTap editor logic but simpler, or just render HTML for read-only if we want to be lightweight.
// However, to keep styling consistent, let's use a read-only TipTap or just dangerouslySetInnerHTML for now 
// since we want to move fast. Tiptap read-only is safer/better long term but HTML render is quicker to implement right now.
// Let's use a clear HTML render with prose classes.

export const PlanReaderModal = ({ note, onClose }) => {
    const { comments, fetchComments, addComment, resolveComment, user, language } = useStore()
    const [newComment, setNewComment] = useState('')
    const [activeTab, setActiveTab] = useState('read') // 'read' | 'comments'

    // Fetch comments on open
    useEffect(() => {
        if (note?.id) {
            fetchComments(note.id)
        }
    }, [note?.id])

    const noteComments = comments[note.id] || []

    const handleSendComment = async () => {
        if (!newComment.trim()) return
        await addComment(note.id, newComment)
        setNewComment('')
    }

    if (!note) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[85vh] shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Main Content (Reader) */}
                <div className={`flex-1 flex flex-col min-w-0 transition-all ${activeTab === 'comments' ? 'hidden sm:flex' : 'flex'}`}>
                    <div className="p-6 border-b border-slate-800 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">{note.title}</h2>
                            <div className="text-sm text-slate-400">
                                Last updated {(() => {
                                    const date = new Date(note.updated_at || note.created_at)
                                    return `${date.toLocaleDateString(language === 'fi' ? 'fi-FI' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                                })()}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab(activeTab === 'comments' ? 'read' : 'comments')}
                                className="sm:hidden p-2 bg-slate-800 rounded-lg text-slate-300"
                            >
                                <MessageSquare size={20} />
                            </button>
                            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-950/30">
                        <div
                            className="prose prose-invert max-w-3xl mx-auto"
                            dangerouslySetInnerHTML={{ __html: note.content }}
                        />
                    </div>
                </div>

                {/* Comments Sidebar */}
                <div className={`w-full sm:w-96 border-l border-slate-800 bg-slate-900 flex flex-col ${activeTab === 'read' ? 'hidden sm:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-slate-200 flex items-center gap-2">
                            <MessageSquare size={18} />
                            Comments ({noteComments.length})
                        </h3>
                        {/* Mobile close sidebar */}
                        <button onClick={() => setActiveTab('read')} className="sm:hidden p-1">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {noteComments.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 text-sm">
                                <p>No comments yet.</p>
                                <p className="text-xs mt-1">Start the discussion!</p>
                            </div>
                        ) : (
                            noteComments.map(comment => (
                                <div key={comment.id} className={`p-3 rounded-xl border ${comment.is_resolved ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-slate-800/50 border-slate-700'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                                                {/* Fallback initials if no profile/name, assuming fetchComments joins profiles */}
                                                {(comment.profiles?.full_name || 'U').charAt(0)}
                                            </div>
                                            <span className="text-xs font-bold text-slate-300">
                                                {comment.profiles?.full_name || 'User'}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-500">
                                            {(() => {
                                                const date = new Date(comment.created_at)
                                                return `${date.toLocaleDateString(language === 'fi' ? 'fi-FI' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                                            })()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed mb-2">
                                        {comment.content}
                                    </p>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => resolveComment(comment.id, note.id)}
                                            className={`flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full transition-colors ${comment.is_resolved ? 'text-emerald-500 bg-emerald-500/10 cursor-default' : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-700'}`}
                                            disabled={comment.is_resolved}
                                        >
                                            {comment.is_resolved ? (
                                                <><CheckCircle2 size={12} /> Resolved</>
                                            ) : (
                                                <><Circle size={12} /> Resolve</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-800 bg-slate-900">
                        <div className="relative">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 pr-10 text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none h-20"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSendComment()
                                    }
                                }}
                            />
                            <button
                                onClick={handleSendComment}
                                disabled={!newComment.trim()}
                                className="absolute bottom-2 right-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-lg transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
