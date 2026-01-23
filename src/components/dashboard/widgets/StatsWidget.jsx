import React from 'react'
import { useStore } from '../../../store'
import { FileStack, Type, RefreshCw } from 'lucide-react'

const StatItem = ({ icon: Icon, value, label, color }) => (
    <div className="bg-slate-800/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center hover:bg-slate-800/60 transition-colors">
        <div className={`p-2 rounded-full bg-${color}-500/10 text-${color}-400 mb-2`}>
            <Icon size={20} />
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">{label}</div>
    </div>
)

export const StatsWidget = () => {
    const { notes } = useStore()

    const totalNotes = notes.length
    // Estimate generic word count
    const totalWords = notes.reduce((acc, note) => {
        return acc + (note.content ? note.content.split(/\s+/).length : 0)
    }, 0)

    // Format large numbers
    const formatCount = (n) => n > 999 ? (n / 1000).toFixed(1) + 'k' : n

    return (
        <div className="grid grid-cols-2 gap-3 h-full">
            <StatItem
                icon={FileStack}
                value={totalNotes}
                label="Suunnitelmat"
                color="indigo"
            />
            <StatItem
                icon={Type}
                value={formatCount(totalWords)}
                label="Sanat"
                color="emerald"
            />
            {/* Placeholder for future metric */}
            <div className="col-span-2 bg-slate-800/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-amber-500/10 text-amber-400">
                        <RefreshCw size={20} />
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-bold text-slate-300">Viimeisin päivitys</div>
                        <div className="text-xs text-slate-500">Juuri nyt</div>
                    </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
        </div>
    )
}
