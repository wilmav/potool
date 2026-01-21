import { useStore } from '../store'
import { Save, Download } from 'lucide-react'

export function NoteEditor() {
    const { noteContent, setNoteContent, language } = useStore()

    return (
        <div className="flex flex-col h-full relative z-10">
            {/* Toolbar */}
            <div className="h-20 px-8 border-b border-slate-800/50 flex items-center justify-between shrink-0 bg-slate-950/50 backdrop-blur-sm">
                <div className="flex-1 mr-8">
                    <input
                        type="text"
                        defaultValue="Untitled Plan"
                        className="text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 placeholder-slate-600 w-full text-slate-100"
                    />
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <p className="text-xs font-medium text-slate-500">
                            {language === 'fi' ? 'Tallennettu automaattisesti' : 'Auto-saved'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-slate-700">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <Save className="w-4 h-4" />
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
