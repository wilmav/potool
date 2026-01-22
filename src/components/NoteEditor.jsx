import { useStore } from '../store'
import { Save, Download, FileJson, FileText, Languages, Loader2, Cloud, Check, Plus, History, Clock, RotateCcw, Heading1, Heading2, Heading3, Heading4, ChevronDown, Palette, Eye, PenTool } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { useState, useEffect, useRef } from 'react'

export function NoteEditor() {
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
    const [isPreviewMode, setIsPreviewMode] = useState(false)
    const [recentColors, setRecentColors] = useState(['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6'])
    const [customColor, setCustomColor] = useState('#ffffff')

    const translateMenuRef = useRef(null)
    const exportMenuRef = useRef(null)
    const historyMenuRef = useRef(null)
    const headerMenuRef = useRef(null)
    const colorMenuRef = useRef(null)

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

    const insertHeader = (level) => {
        const textarea = document.querySelector('textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = noteContent;
        const before = text.substring(0, start);
        const after = text.substring(end);

        // Find the start of the current line
        const lastNewLine = before.lastIndexOf('\n');
        const lineStart = lastNewLine === -1 ? 0 : lastNewLine + 1;

        // Check if line already has a header
        const currentLinePrefix = text.substring(lineStart, start);
        const headerMatch = currentLinePrefix.match(/^(#+)\s/);

        let newContent;
        let newCursorPos;

        const headerSyntax = '#'.repeat(level) + ' ';

        if (headerMatch) {
            // Remove existing header
            const lineContent = text.substring(lineStart);
            const cleanLine = lineContent.replace(/^(#+)\s/, '');

            // If selecting same level, just remove it (toggle off)
            if (headerMatch[1].length === level) {
                newContent = text.substring(0, lineStart) + cleanLine;
                newCursorPos = lineStart + (start - lineStart - headerMatch[0].length);
            } else {
                newContent = text.substring(0, lineStart) + headerSyntax + cleanLine;
                newCursorPos = lineStart + headerSyntax.length + (start - lineStart - headerMatch[0].length);
            }
        } else {
            // Add new header
            newContent = before.substring(0, lineStart) + headerSyntax + before.substring(lineStart) + after;
            newCursorPos = start + headerSyntax.length;
        }

        setNoteContent(newContent);
        setShowHeaderMenu(false);

        // Restore focus and cursor
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    }

    const insertColor = (color) => {
        const textarea = document.querySelector('textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = noteContent;

        if (start === end) return; // No selection

        const selection = text.substring(start, end);
        const coloredText = `<span style="color: ${color}">${selection}</span>`;
        const newContent = text.substring(0, start) + coloredText + text.substring(end);

        setNoteContent(newContent);

        // Add to recent if not exists
        if (!recentColors.includes(color)) {
            setRecentColors(prev => [color, ...prev].slice(0, 10));
        }

        setShowColorMenu(false);

        setTimeout(() => {
            textarea.focus();
            // Move cursor to end of inserted span
            const newPos = start + coloredText.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 0);
    }

    const handleExport = (type) => {
        const dateStr = new Date().toISOString().split('T')[0]
        const filename = `${noteTitle.replace(/[^a-z0-9]/gi, '_')}_${dateStr}`

        if (type === 'pdf') {
            const doc = new jsPDF()

            // Margins
            const marginLeft = 20;
            const marginTop = 20;
            const lineHeight = 7;
            const pageWidth = 210; // A4 width in mm
            const maxLineWidth = pageWidth - (marginLeft * 2);

            let cursorY = marginTop;

            // Add title
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.text(noteTitle, marginLeft, cursorY);
            cursorY += 15;

            // Process content line by line
            const lines = noteContent.split('\n');

            lines.forEach((line) => {
                // Check for page break
                if (cursorY > 280) {
                    doc.addPage();
                    cursorY = marginTop;
                }

                let fontSize = 11;
                let fontStyle = "normal";
                let textToPrint = line;
                let currentLineHeight = lineHeight;
                let spacingAfter = 0;

                // Determine style based on markdown headers
                if (line.startsWith('# ')) {
                    fontSize = 20;
                    fontStyle = "bold";
                    textToPrint = line.substring(2);
                    currentLineHeight = 12;
                    spacingAfter = 4;
                } else if (line.startsWith('## ')) {
                    fontSize = 16;
                    fontStyle = "bold";
                    textToPrint = line.substring(3);
                    currentLineHeight = 10;
                    spacingAfter = 3;
                } else if (line.startsWith('### ')) {
                    fontSize = 14;
                    fontStyle = "bold";
                    textToPrint = line.substring(4);
                    currentLineHeight = 8;
                    spacingAfter = 2;
                } else if (line.startsWith('#### ')) {
                    fontSize = 12;
                    fontStyle = "bold";
                    textToPrint = line.substring(5);
                    currentLineHeight = 8;
                    spacingAfter = 2;
                }

                doc.setFontSize(fontSize);
                doc.setFont("helvetica", fontStyle);

                // Split long lines
                const splitText = doc.splitTextToSize(textToPrint, maxLineWidth);

                splitText.forEach(subLine => {
                    if (cursorY > 280) {
                        doc.addPage();
                        cursorY = marginTop;
                    }
                    doc.text(subLine, marginLeft, cursorY);
                    cursorY += currentLineHeight;
                });

                cursorY += spacingAfter;
            });

            doc.save(`${filename}.pdf`)
        } else if (type === 'md') {
            const blob = new Blob([noteContent], { type: 'text/markdown' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = (`${filename}.md`)
            a.click()
            a.remove()
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
                    <div className="relative" ref={translateMenuRef}>
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
                    <div className="relative" ref={exportMenuRef}>
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

                    {/* History Dropdown */}
                    <div className="relative" ref={historyMenuRef}>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            disabled={!activeNoteId}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-slate-700 disabled:opacity-50"
                            title={language === 'fi' ? 'Versiohistoria' : 'Version History'}
                        >
                            <History className="w-4 h-4" />
                        </button>

                        {showHistory && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                                <div className="p-3 border-b border-slate-700 bg-slate-900/50">
                                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-amber-400" />
                                        {language === 'fi' ? 'Versiohistoria' : 'Version History'}
                                    </h3>
                                </div>
                                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                    {versions.length === 0 ? (
                                        <div className="p-4 text-center text-xs text-slate-500">
                                            {language === 'fi' ? 'Ei tallennettuja versioita.' : 'No saved versions yet.'}
                                        </div>
                                    ) : (
                                        versions.map(version => (
                                            <div key={version.id} className="p-3 border-b border-slate-800 hover:bg-slate-800/50 transition-colors group">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-medium text-slate-300">
                                                        {new Date(version.created_at).toLocaleString(language === 'fi' ? 'fi-FI' : 'en-GB')}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(language === 'fi' ? 'Palautetaanko tämä versio? Nykyinen luonnos korvataan.' : 'Restore this version? Current draft will be replaced.')) {
                                                                restoreVersion(version)
                                                                setShowHistory(false)
                                                            }
                                                        }}
                                                        className="text-[10px] bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white px-2 py-1 rounded transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1"
                                                    >
                                                        <RotateCcw className="w-3 h-3" />
                                                        {language === 'fi' ? 'Palauta' : 'Restore'}
                                                    </button>
                                                </div>
                                                <p className="text-xs text-slate-500 truncate">{version.title}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>


                    <div className="w-px h-6 bg-slate-800 mx-1"></div>

                    {/* Formatting Toolbar */}
                    <div className="flex items-center gap-1 mr-2">
                        {/* Header Dropdown */}
                        <div className="relative" ref={headerMenuRef}>
                            <button
                                onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                                className="flex items-center gap-1 p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                                title="Heading Styles"
                            >
                                <Heading1 className="w-4 h-4" />
                                <ChevronDown className="w-3 h-3" />
                            </button>
                            {showHeaderMenu && (
                                <div className="absolute top-full left-0 mt-2 w-40 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 flex flex-col p-1">
                                    <button onClick={() => insertHeader(1)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded text-left">
                                        <Heading1 className="w-4 h-4" /> Heading 1
                                    </button>
                                    <button onClick={() => insertHeader(2)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded text-left">
                                        <Heading2 className="w-4 h-4" /> Heading 2
                                    </button>
                                    <button onClick={() => insertHeader(3)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded text-left">
                                        <Heading3 className="w-4 h-4" /> Heading 3
                                    </button>
                                    <button onClick={() => insertHeader(4)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded text-left">
                                        <Heading4 className="w-4 h-4" /> Heading 4
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Color Picker Dropdown */}
                        <div className="relative" ref={colorMenuRef}>
                            <button
                                onClick={() => setShowColorMenu(!showColorMenu)}
                                className="flex items-center gap-1 p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                                title="Text Color"
                            >
                                <Palette className="w-4 h-4" />
                                <ChevronDown className="w-3 h-3" />
                            </button>
                            {showColorMenu && (
                                <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 p-3">
                                    <div className="text-xs font-semibold text-slate-500 mb-2 uppercase">Recent & Favorites</div>
                                    <div className="grid grid-cols-5 gap-2 mb-3">
                                        {recentColors.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => insertColor(c)}
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
                                            <span>Pick Custom...</span>
                                            <button
                                                onClick={() => insertColor(customColor)}
                                                className="ml-auto text-xs bg-slate-800 px-2 py-1 rounded hover:bg-slate-700"
                                            >
                                                Apply
                                            </button>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* View Toggle */}
                        <button
                            onClick={() => setIsPreviewMode(!isPreviewMode)}
                            className={`flex items-center gap-1 p-1.5 rounded transition-colors ml-2 ${isPreviewMode ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                            title="Toggle Preview"
                        >
                            {isPreviewMode ? <PenTool className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
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
                        onClick={() => saveNote(true)}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isManualSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto w-full py-12 px-8 min-h-full">
                    {isPreviewMode ? (
                        <div className="prose prose-invert max-w-none">
                            {/* Simple Markdown+HTML Renderer */}
                            {noteContent.split('\n').map((line, i) => {
                                const h1 = line.match(/^# (.*)/);
                                const h2 = line.match(/^## (.*)/);
                                const h3 = line.match(/^### (.*)/);
                                const h4 = line.match(/^#### (.*)/);

                                const content = (h1?.[1] || h2?.[1] || h3?.[1] || h4?.[1] || line).split(/(<span style="color: #[0-9a-fA-F]{6}">.*?<\/span>)/g).map((part, idx) => {
                                    if (part.startsWith('<span')) {
                                        const color = part.match(/color: (#[0-9a-fA-F]{6})/)?.[1];
                                        const text = part.match(/>(.*?)</)?.[1];
                                        return <span key={idx} style={{ color }}>{text}</span>;
                                    }
                                    return <span key={idx}>{part}</span>;
                                });

                                if (h1) return <h1 key={i} className="text-4xl font-bold mb-4 mt-6 text-slate-100">{content}</h1>;
                                if (h2) return <h2 key={i} className="text-3xl font-bold mb-3 mt-5 text-slate-100">{content}</h2>;
                                if (h3) return <h3 key={i} className="text-2xl font-bold mb-2 mt-4 text-slate-100">{content}</h3>;
                                if (h4) return <h4 key={i} className="text-xl font-bold mb-2 mt-3 text-slate-100">{content}</h4>;

                                return <p key={i} className="mb-2 text-lg text-slate-300 leading-relaxed font-medium min-h-[1.5rem]">{content}</p>;
                            })}
                        </div>
                    ) : (
                        <textarea
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder={language === 'fi'
                                ? "Kirjoita suunnitelmasi tähän... \n\nVoit lisätä otsikoita ja aiheita vasemman paneelin kirjastosta painamalla + painiketta."
                                : "Write your plan here... \n\nAdd headers and topics from the library on the left by clicking the + button."}
                            className="w-full h-[calc(100vh-200px)] resize-none border-none focus:ring-0 text-slate-300 text-lg leading-relaxed placeholder-slate-700 bg-transparent outline-none font-medium font-mono"
                            spellCheck={false}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
