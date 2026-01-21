import { useStore } from '../store'
import { Save, Download, FileText } from 'lucide-react'

export function NoteEditor() {
    const { noteContent, setNoteContent, language } = useStore()

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Toolbar */}
            <div className="h-16 px-8 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div>
                    <input
                        type="text"
                        defaultValue="Untitled Plan"
                        className="text-xl font-bold text-gray-800 border-none focus:ring-0 p-0 placeholder-gray-300 w-full"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        {language === 'fi' ? 'Automaattinen tallennus päällä' : 'Auto-save on'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors">
                        <Save className="w-4 h-4" />
                        Save
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
                <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder={language === 'fi' ? "Aloita kirjoittaminen tai valitse aiheita vasemmalta..." : "Start writing or select topics from left..."}
                    className="w-full h-full resize-none border-none focus:ring-0 text-gray-800 text-lg leading-relaxed placeholder-gray-300 bg-transparent outline-none"
                />
            </div>
        </div>
    )
}
