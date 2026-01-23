import React from 'react'
import { Calendar as CalendarIcon, CheckSquare } from 'lucide-react'

export const CalendarWidget = () => {
    // Mock data for now
    const upcomingEvents = [
        { id: 1, title: 'Sprint Review', time: '14:00', type: 'meeting' },
        { id: 2, title: 'PO Sync', time: 'Huomenna', type: 'meeting' },
        { id: 3, title: 'Deadline: Q1 Roadmap', time: 'Pe 12.00', type: 'deadline' }
    ]

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2 text-slate-300">
                    <CalendarIcon size={16} />
                    <span className="text-sm font-bold">Tulevat</span>
                </div>
                <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-400">VKO 4</span>
            </div>

            <div className="space-y-2 flex-1 overflow-auto custom-scrollbar">
                {upcomingEvents.map(event => (
                    <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 border border-transparent hover:border-slate-700 transition-all group">
                        <div className={`w-1 h-8 rounded-full ${event.type === 'meeting' ? 'bg-indigo-500' : 'bg-rose-500'}`}></div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-slate-200 group-hover:text-white">{event.title}</h4>
                            <p className="text-xs text-slate-500">{event.time}</p>
                        </div>
                    </div>
                ))}

                <div className="mt-4 pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-2 text-slate-400 hover:text-white cursor-pointer transition-colors">
                        <CheckSquare size={14} />
                        <span className="text-xs font-semibold">Lisää uusi merkintä...</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
