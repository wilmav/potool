import { useStore } from '../store'
import { Save, Download, FileJson, FileText, Languages, Loader2, Cloud, Heading1, Heading2, Heading3, Heading4, ChevronDown, Palette, Eye, PenTool, Code, Undo, Redo, Plus, History, Clock, RotateCcw, LogOut, ChevronRight, Layout, Pilcrow, Indent, Outdent, List, ListOrdered, X, Disc } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'

export function NoteEditor({ onLogout, isSidebarOpen, onOpenSidebar }) {
    const {
        noteContent, setNoteContent,
        noteTitle, setNoteTitle,
        language,
        translateNoteContent, isTranslating,
        saveNote, isSaving, createNote,
        isManualSaving,
        recentColors, addRecentColor, removeRecentColor // Use global state
    } = useStore()

    const [showExportMenu, setShowExportMenu] = useState(false)
    const [showTranslateMenu, setShowTranslateMenu] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const [showHeaderMenu, setShowHeaderMenu] = useState(false)
    const [showListMenu, setShowListMenu] = useState(false) // New List Menu
    const [showColorMenu, setShowColorMenu] = useState(false)

    // Toggle between Visual (Tiptap) and Source (HTML Textarea)
    const [isSourceMode, setIsSourceMode] = useState(false)

    // Removed local recentColors state
    const [customColor, setCustomColor] = useState('#ffffff')

    // Deletion confirmation state
    const [colorToDelete, setColorToDelete] = useState(null)

    const translateMenuRef = useRef(null)
    const exportMenuRef = useRef(null)
    const historyMenuRef = useRef(null)
    const headerMenuRef = useRef(null)
    const listMenuRef = useRef(null) // New Ref
    const colorMenuRef = useRef(null)

    // Tiptap Editor Initialization
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                    HTMLAttributes: {
                        class: 'font-bold', // Maintain default styling
                    }
                }
            }),
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
            setNoteContent(editor.getHTML())
        },
    })

    // Sync external updates (e.g. from Version History or Database Load) to Editor
    useEffect(() => {
        if (editor && noteContent !== editor.getHTML()) {
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
            if (listMenuRef.current && !listMenuRef.current.contains(event.target)) {
                setShowListMenu(false)
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

    const applyColor = (color, closeMenu = true) => {
        if (!editor) return
        editor.chain().focus().setColor(color).run()

        // if (!recentColors.includes(color)) {
        //    addRecentColor(color)
        // }
        if (closeMenu) {
            setShowColorMenu(false)
        }
    }

    const handleExport = (type) => {
        if (!editor && !isSourceMode) return

        const dateStr = new Date().toISOString().split('T')[0]
        const filename = `${noteTitle.replace(/[^a-z0-9]/gi, '_')}_${dateStr}`

        if (type === 'pdf') {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const margin = 20
            const pageWidth = doc.internal.pageSize.getWidth()
            const pageHeight = doc.internal.pageSize.getHeight()
            const contentWidth = pageWidth - (margin * 2)
            let cursorY = margin

            // Title Wrapping
            doc.setFontSize(22)
            doc.setFont("helvetica", "bold")
            const splitTitle = doc.splitTextToSize(noteTitle, contentWidth)
            doc.text(splitTitle, margin, cursorY)
            cursorY += (splitTitle.length * 10) + 2

            // Separation Line
            doc.setDrawColor(200, 200, 200)
            doc.line(margin, cursorY, pageWidth - margin, cursorY)
            cursorY += 10

            if (editor) {
                const json = editor.getJSON()

                json.content?.forEach(node => {
                    // Safety check for page break
                    if (cursorY > pageHeight - margin - 20) {
                        doc.addPage()
                        cursorY = margin
                    }

                    if (node.type === 'heading') {
                        const level = node.attrs?.level || 1
                        const size = level === 1 ? 18 : level === 2 ? 16 : 14
                        doc.setFontSize(size)
                        doc.setFont("helvetica", "bold")
                        doc.setTextColor(0, 0, 0)

                        const text = node.content?.map(c => c.text).join('') || ''
                        const splitText = doc.splitTextToSize(text, contentWidth)
                        doc.text(splitText, margin, cursorY)
                        cursorY += (splitText.length * (size / 2)) + 5
                    } else if (node.type === 'paragraph') {
                        doc.setFontSize(11)
                        doc.setFont("helvetica", "normal")
                        doc.setTextColor(60, 60, 60)

                        if (!node.content) {
                            cursorY += 5
                            return
                        }

                        // Combine paragraph text to handle wrapping properly
                        let fullText = ''
                        let firstSpanColor = '#000000'

                        node.content.forEach((span, i) => {
                            fullText += span.text
                            if (i === 0 && span.marks) {
                                span.marks.forEach(m => {
                                    if (m.type === 'textStyle' && m.attrs?.color) {
                                        firstSpanColor = m.attrs.color
                                    }
                                })
                            }
                        })

                        doc.setTextColor(firstSpanColor)
                        const splitLines = doc.splitTextToSize(fullText, contentWidth)

                        // Check for page overflow within paragraph
                        if (cursorY + (splitLines.length * 6) > pageHeight - margin) {
                            doc.addPage()
                            cursorY = margin
                        }

                        doc.text(splitLines, margin, cursorY)
                        cursorY += (splitLines.length * 6) + 2
                    }
                })
            }

            doc.save(`${filename}.pdf`)
        } else if (type === 'md') {
            const blob = new Blob([noteContent], { type: 'text/html' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = (`${filename}.html`)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
        }
        setShowExportMenu(false)
    }

    return (
        <div className="flex flex-col h-full relative z-10">
            {/* Toolbar */}
            <div className={`h-20 px-8 border-b border-slate-800/50 flex items-center justify-between shrink-0 bg-slate-950/50 backdrop-blur-sm transition-all duration-300`}>
                <div className="flex-1 mr-8 flex items-center gap-4">
                    {!isSidebarOpen && (
                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-300 mr-4">
                            <button
                                onClick={onOpenSidebar}
                                className="p-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-lg text-indigo-400 hover:text-white shadow-lg hover:shadow-indigo-500/20 transition-all group"
                                title={language === 'fi' ? "Avaa sivupalkki" : "Open Sidebar"}
                            >
                                <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    )}

                    <div className="flex-1">
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
                </div>

                <div className="flex items-center gap-1.5 ">

                    {/* Formatting Toolbar (Always visible if editor exists, or maybe just Visual Mode? User said "first") */}
                    {/* Based on user request order: TextSize, Color... */}
                    {!isSourceMode && editor && (
                        <>
                            {/* Lists Dropdown */}
                            <div className="relative" ref={listMenuRef}>
                                <button
                                    onClick={() => setShowListMenu(!showListMenu)}
                                    className="flex items-center gap-1 p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                                    title={language === 'fi' ? "Listat" : "Lists"}
                                >
                                    <List className="w-5 h-5" />
                                    <ChevronDown className="w-3 h-3" />
                                </button>
                                {showListMenu && (
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 flex flex-col p-1">
                                        <button
                                            onClick={() => { editor.chain().focus().toggleBulletList().run(); setShowListMenu(false) }}
                                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded text-left ${editor.isActive('bulletList') ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-800'}`}
                                        >
                                            <List className="w-4 h-4" /> {language === 'fi' ? 'Luettelomerkit' : 'Bullet List'}
                                        </button>
                                        <button
                                            onClick={() => { editor.chain().focus().toggleOrderedList().run(); setShowListMenu(false) }}
                                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded text-left ${editor.isActive('orderedList') ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-800'}`}
                                        >
                                            <ListOrdered className="w-4 h-4" /> {language === 'fi' ? 'Numeroitu lista' : 'Ordered List'}
                                        </button>
                                    </div>
                                )}
                            </div>

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
                                        <button onClick={() => { editor.chain().focus().setParagraph().run(); setShowHeaderMenu(false) }} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded text-left">
                                            <Pilcrow className="w-4 h-4" /> {language === 'fi' ? 'Perusteksti' : 'Normal Text'}
                                        </button>
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
                                    <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 p-3">

                                        {/* 1. Custom Picker Section (Top) */}
                                        <div className="mb-4">
                                            <div className="text-xs font-semibold text-slate-500 mb-2 uppercase">{language === 'fi' ? 'Valitse uusi' : 'Pick New Reference'}</div>
                                            <label className="flex items-center gap-2 p-2 rounded bg-slate-800 hover:bg-slate-700/80 transition-colors w-full cursor-pointer relative group">
                                                <div className="relative shrink-0 w-8 h-8">
                                                    <input
                                                        type="color"
                                                        value={customColor}
                                                        onChange={(e) => {
                                                            const c = e.target.value
                                                            setCustomColor(c)
                                                            applyColor(c, false) // Apply immediately but keep menu
                                                        }}
                                                        className="w-full h-full rounded cursor-pointer opacity-0 absolute inset-0 z-10"
                                                    />
                                                    <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center pointer-events-none" style={{ backgroundColor: customColor, backgroundImage: 'none' }}>
                                                        <div className="w-full h-full rounded border-2 border-white/20" style={{ backgroundColor: customColor }}></div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <span className="text-xs font-mono text-slate-300 block">{customColor.toUpperCase()}</span>
                                                </div>

                                                {/* Save Button for Custom Color */}
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        addRecentColor(customColor)
                                                    }}
                                                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded shadow-sm transition-colors z-20 tooltip"
                                                    title={language === 'fi' ? 'Tallenna väri' : 'Save Color'}
                                                >
                                                    <Save className="w-3.5 h-3.5" />
                                                </button>
                                            </label>
                                        </div>

                                        {/* 2. Saved/Recent Colors Grid (Bottom) */}
                                        <div className="border-t border-slate-800 pt-3">
                                            <div className="text-xs font-semibold text-slate-500 mb-2 uppercase flex justify-between items-center">
                                                {language === 'fi' ? 'Tallennetut' : 'Saved Colors'}
                                                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">{recentColors.length}/10</span>
                                            </div>

                                            {recentColors.length === 0 ? (
                                                <div className="text-xs text-slate-600 italic py-2 text-center">
                                                    {language === 'fi' ? 'Ei tallennettuja värejä' : 'No saved colors'}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-5 gap-2">
                                                    {recentColors.map(c => (
                                                        <div key={c} className="group relative w-8 h-8">
                                                            <button
                                                                onClick={() => applyColor(c)}
                                                                className="w-full h-full rounded-full border border-slate-700 hover:scale-110 transition-transform shadow-sm"
                                                                style={{ backgroundColor: c }}
                                                                title={c}
                                                            />
                                                            {/* Delete Button (X) - Top Right Overlay */}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setColorToDelete(c)
                                                                }}
                                                                className="absolute -top-1 -right-1 p-0.5 bg-slate-900/80 text-rose-500/60 rounded-full border border-slate-700/50 opacity-100 group-hover:bg-slate-900 group-hover:text-rose-500 transition-all hover:bg-rose-950 hover:text-rose-400 shadow-sm"
                                                                title={language === 'fi' ? 'Poista' : 'Delete'}
                                                            >
                                                                <X className="w-2.5 h-2.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Deletion Confirmation Dialog Overlay */}
                                        {colorToDelete && (
                                            <div className="absolute inset-0 bg-slate-900 border border-rose-500/30 rounded-lg z-[100] flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-200">
                                                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-3">
                                                    <X className="w-5 h-5 text-rose-500" />
                                                </div>
                                                <p className="text-sm font-bold text-white mb-1">
                                                    {language === 'fi' ? 'Poistetaanko väri?' : 'Delete color?'}
                                                </p>
                                                <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                                                    {language === 'fi'
                                                        ? 'Väri poistuu valikosta. Tämä ei muuta jo luotuja otsikoita.'
                                                        : 'Color will be removed from session. Already created headers won\'t change.'}
                                                </p>
                                                <div className="flex gap-2 w-full">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setColorToDelete(null)
                                                        }}
                                                        className="flex-1 px-2 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                                                    >
                                                        {language === 'fi' ? 'Peruuta' : 'Cancel'}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            removeRecentColor(colorToDelete)
                                                            setColorToDelete(null)
                                                        }}
                                                        className="flex-1 px-2 py-2 text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white rounded-md transition-colors shadow-lg shadow-rose-900/20"
                                                    >
                                                        {language === 'fi' ? 'Poista' : 'Delete'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
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
                                <button onClick={() => handleTranslate('en')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                                    <span className="text-xs font-bold bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400">EN</span> English
                                </button>
                                <button onClick={() => handleTranslate('fi')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
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

                    <div className="w-px h-6 bg-slate-800 mx-1"></div>

                    {/* Indent / Outdent */}
                    {!isSourceMode && editor && (
                        <>
                            <button
                                onClick={() => editor.chain().focus().liftListItem('listItem').run()}
                                disabled={!editor.can().liftListItem('listItem')}
                                className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all disabled:opacity-30"
                                title={language === 'fi' ? "Vähennä sisennystä" : "Decrease Indent"}
                            >
                                <Outdent className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
                                disabled={!editor.can().sinkListItem('listItem')}
                                className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all disabled:opacity-30"
                                title={language === 'fi' ? "Lisää sisennystä" : "Increase Indent"}
                            >
                                <Indent className="w-5 h-5" />
                            </button>
                            <div className="w-px h-6 bg-slate-800 mx-1"></div>
                        </>
                    )}

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
                <div className={`max-w-4xl w-full py-12 min-h-full transition-all duration-300 ${!isSidebarOpen ? 'pl-[104px] pr-8' : 'px-8'}`}>
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
