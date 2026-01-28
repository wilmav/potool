import React, { useState } from 'react'
import { FileText, Calendar, BarChart2, X, Pin, StickyNote } from 'lucide-react'
import { useStore } from '../../store'

export const AddWidgetModal = ({ isOpen, onClose, onAdd }) => {
    const { notes } = useStore()
    const [step, setStep] = useState(1) // 1 = Type Select, 2 = Config (if needed)
    const [selectedType, setSelectedType] = useState(null)

    if (!isOpen) return null

    const widgetTypes = [
        {
            id: 'notes',
            title: 'Viimeisimmät suunnitelmat',
            description: 'Näytä listaus viimeksi muokatuista suunnitelmistasi.',
            icon: FileText,
            color: 'blue'
        },
        {
            id: 'stats',
            title: 'Tilastot',
            description: 'Yleiskatsaus suunnitelmien ja sanojen määristä.',
            icon: BarChart2,
            color: 'emerald'
        },
        {
            id: 'calendar',
            title: 'Kalenteri',
            description: 'Yksinkertainen kalenterinäkymä (Beta).',
            icon: Calendar,
            color: 'violet'
        },
        {
            id: 'plan_viewer',
            title: 'Kiinnitä suunnitelma',
            description: 'Valitse yksi suunnitelma näkyväksi työpöydälle.',
            icon: Pin,
            color: 'orange'
        },
        {
            id: 'sticky',
            title: 'Muistilappu',
            description: 'Nopea muistiinpano työpöydälle.',
            icon: StickyNote,
            color: 'yellow'
        }
    ]

    const handleTypeSelect = (typeId) => {
        if (typeId === 'plan_viewer') {
            setSelectedType(typeId)
            setStep(2)
        } else {
            onAdd(typeId)
            onClose()
        }
    }

    const handlePlanSelect = (noteId) => {
        onAdd('plan_viewer', { noteId })
        onClose()
        // Reset state after closing
        setTimeout(() => {
            setStep(1)
            setSelectedType(null)
        }, 300)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { onClose(); setStep(1); setSelectedType(null); }}></div>
            <div className="relative bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                        {step === 1 ? 'Lisää widget' : 'Valitse suunnitelma'}
                    </h2>
                    <button onClick={() => { onClose(); setStep(1); setSelectedType(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {step === 1 ? (
                    <div className="grid gap-4">
                        {widgetTypes.map((widget) => (
                            <button
                                key={widget.id}
                                onClick={() => handleTypeSelect(widget.id)}
                                className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all text-left group"
                            >
                                <div className={`p-3 rounded-xl bg-${widget.color}-500/10 text-${widget.color}-400 group-hover:scale-110 transition-transform`}>
                                    <widget.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{widget.title}</h3>
                                    <p className="text-sm text-slate-400">{widget.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-80">
                        {/* Plan Selector Step */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                            {notes.length === 0 ? (
                                <div className="text-center text-slate-500 py-10">
                                    Ei suunnitelmia saatavilla.
                                </div>
                            ) : (
                                notes.map(note => (
                                    <button
                                        key={note.id}
                                        onClick={() => handlePlanSelect(note.id)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800 border border-slate-700/30 hover:border-slate-600 transition-colors text-left"
                                    >
                                        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                                            <FileText size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-200">{note.title}</h4>
                                            <p className="text-xs text-slate-500">
                                                {(() => {
                                                    const date = new Date(note.updated_at || note.created_at)
                                                    return `${date.toLocaleDateString(language === 'fi' ? 'fi-FI' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                                                })()}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                        <button
                            onClick={() => { setStep(1); setSelectedType(null); }}
                            className="mt-4 py-2 px-4 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-colors"
                        >
                            Takaisin
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
