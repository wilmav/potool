import { useStore } from '../store'
import { Save, Download, FileJson, FileText, Languages, Loader2, Cloud, Heading1, Heading2, Heading3, Heading4, ChevronDown, Palette, Eye, PenTool, Code, Undo, Redo, Plus, History, Clock, RotateCcw, LogOut } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'

export function NoteEditor({ onLogout, isSidebarOpen }) {
    const {
        noteContent, setNoteContent,
        noteTitle, setNoteTitle,
        language,
        translateNoteContent, isTranslating,
        saveNote, isSaving, createNote,
        versions, restoreVersion, activeNoteId,
        isManualSaving
    } = useStore()

    const [showExportMenu, setShowExportMenu] = useState(false)
    const [showTranslateMenu, setShowTranslateMenu] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const [showHeaderMenu, setShowHeaderMenu] = useState(false)
    const [showColorMenu, setShowColorMenu] = useState(false)

    // Toggle between Visual (Tiptap) and Source (HTML Textarea)
    const [isSourceMode, setIsSourceMode] = useState(false)

    const [recentColors, setRecentColors] = useState(['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6'])
    const [customColor, setCustomColor] = useState('#ffffff')

    const translateMenuRef = useRef(null)
    const exportMenuRef = useRef(null)
    const historyMenuRef = useRef(null)
    const headerMenuRef = useRef(null)
    const colorMenuRef = useRef(null)

    // Tiptap Editor Initialization
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color
        ],
        content: noteContent, // Initial content
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[calc(100vh-300px)] text-slate-300',
            },
        },
        onUpdate: ({ editor }) => {
            // Update store logic
            // Note: We avoid setting noteContent on every keystroke to store directly if it causes re-renders loop
            // But here we rely on the debounce in useEffect below or update store immediately
            // Since useStore is external, updating it might trigger re-render of this component
            // We'll update the store, and handle the "external update" in useEffect carefully.
            setNoteContent(editor.getHTML())
        },
    })

    // Sync external updates (e.g. from Version History or Database Load) to Editor
    useEffect(() => {
        if (editor && noteContent !== editor.getHTML()) {
            // Only update if content is meaningfully different to avoid cursor jumping
            // or if the editor is empty (initial load)

            // A simple string check often fails due to normalization (e.g. <p></p> vs empty)
            // But for restoration features, we need this.

            // Allow focus check: if user is typing, avoid overwriting unless it's a remote change
            // Ideally we'd track "last updated by" but for now:

            // If the content is vastly different (restoring version), update it.
            editor.commands.setContent(noteContent)
        }
    }, [noteContent, editor])

    useEffect(() => {
        function handleClickOutside(event) {
            if (translateMenuRef.current && !translateMenuRef.current.contains(event.target)) {
                setShowTranslateMenu(false)
            }
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setShowExportMenu(false)
            }
            if (historyMenuRef.current && !historyMenuRef.current.contains(event.target)) {
                setShowHistory(false)
            }
            if (headerMenuRef.current && !headerMenuRef.current.contains(event.target)) {
                setShowHeaderMenu(false)
            }
            if (colorMenuRef.current && !colorMenuRef.current.contains(event.target)) {
                setShowColorMenu(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

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

    const toggleHeader = (level) => {
        if (!editor) return
        editor.chain().focus().toggleHeading({ level }).run()
        setShowHeaderMenu(false)
    }

    const applyColor = (color) => {
        if (!editor) return
        editor.chain().focus().setColor(color).run()

        if (!recentColors.includes(color)) {
            setRecentColors(prev => [color, ...prev].slice(0, 10))
        }
        setShowColorMenu(false)
    }

    const handleExport = (type) => {
        if (!editor && !isSourceMode) return

        // For processing, use the raw HTML content (noteContent)
        // We need a way to convert HTML to text/lines for PDF
        // Since we already have a parser in previous version, we need to adapt it 
        // OR simply rely on a basic strip tags for now or improve it.
        // For this iteration, we keep the previous logic but parse HTML tags instead of markdown.

        const dateStr = new Date().toISOString().split('T')[0]
        const filename = `${noteTitle.replace(/[^a-z0-9]/gi, '_')}_${dateStr}`

        if (type === 'pdf') {
            const doc = new jsPDF()
            let cursorY = 20
            const marginLeft = 20

            // Title
            doc.setFontSize(24)
            doc.setFont("helvetica", "bold")
            doc.text(noteTitle, marginLeft, cursorY)
            cursorY += 15

            // Simple HTML to Text parser for PDF
            // This is a simplified approach. Better would be html2canvas or pdfmake.
            // We iterate over the JSON structure of Tiptap for best results? 
            // editor.getJSON() gives us structured data!

            if (editor) {
                const json = editor.getJSON()

                json.content?.forEach(node => {
                    // Check for page break
                    if (cursorY > 280) {
                        doc.addPage()
                        cursorY = 20
                    }

                    if (node.type === 'heading') {
                        const level = node.attrs?.level || 1
                        const size = level === 1 ? 20 : level === 2 ? 16 : 14
                        doc.setFontSize(size)
                        doc.setFont("helvetica", "bold")
                        doc.setTextColor(0, 0, 0) // Default black for headers

                        const text = node.content?.map(c => c.text).join('') || ''
                        doc.text(text, marginLeft, cursorY)
                        cursorY += (size / 2) + 4
                    } else if (node.type === 'paragraph') {
                        doc.setFontSize(11)
                        doc.setFont("helvetica", "normal")

                        // Handle colored spans in Tiptap JSON
                        // Content is array of { type: 'text', text: 'foo', marks: [{ type: 'textStyle', attrs: { color: '...' }}] }

                        let currentX = marginLeft

                        // If empty paragraph, add spacing
                        if (!node.content) {
                            cursorY += 5
                            return
                        }

                        node.content.forEach(span => {
                            const text = span.text
                            let color = '#000000'

                            // Check marks
                            if (span.marks) {
                                span.marks.forEach(m => {
                                    if (m.type === 'textStyle' && m.attrs?.color) {
                                        color = m.attrs.color
                                    }
                                })
                            }

                            doc.setTextColor(color)

                            // Naive wrapping logic for mixed colors is hard
                            // For this MVP, we just write it.
                            doc.text(text, currentX, cursorY)
                            currentX += doc.getTextWidth(text)
                        })

                        cursorY += 7
                    }
                })
            }

            doc.save(`${filename}.pdf`)
        } else if (type === 'md') {
            // Downloading HTML as content
            const blob = new Blob([noteContent], { type: 'text/html' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = (`${filename}.html`) // Changed to .html
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
        }
        setShowExportMenu(false)
    }

    return (
        <div className="flex flex-col h-full relative z-10">
            {/* Toolbar */}
            <div className={`h-20 px-8 border-b border-slate-800/50 flex items-center justify-between shrink-0 bg-slate-950/50 backdrop-blur-sm transition-all duration-300 ${!isSidebarOpen ? 'pl-48' : ''}`}>
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

                <div className="flex items-center gap-1.5 ">

                    {/* Formatting Toolbar (Always visible if editor exists, or maybe just Visual Mode? User said "first") */}
                    {/* Based on user request order: TextSize, Color... */}
                    {!isSourceMode && editor && (
                        <>
                            {/* Header Dropdown */}
                            <div className="relative" ref={headerMenuRef}>
                                <button
                                    onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                                    className="flex items-center gap-1 p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                                    title={language === 'fi' ? "Otsikkotyylit" : "Heading Styles"}
                                >
                                    <Heading1 className="w-5 h-5" />
                                    <ChevronDown className="w-3 h-3" />
                                </button>
                                {showHeaderMenu && (
                                    <div className="absolute top-full left-0 mt-2 w-40 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 flex flex-col p-1">
                                        <button onClick={() => toggleHeader(1)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded text-left">
                                            <Heading1 className="w-4 h-4" /> Heading 1
                                        </button>
                                        <button onClick={() => toggleHeader(2)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded text-left">
                                            <Heading2 className="w-4 h-4" /> Heading 2
                                        </button>
                                        <button onClick={() => toggleHeader(3)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded text-left">
                                            <Heading3 className="w-4 h-4" /> Heading 3
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Color Picker Dropdown */}
                            <div className="relative" ref={colorMenuRef}>
                                <button
                                    onClick={() => setShowColorMenu(!showColorMenu)}
                                    className="flex items-center gap-1 p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                                    title={language === 'fi' ? "Tekstin väri" : "Text Color"}
                                >
                                    <Palette className="w-5 h-5" />
                                    <ChevronDown className="w-3 h-3" />
                                </button>
                                {showColorMenu && (
                                    <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 p-3">
                                        <div className="text-xs font-semibold text-slate-500 mb-2 uppercase">{language === 'fi' ? 'Viimeisimmät' : 'Recent & Favorites'}</div>
                                        <div className="grid grid-cols-5 gap-2 mb-3">
                                            {recentColors.map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => applyColor(c)}
                                                    className="w-8 h-8 rounded-full border border-slate-700 hover:scale-110 transition-transform"
                                                    style={{ backgroundColor: c }}
                                                    title={c}
                                                />
                                            ))}
                                        </div>
                                        <div className="border-t border-slate-800 pt-2">
                                            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-white">
                                                <div className="relative">
                                                    <input
                                                        type="color"
                                                        value={customColor}
                                                        onChange={(e) => setCustomColor(e.target.value)}
                                                        className="w-8 h-8 rounded cursor-pointer opacity-0 absolute inset-0"
                                                    />
                                                    <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center pointer-events-none">
                                                        <PenTool className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                                <span>{language === 'fi' ? 'Valitse oma...' : 'Pick Custom...'}</span>
                                                <button
                                                    onClick={() => applyColor(customColor)}
                                                    className="ml-auto text-xs bg-slate-800 px-2 py-1 rounded hover:bg-slate-700"
                                                >
                                                    {language === 'fi' ? 'Valitse' : 'Apply'}
                                                </button>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="w-px h-6 bg-slate-800 mx-1"></div>
                        </>
                    )}

                    {/* Translate (Icon Only) */}
                    <div className="relative" ref={translateMenuRef}>
                        <button
                            onClick={() => setShowTranslateMenu(!showTranslateMenu)}
                            disabled={isTranslating}
                            className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-all disabled:opacity-50"
                            title={language === 'fi' ? 'Käännä' : 'Translate'}
                        >
                            {isTranslating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Languages className="w-5 h-5" />}
                        </button>
                        {showTranslateMenu && !isTranslating && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                                <button onClick={() => handleTranslate('en-GB')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                                    <span className="text-xs font-bold bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400">EN</span> English
                                </button>
                                <button onClick={() => handleTranslate('fi-FI')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                                    <span className="text-xs font-bold bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400">FI</span> Suomi
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Export (Icon Only) */}
                    <div className="relative" ref={exportMenuRef}>
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-all"
                            title={language === 'fi' ? "Vie tiedostona" : "Export"}
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        {showExportMenu && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                                <button onClick={() => handleExport('pdf')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                                    <FileText className="w-4 h-4 text-rose-400" /> PDF Document
                                </button>
                                <button onClick={() => handleExport('md')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                                    <Code className="w-4 h-4 text-emerald-400" /> HTML Code
                                </button>
                            </div>
                        )}
                    </div>

                    {/* HTML/Source Toggle */}
                    <button
                        onClick={() => {
                            if (isSourceMode && editor) editor.commands.setContent(noteContent)
                            setIsSourceMode(!isSourceMode)
                        }}
                        className={`p-2 rounded-lg transition-colors ${isSourceMode ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'}`}
                        title={language === 'fi' ? "Lähdekoodi / Visuaalinen" : "Source Code / Visual"}
                    >
                        {isSourceMode ? <Eye className="w-5 h-5" /> : <Code className="w-5 h-5" />}
                    </button>

                    <div className="w-px h-6 bg-slate-800 mx-1"></div>

                    {/* Plus (New Plan) - Always Colored */}
                    <button
                        onClick={() => createNote()}
                        className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                        title={language === 'fi' ? 'Uusi suunnitelma' : 'New Plan'}
                    >
                        <Plus className="w-5 h-5" />
                    </button>

                    {/* Save Button - Grouped at end */}
                    <button
                        onClick={() => saveNote(true)}
                        disabled={isSaving}
                        className="p-2 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-950/30 rounded-lg transition-all disabled:opacity-50 ml-1"
                        title={language === 'fi' ? "Tallenna" : "Save"}
                    >
                        {isManualSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    </button>

                    {/* Logout */}
                    <button
                        onClick={onLogout}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-all ml-1"
                        title={language === 'fi' ? 'Kirjaudu ulos' : 'Log out'}
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto w-full py-12 px-8 min-h-full">
                    {isSourceMode ? (
                        <div className="relative font-mono">
                            <div className="absolute -top-6 right-0 text-xs text-slate-500 font-sans">{language === 'fi' ? 'HTML-lähdekoodi' : 'HTML Source Mode'}</div>
                            <textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                className="w-full h-[calc(100vh-200px)] resize-none border px-4 py-4 rounded-lg border-slate-700 bg-slate-900/50 text-slate-300 text-sm leading-relaxed focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                                spellCheck={false}
                            />
                        </div>
                    ) : (
                        <EditorContent editor={editor} />
                    )}
                </div>
            </div>
        </div>
    )
}
