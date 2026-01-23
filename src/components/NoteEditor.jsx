import { useStore } from '../store'
import { Save, Download, FileJson, FileText, Languages, Loader2, Cloud, Heading1, Heading2, Heading3, Heading4, ChevronDown, Palette, Eye, PenTool, Code, Undo, Redo, Plus, History, Clock, RotateCcw, LogOut, ChevronRight, Layout, Pilcrow, Indent, Outdent, List, ListOrdered, X, Disc } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { createPortal } from 'react-dom'
import StarterKit from '@tiptap/starter-kit'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Underline from '@tiptap/extension-underline'
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Type, Check, Stamp, ClipboardList } from 'lucide-react'

export function NoteEditor({ onLogout, isSidebarOpen, onOpenSidebar }) {
    const {
        noteContent, setNoteContent,
        noteTitle, setNoteTitle,
        noteSummary, updateQuickSummary, // NEW: Store hooks
        language,
        translateNoteContent, isTranslating,
        saveNote, isSaving, createNote,
        isManualSaving,
        recentColors, addRecentColor, removeRecentColor,
        notes, activeNoteId, // Get list of notes for duplicate checking
        versions, restoreVersion, versionTimestamp // Version History logic
    } = useStore()

    const [showExportMenu, setShowExportMenu] = useState(false)
    const [showTranslateMenu, setShowTranslateMenu] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const [showTextStyleMenu, setShowTextStyleMenu] = useState(false)
    const [showListMenu, setShowListMenu] = useState(false)
    const [showColorMenu, setShowColorMenu] = useState(false)

    // Toggle between Visual (Tiptap) and Source (HTML Textarea)
    const [isSourceMode, setIsSourceMode] = useState(false)

    // Removed local recentColors state
    const [customColor, setCustomColor] = useState('#ffffff')

    // Deletion confirmation state
    const [colorToDelete, setColorToDelete] = useState(null)

    // Summary Popover State
    const [showSummaryPopover, setShowSummaryPopover] = useState(false)
    const showSummaryPopoverRef = useRef(false) // Track state for event listener
    const [summaryDraft, setSummaryDraft] = useState('')
    const summaryButtonRef = useRef(null)
    const summaryPopoverRef = useRef(null)

    useEffect(() => {
        showSummaryPopoverRef.current = showSummaryPopover
    }, [showSummaryPopover])

    useEffect(() => {
        if (showSummaryPopover) {
            setSummaryDraft(noteSummary || '')
        }
    }, [showSummaryPopover, noteSummary])

    const handleSummarySave = async () => {
        await updateQuickSummary(summaryDraft)
        setShowSummaryPopover(false)
    }

    // Duplicate Title Warning
    const [duplicateWarning, setDuplicateWarning] = useState(null)

    // Check for duplicates whenever title changes
    useEffect(() => {
        if (!notes || !noteTitle) return setDuplicateWarning(null)

        // Check if any OTHER note has the same title
        const isDuplicate = notes.some(n =>
            n.id !== activeNoteId &&
            n.title.trim().toLowerCase() === noteTitle.trim().toLowerCase()
        )

        if (isDuplicate) {
            setDuplicateWarning(language === 'fi'
                ? 'Nimi on jo käytössä. Valitse toinen nimi.'
                : 'Name already taken. Please rename.'
            )
        } else {
            setDuplicateWarning(null)
        }
    }, [noteTitle, notes, activeNoteId, language])

    const translateMenuRef = useRef(null)
    const exportMenuRef = useRef(null)
    const historyMenuRef = useRef(null)
    const textStyleMenuRef = useRef(null)
    const listMenuRef = useRef(null)
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
            Color,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            // Underline is apparently included or duplicated
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
    // FIX: Only update if the ID changed or we are loading a fresh note, NOT on every keystroke
    const [prevId, setPrevId] = useState(null)
    // activeNoteId is already destructured from useStore at the top

    useEffect(() => {
        if (!editor) return

        // If we switched notes OR if we restored a version (timestamp changed), load the new content
        if (activeNoteId !== prevId || (versionTimestamp && versionTimestamp !== prevVersionTimestamp)) {
            editor.commands.setContent(noteContent)
            setPrevId(activeNoteId)
            if (versionTimestamp) setPrevVersionTimestamp(versionTimestamp)
        }
    }, [activeNoteId, editor, noteContent, versionTimestamp])

    const [prevVersionTimestamp, setPrevVersionTimestamp] = useState(null)

    // We actually DO need to listen to noteContent for the initial load, 
    // BUT we need to be careful. The best pattern with Tiptap + Zustand is usually:
    // 1. Init editor with content.
    // 2. updates -> setStore.
    // 3. Store updates -> do NOTHING to editor (unless it's a remote change).
    //
    // Since we don't have real-time collaboration yet, we can simplifiy:
    // Only update editor if the content in store is DIFFERENT and we didn't just type it.
    // However, keeping it simple: triggering on ID change is the safest for now.


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
            if (textStyleMenuRef.current && !textStyleMenuRef.current.contains(event.target)) {
                setShowTextStyleMenu(false)
            }
            if (listMenuRef.current && !listMenuRef.current.contains(event.target)) {
                setShowListMenu(false)
            }
            if (colorMenuRef.current && !colorMenuRef.current.contains(event.target)) {
                setShowColorMenu(false)
            }
            // Fix: Check if refs exist before checking contains.
            // Also ensure we don't close if clicking the button itself.
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
        setShowTextStyleMenu(false)
    }

    const insertTimestamp = () => {
        if (!editor) return
        const now = new Date()
        const day = String(now.getDate()).padStart(2, '0')
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const year = now.getFullYear()
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const timeStr = `—— ${day}.${month}.${year} ${time} ——`
        editor.chain().focus().insertContent(`<p><strong>${timeStr}</strong></p>`).run()
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
                            placeholder={language === 'fi' ? 'Nimetön suunnitelma' : 'Untitled Plan'}
                            className={`text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 placeholder-slate-600 w-full text-slate-100 ${duplicateWarning ? 'text-rose-400 decoration-rose-500/50 underline decoration-wavy' : ''}`}
                        />
                        {duplicateWarning && (
                            <div className="text-xs text-rose-400 font-medium animate-in slide-in-from-top-1 absolute top-full left-0 mt-1 bg-slate-950/90 border border-rose-500/30 px-2 py-1 rounded shadow-xl z-50">
                                {duplicateWarning}
                            </div>
                        )}
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

                {/* Summary / Info Button */}
                <div className="relative">
                    <button
                        ref={summaryButtonRef}
                        onClick={() => setShowSummaryPopover(!showSummaryPopover)}
                        className={`p-2 rounded-lg transition-colors ${showSummaryPopover ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-indigo-300 hover:bg-slate-800'}`}
                        title={language === 'fi' ? 'Suunnitelman tiedot & Tiivistelmä' : 'Plan Info & Summary'}
                    >
                        <ClipboardList className="w-5 h-5" />
                    </button>

                    {/* Summary Popover */}
                    {showSummaryPopover && createPortal(
                        <>
                            {/* Backdrop for closing */}
                            <div
                                className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-[2px]"
                                onClick={() => setShowSummaryPopover(false)}
                            />
                            <div
                                ref={summaryPopoverRef}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[9999] flex flex-col animate-in fade-in zoom-in duration-200"
                            >
                                <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950/50 rounded-t-xl">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        {language === 'fi' ? 'Tiivistelmä' : 'Summary'}
                                    </h3>
                                    <button
                                        onClick={() => setShowSummaryPopover(false)}
                                        className="text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-4 space-y-4">
                                    <textarea
                                        value={summaryDraft}
                                        onChange={(e) => setSummaryDraft(e.target.value)}
                                        placeholder={language === 'fi' ? 'Kirjoita lyhyt tiivistelmä...' : 'Write a short summary...'}
                                        className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none resize-none"
                                    />

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => setShowSummaryPopover(false)}
                                            className="flex-1 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            {language === 'fi' ? 'Peruuta' : 'Cancel'}
                                        </button>
                                        <button
                                            onClick={handleSummarySave}
                                            className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20 transition-all"
                                        >
                                            {language === 'fi' ? 'Tallenna' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>,
                        document.body
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {/* Group 1: Text Styles & Timestamp */}
                    {!isSourceMode && editor && (
                        <div className="flex items-center gap-1">
                            {/* Manual Timestamp Button */}
                            <button
                                onClick={insertTimestamp}
                                className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                                title={language === 'fi' ? "Lisää aikaleima" : "Add Timestamp"}
                            >
                                <div className="relative">
                                    <Clock className="w-5 h-5" />
                                    <Plus className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-600 text-white rounded-full p-0.5" />
                                </div>
                            </button>

                            <div className="w-px h-6 bg-slate-800 mx-1"></div>

                            {/* Text Styles Dropdown */}
                            <div className="relative" ref={textStyleMenuRef}>
                                <button
                                    onClick={() => setShowTextStyleMenu(!showTextStyleMenu)}
                                    className="flex items-center gap-1 p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                                    title={language === 'fi' ? "Tekstityylit" : "Text Styles"}
                                >
                                    <Type className="w-5 h-5" />
                                    <ChevronDown className="w-3 h-3" />
                                </button>
                                {showTextStyleMenu && (
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-[60] flex flex-col p-1">
                                        <button onClick={() => { editor.chain().focus().setParagraph().run(); setShowTextStyleMenu(false) }} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded text-left">
                                            <Pilcrow className="w-4 h-4" /> {language === 'fi' ? 'Perusteksti' : 'Normal Text'}
                                        </button>
                                        <div className="h-px bg-slate-800 my-1"></div>
                                        <button onClick={() => toggleHeader(1)} className={`flex items-center gap-2 px-3 py-2 text-sm rounded text-left font-bold ${editor.isActive('heading', { level: 1 }) ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                                            <Heading1 className="w-4 h-4" /> Heading 1
                                        </button>
                                        <button onClick={() => toggleHeader(2)} className={`flex items-center gap-2 px-3 py-2 text-sm rounded text-left font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                                            <Heading2 className="w-4 h-4" /> Heading 2
                                        </button>
                                        <div className="h-px bg-slate-800 my-1"></div>
                                        <button onClick={() => { editor.chain().focus().toggleBold().run(); setShowTextStyleMenu(false) }} className={`flex items-center gap-2 px-3 py-2 text-sm rounded text-left ${editor.isActive('bold') ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                                            <Bold className="w-4 h-4" /> {language === 'fi' ? 'Lihavointi' : 'Bold'}
                                        </button>
                                        <button onClick={() => { editor.chain().focus().toggleItalic().run(); setShowTextStyleMenu(false) }} className={`flex items-center gap-2 px-3 py-2 text-sm rounded text-left ${editor.isActive('italic') ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                                            <Italic className="w-4 h-4" /> {language === 'fi' ? 'Kursivointi' : 'Italic'}
                                        </button>
                                        <button onClick={() => { editor.chain().focus().toggleUnderline().run(); setShowTextStyleMenu(false) }} className={`flex items-center gap-2 px-3 py-2 text-sm rounded text-left ${editor.isActive('underline') ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                                            <UnderlineIcon className="w-4 h-4" /> {language === 'fi' ? 'Alleviivaus' : 'Underline'}
                                        </button>
                                        <button onClick={() => { editor.chain().focus().toggleStrike().run(); setShowTextStyleMenu(false) }} className={`flex items-center gap-2 px-3 py-2 text-sm rounded text-left ${editor.isActive('strike') ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                                            <Strikethrough className="w-4 h-4" /> {language === 'fi' ? 'Yliviivaus' : 'Strikethrough'}
                                        </button>
                                    </div>
                                )}
                            </div>

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
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-[60] flex flex-col p-1">
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
                                        <button
                                            onClick={() => { editor.chain().focus().toggleTaskList().run(); setShowListMenu(false) }}
                                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded text-left ${editor.isActive('taskList') ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-800'}`}
                                        >
                                            <Check className="w-4 h-4" /> {language === 'fi' ? 'Tehtävälista' : 'Task List'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!isSourceMode && editor && <div className="w-px h-6 bg-slate-800 mx-2"></div>}

                    {/* Group 2: Formatting (Color) */}
                    {!isSourceMode && editor && (
                        <>
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
                                    <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-[60] p-3">
                                        {/* Custom Picker Section */}
                                        <div className="mb-4">
                                            <div className="text-xs font-semibold text-slate-500 mb-2 uppercase">{language === 'fi' ? 'Valitse uusi' : 'Pick New'}</div>
                                            <label className="flex items-center gap-2 p-2 rounded bg-slate-800 hover:bg-slate-700/80 transition-colors w-full cursor-pointer relative group">
                                                <div className="relative shrink-0 w-8 h-8">
                                                    <input
                                                        type="color"
                                                        value={customColor}
                                                        onChange={(e) => {
                                                            const c = e.target.value
                                                            setCustomColor(c)
                                                            applyColor(c, false)
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
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        addRecentColor(customColor)
                                                    }}
                                                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded shadow-sm transition-colors z-20"
                                                    title={language === 'fi' ? 'Tallenna väri' : 'Save Color'}
                                                >
                                                    <Save className="w-3.5 h-3.5" />
                                                </button>
                                            </label>
                                        </div>

                                        {/* Saved Colors Grid */}
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
                                                        <div key={c} className="group relative w-8 h-8 select-none">
                                                            <button
                                                                type="button"
                                                                onClick={() => applyColor(c)}
                                                                className="w-full h-full rounded-full border border-slate-700 hover:scale-110 transition-transform shadow-sm"
                                                                style={{ backgroundColor: c }}
                                                                title={c}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    // We need to prevent the parent onClick from firing? No, parent is div.
                                                                    // But let's make sure we don't accidentally close menu if logic changes.
                                                                    setColorToDelete(c)
                                                                }}
                                                                className="absolute -top-1 -right-1 p-0.5 bg-slate-900/80 text-rose-500/60 rounded-full border border-slate-700/50 opacity-100 group-hover:bg-slate-900 group-hover:text-rose-500 transition-all hover:bg-rose-950 hover:text-rose-400 shadow-sm z-10"
                                                                title={language === 'fi' ? 'Poista' : 'Delete'}
                                                            >
                                                                <X className="w-2.5 h-2.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Deletion Warning Overlay */}
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
                            <div className="w-px h-6 bg-slate-800 mx-2"></div>
                        </>
                    )}

                    {/* Group 3: Utilities (Translate, Source, Export) */}
                    <div className="flex items-center gap-1">
                        {/* Translate */}
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
                                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-[60]">
                                    <button onClick={() => handleTranslate('en')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                                        <span className="text-xs font-bold bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400">EN</span> English
                                    </button>
                                    <button onClick={() => handleTranslate('fi')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                                        <span className="text-xs font-bold bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400">FI</span> Suomi
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Export */}
                        <div className="relative" ref={exportMenuRef}>
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-all"
                                title={language === 'fi' ? "Vie tiedostona" : "Export"}
                            >
                                <Download className="w-5 h-5" />
                            </button>
                            {showExportMenu && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-[60]">
                                    <button onClick={() => handleExport('pdf')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                                        <FileText className="w-4 h-4 text-rose-400" /> PDF Document
                                    </button>
                                    <button onClick={() => handleExport('md')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                                        <Code className="w-4 h-4 text-emerald-400" /> HTML Code
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Source Toggle */}
                        <button
                            onClick={() => {
                                if (isSourceMode && editor) editor.commands.setContent(noteContent)
                                setIsSourceMode(!isSourceMode)
                            }}
                            className={`p-2 rounded-lg transition-colors ${isSourceMode ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'}`}
                            title={language === 'fi' ? "Lähdekoodi / Visuaalinen" : "Source Code / Visual"}
                        >
                            <Code className="w-5 h-5" />
                        </button>

                        {/* History Toggle */}
                        <div className="relative" ref={historyMenuRef}>
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className={`p-2 rounded-lg transition-colors ${showHistory ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'}`}
                                title={language === 'fi' ? 'Versiohistoria' : 'Version History'}
                            >
                                <History className="w-5 h-5" />
                            </button>
                            {/* Note: History popup logic would go here or handled by Sidebar/Global state */}
                            {showHistory && (
                                <div className="absolute top-full right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-[60] flex flex-col max-h-96 animate-in fade-in zoom-in duration-200">
                                    <div className="p-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            {language === 'fi' ? 'Versiohistoria' : 'Version History'}
                                        </h3>
                                    </div>
                                    <div className="overflow-y-auto custom-scrollbar">
                                        {versions.length === 0 ? (
                                            <div className="p-8 text-center text-slate-500 text-sm">
                                                {language === 'fi' ? 'Ei tallennettuja versioita.' : 'No saved versions yet.'}
                                            </div>
                                        ) : (
                                            versions.map((v) => (
                                                <button
                                                    key={v.id}
                                                    onClick={() => {
                                                        if (window.confirm(language === 'fi' ? 'Palautetaanko tämä versio? Nykyiset muutokset menetetään.' : 'Restore this version? Current changes will be overwritten.')) {
                                                            restoreVersion(v)
                                                            setShowHistory(false)
                                                        }
                                                    }}
                                                    className="w-full text-left p-3 hover:bg-slate-800 border-b border-slate-800/50 last:border-0 group transition-colors"
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-semibold text-slate-300 text-sm group-hover:text-indigo-300 transition-colors truncate pr-2">
                                                            {v.title || (language === 'fi' ? 'Nimetön' : 'Untitled')}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                                                            v{v.id.slice(0, 4)}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-2">
                                                        <span>{new Date(v.created_at).toLocaleDateString()}</span>
                                                        <span>&bull;</span>
                                                        <span>{new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <div className="mt-2 text-[10px] text-slate-600 line-clamp-1 italic group-hover:text-slate-500">
                                                        {v.content?.replace(/<[^>]*>/g, '').slice(0, 50) || '...'}
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-px h-6 bg-slate-800 mx-2"></div>

                    {/* Group 4: Global Actions (New, Save, Logout) */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => createNote()}
                            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                            title={language === 'fi' ? 'Uusi suunnitelma' : 'New Plan'}
                        >
                            <Plus className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => saveNote(true)}
                            disabled={isSaving || !!duplicateWarning}
                            className={`p-2 rounded-lg transition-all disabled:opacity-50 ${duplicateWarning ? 'text-slate-600 cursor-not-allowed' : 'text-emerald-500 hover:text-emerald-400 hover:bg-emerald-950/30'}`}
                            title={duplicateWarning ? duplicateWarning : (language === 'fi' ? "Tallenna" : "Save")}
                        >
                            {isManualSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={onLogout}
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-all"
                            title={language === 'fi' ? 'Kirjaudu ulos' : 'Log out'}
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div >

            {/* Editor Area */}
            < div className="flex-1 overflow-y-auto custom-scrollbar" >
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
            </div >
        </div >
    )
}
