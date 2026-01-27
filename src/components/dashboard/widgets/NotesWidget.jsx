import React, { useState, useEffect } from 'react'
import { useStore } from '../../../store'
import { FileText, Clock, ChevronRight, Search, Eye, EyeOff, Monitor, Image as ImageIcon, File, X, ChevronLeft, Download, Maximize2 } from 'lucide-react'
import { supabase } from '../../../supabase'

// Helper to determine file type
const getFileType = (file) => {
    const mime = file.mimetype || ''
    const name = file.name || ''
    if (mime.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(name)) return 'image'
    if (mime === 'application/pdf' || /\.pdf$/i.test(name)) return 'pdf'
    return 'other'
}

// Icon component based on file type
const FileIcon = ({ type }) => {
    switch (type) {
        case 'image': return <ImageIcon size={14} />
        case 'pdf': return <FileText size={14} />
        default: return <File size={14} />
    }
}

export const NotesWidget = ({ onOpen }) => {
    const { notes, loadNote, language, fetchFiles, files, loadingFiles, user } = useStore()
    const [searchTerm, setSearchTerm] = useState('')
    const [isPrivate, setIsPrivate] = useState(false)
    const [activeTab, setActiveTab] = useState('plans') // 'plans' | 'files'

    // Viewing State
    const [presentingFile, setPresentingFile] = useState(null) // Fullscreen overlay
    const [inlineFile, setInlineFile] = useState(null) // Inline widget preview

    useEffect(() => {
        if (activeTab === 'files' && files.length === 0) {
            fetchFiles()
        }
    }, [activeTab])

    const filteredItems = activeTab === 'plans'
        ? notes.filter(note => (note.title || '').toLowerCase().includes(searchTerm.toLowerCase()))
        : files.filter(file => (file.name || '').toLowerCase().includes(searchTerm.toLowerCase()))

    const handleNoteClick = async (noteId) => {
        await loadNote(noteId)
        if (window.location.pathname !== '/') {
            window.location.href = '/'
        }
    }

    const handlePresentNote = (e, note) => {
        e.stopPropagation()
        if (onOpen) onOpen(note)
    }

    const getFileUrl = (file) => {
        const { data } = supabase.storage.from('project_files').getPublicUrl(file.path)
        return data.publicUrl
    }

    const handleFileInline = (file) => {
        setInlineFile({ ...file, url: getFileUrl(file), type: getFileType(file) })
    }

    const handleFilePresent = (e, file) => {
        e.stopPropagation()
        setPresentingFile({ ...file, url: getFileUrl(file), type: getFileType(file) })
    }

    // Render Inline Content
    if (inlineFile) {
        return (
            <div className="h-full flex flex-col relative animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                    <button
                        onClick={() => setInlineFile(null)}
                        className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-xs font-medium"
                    >
                        <ChevronLeft size={14} />
                        {language === 'fi' ? 'Takaisin' : 'Back'}
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => handleFilePresent(e, inlineFile)}
                            className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                            title={language === 'fi' ? 'Esitä' : 'Present'}
                        >
                            <Maximize2 size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-black/20 rounded-xl overflow-hidden flex items-center justify-center relative border border-white/5">
                    {inlineFile.type === 'image' ? (
                        <img src={inlineFile.url} alt={inlineFile.name} className="max-w-full max-h-full object-contain" />
                    ) : inlineFile.type === 'pdf' ? (
                        <iframe src={inlineFile.url} className="w-full h-full border-none" />
                    ) : (
                        <div className="text-center p-4">
                            <File size={32} className="mx-auto text-slate-600 mb-2" />
                            <p className="text-sm text-slate-400 mb-4">{inlineFile.name}</p>
                            <a
                                href={inlineFile.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-xs font-bold"
                            >
                                <Download size={12} />
                                {language === 'fi' ? 'Lataa tiedosto' : 'Download File'}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col relative">
            {/* Widget Toolbar */}
            <div className="flex flex-col gap-3 mb-4">
                {/* Tabs */}
                <div className="flex items-center bg-slate-800/50 p-1 rounded-full border border-slate-700/50">
                    <button
                        onClick={() => setActiveTab('plans')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full text-xs font-semibold transition-all ${activeTab === 'plans'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <FileText size={12} />
                        {language === 'fi' ? 'Suunnitelmat' : 'Plans'}
                    </button>
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full text-xs font-semibold transition-all ${activeTab === 'files'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <ImageIcon size={12} />
                        {language === 'fi' ? 'Tiedostot' : 'Files'}
                    </button>
                </div>

                <div className="flex items-center gap-2">
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
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1">
                {isPrivate ? (
                    <div className="flex flex-col items-center justify-center h-24 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700/30">
                        <EyeOff className="w-6 h-6 text-slate-600 mb-2" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sisältö piilotettu</span>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-24 text-slate-500">
                        <FileText className="w-6 h-6 opacity-20 mb-2" />
                        <p className="text-[10px] uppercase font-bold tracking-wider opacity-40">Ei tuloksia</p>
                    </div>
                ) : (
                    <div className="space-y-2 pb-2">
                        {activeTab === 'plans' ? (
                            // PLANS LIST
                            filteredItems.map((note) => (
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
                                            onClick={(e) => handlePresentNote(e, note)}
                                            className="p-1.5 hover:bg-indigo-500/20 text-slate-500 hover:text-indigo-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title={language === 'fi' ? 'Esitä' : 'Present'}
                                        >
                                            <Monitor size={14} />
                                        </button>
                                        <ChevronRight size={14} className="text-slate-600" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            // FILES LIST
                            filteredItems.map((file) => {
                                const type = getFileType(file)
                                return (
                                    <div
                                        key={file.id}
                                        onClick={() => handleFileInline(file)}
                                        className="group bg-slate-800/30 p-2.5 rounded-2xl border border-white/5 hover:bg-slate-700/40 cursor-pointer transition-all flex items-center justify-between"
                                    >
                                        <div className="min-w-0 flex-1 flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${type === 'image' ? 'bg-purple-500/10 text-purple-400' :
                                                    type === 'pdf' ? 'bg-red-500/10 text-red-400' :
                                                        'bg-indigo-500/10 text-indigo-400'
                                                }`}>
                                                <FileIcon type={type} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                                                    {file.name}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Clock size={10} className="text-slate-500" />
                                                    <span className="text-[9px] text-slate-500 font-mono">
                                                        {new Date(file.created_at).toLocaleDateString('fi-FI', {
                                                            day: 'numeric', month: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => handleFilePresent(e, file)}
                                                className="p-1.5 hover:bg-indigo-500/20 text-slate-500 hover:text-indigo-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title={language === 'fi' ? 'Esitä' : 'Present'}
                                            >
                                                <Monitor size={14} />
                                            </button>
                                            <ChevronRight size={14} className="text-slate-600" />
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}
            </div>

            {/* PRESENTATION OVERLAY */}
            {presentingFile && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setPresentingFile(null)}>
                    <div className="relative w-full h-full flex flex-col" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/50 to-transparent">
                            <h3 className="text-white font-bold text-lg drop-shadow-md">{presentingFile.name}</h3>
                            <button
                                onClick={() => setPresentingFile(null)}
                                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex items-center justify-center p-4 sm:p-10">
                            {presentingFile.type === 'image' ? (
                                <img
                                    src={presentingFile.url}
                                    alt={presentingFile.name}
                                    className="max-h-full max-w-full rounded-lg shadow-2xl object-contain"
                                />
                            ) : presentingFile.type === 'pdf' ? (
                                <iframe src={presentingFile.url} className="w-full h-full rounded-lg border-none shadow-2xl bg-white" />
                            ) : (
                                <div className="text-center text-white">
                                    <File size={64} className="mx-auto mb-4 opacity-50" />
                                    <p className="text-xl font-medium mb-4">{language === 'fi' ? 'Tiedostoa ei voi esikatsella' : 'Cannot preview file'}</p>
                                    <a
                                        href={presentingFile.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all"
                                    >
                                        <Download size={18} />
                                        {language === 'fi' ? 'Lataa tiedosto' : 'Download File'}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
