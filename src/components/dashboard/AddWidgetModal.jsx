import React from 'react'
import { FileText, Calendar, BarChart2, X } from 'lucide-react'

export const AddWidgetModal = ({ isOpen, onClose, onAdd }) => {
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
        }
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Lisää widget</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="grid gap-4">
                    {widgetTypes.map((widget) => (
                        <button
                            key={widget.id}
                            onClick={() => onAdd(widget.id)}
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
            </div>
        </div>
    )
}
