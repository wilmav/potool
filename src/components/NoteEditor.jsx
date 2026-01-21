import { useStore } from '../store'
import { Save, Download, FileJson, FileText, Languages, Loader2, Cloud, Check, Plus } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { useState, useEffect } from 'react'

export function NoteEditor() {
    const {
        noteContent, setNoteContent,
        noteTitle, setNoteTitle,
        language,
        translateNoteContent, isTranslating,
        saveNote, isSaving, createNote
    } = useStore()

    const [showExportMenu, setShowExportMenu] = useState(false)
    const [showTranslateMenu, setShowTranslateMenu] = useState(false)

    // Debounced Auto-Save
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (noteContent) {
                saveNote()
            }
        }, 2000) // 2 seconds debounce

        return () => clearTimeout(timeoutId)
    }, [noteContent, noteTitle])

    const handleTranslate = async (targetLang) => {
        setShowTranslateMenu(false)
        await translateNoteContent(targetLang)
    }

    const handleExport = (type) => {
        const dateStr = new Date().toISOString().split('T')[0]
        const filename = `${noteTitle.replace(/[^a-z0-9]/gi, '_')}_${dateStr}`

        if (type === 'pdf') {
            const doc = new jsPDF()

            // Add title
            doc.setFontSize(20)
            doc.text(noteTitle, 20, 20)

            // Add content
            doc.setFontSize(12)
            const splitText = doc.splitTextToSize(noteContent, 170)
            doc.text(splitText, 20, 40)

            doc.save(`${filename}.pdf`)
        } else if (type === 'md') {
            const blob = new Blob([noteContent], { type: 'text/markdown' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = (`${filename}.md`)
            a.click()
            URL.revokeObjectURL(url)
        }
        setShowExportMenu(false)
    }

    return (
        <div className="flex flex-col h-full relative z-10">
            {/* Toolbar */}
            <div className="h-20 px-8 border-b border-slate-800/50 flex items-center justify-between shrink-0 bg-slate-950/50 backdrop-blur-sm">
                <div className="flex-1 mr-8">
                    <input
                        type="text"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        placeholder="Untitled Plan"
                        className="text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 placeholder-slate-600 w-full text-slate-100"
                    />
                    <div className="flex items-center gap-2 mt-1">
                        {isSaving ? (
                            <>
                                <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
                                <p className="text-xs font-medium text-indigo-400">
                                    {language === 'fi' ? 'Tallennetaan...' : 'Saving...'}
                                </p>
                            </>
                        ) : (
                            <>
                                <Cloud className="w-3 h-3 text-emerald-500" />
                                <p className="text-xs font-medium text-slate-500">
                                    {language === 'fi' ? 'Tallennettu pilveen' : 'Saved to cloud'}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Translate Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowTranslateMenu(!showTranslateMenu)}
                            disabled={isTranslating || !noteContent}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isTranslating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Languages className="w-4 h-4" />
                            )}
                            {language === 'fi' ? 'Käännä' : 'Translate'}
                        </button>

                        {showTranslateMenu && !isTranslating && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                                <button
                                    onClick={() => handleTranslate('en-GB')}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                >
                                    <span className="text-xs font-bold bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400">EN</span>
                                    English
                                </button>
                                <button
                                    onClick={() => handleTranslate('fi-FI')}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                >
                                    <span className="text-xs font-bold bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400">FI</span>
                                    Suomi
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Export Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-slate-700"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>

                        {showExportMenu && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                                <button
                                    onClick={() => handleExport('pdf')}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                >
                                    <FileText className="w-4 h-4 text-rose-400" />
                                    PDF Document
                                </button>
                                <button
                                    onClick={() => handleExport('md')}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                >
                                    <FileJson className="w-4 h-4 text-emerald-400" />
                                    Markdown
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="w-px h-6 bg-slate-800 mx-1"></div>

                    <button
                        onClick={() => createNote()}
                        className="flex items-center justify-center p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                        title={language === 'fi' ? 'Uusi suunnitelma' : 'New Plan'}
                    >
                        <Plus className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => saveNote()}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto w-full py-12 px-8 min-h-full">
                    <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder={language === 'fi'
                            ? "Kirjoita suunnitelmasi tähän... \n\nVoit lisätä otsikoita ja aiheita vasemman paneelin kirjastosta painamalla + painiketta."
                            : "Write your plan here... \n\nAdd headers and topics from the library on the left by clicking the + button."}
                        className="w-full h-[calc(100vh-200px)] resize-none border-none focus:ring-0 text-slate-300 text-lg leading-relaxed placeholder-slate-700 bg-transparent outline-none font-medium"
                        spellCheck={false}
                    />
                </div>
            </div>
        </div>
    )
}
