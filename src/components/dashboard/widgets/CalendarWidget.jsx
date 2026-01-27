import React, { useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RotateCcw, ChevronDown, Check } from 'lucide-react'

// Helper to get ISO week number
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
    return weekNo
}

export const CalendarWidget = ({ config = {} }) => {
    const [viewDate, setViewDate] = useState(new Date())
    const [source, setSource] = useState('all')
    const [isSourceOpen, setIsSourceOpen] = useState(false)
    const today = new Date()

    // Settings from config
    const weekStartDay = config.weekStartDay !== undefined ? config.weekStartDay : 1 // 0 = Sun, 1 = Mon
    const showWeekNumbers = config.showWeekNumbers !== undefined ? config.showWeekNumbers : true

    // Mock markers (deadlines)
    const markers = [
        { date: new Date(2026, 0, 28), color: 'bg-rose-500', label: 'Deadline' },
        { date: new Date(2026, 0, 30), color: 'bg-amber-500', label: 'Review' },
        { date: new Date(2026, 1, 5), color: 'bg-indigo-500', label: 'Sprint start' }
    ]

    const sources = [
        { id: 'all', label: 'Kaikki lähteet', color: 'text-slate-400' },
        { id: 'deadlines', label: 'Deadlinet', color: 'text-rose-400' },
        { id: 'meetings', label: 'Kokoukset', color: 'text-indigo-400' },
        { id: 'personal', label: 'Omat', color: 'text-emerald-400' }
    ]

    const monthNames = [
        'Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu',
        'Toukokuu', 'Kesäkuu', 'Heinäkuu', 'Elokuu',
        'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'
    ]

    const dayNames = ['ma', 'ti', 'ke', 'to', 'pe', 'la', 'su']
    if (weekStartDay === 0) {
        dayNames.unshift(dayNames.pop())
    }

    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    const lastDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0)

    let startDayOffset = firstDayOfMonth.getDay() - weekStartDay
    if (startDayOffset < 0) startDayOffset += 7

    const days = []
    for (let i = 0; i < startDayOffset; i++) {
        days.push({ day: null, current: false })
    }
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), i)
        const dayMarkers = markers.filter(m =>
            m.date.getDate() === i &&
            m.date.getMonth() === viewDate.getMonth() &&
            m.date.getFullYear() === viewDate.getFullYear()
        )
        days.push({
            day: i,
            current: true,
            isToday: i === today.getDate() && viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear(),
            markers: dayMarkers,
            date: dateObj
        })
    }

    const changeMonth = (offset) => {
        const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1)
        setViewDate(next)
    }

    // Group days into weeks
    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7))
    }

    return (
        <div className="h-full flex flex-col select-none relative">
            {/* Source Selector UI */}
            <div className="flex items-center justify-between mb-4">
                <div className="relative">
                    <button
                        onClick={() => setIsSourceOpen(!isSourceOpen)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-full text-[10px] font-bold text-slate-300 transition-all"
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${sources.find(s => s.id === source)?.color.replace('text', 'bg') || 'bg-slate-400'}`}></div>
                        {sources.find(s => s.id === source)?.label}
                        <ChevronDown size={10} className={`transition-transform ${isSourceOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isSourceOpen && (
                        <>
                            <div className="fixed inset-0 z-[60]" onClick={() => setIsSourceOpen(false)}></div>
                            <div className="absolute top-full left-0 mt-1 w-40 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-[70] animate-in fade-in zoom-in-95 duration-150">
                                {sources.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => { setSource(s.id); setIsSourceOpen(false); }}
                                        className="w-full text-left px-3 py-2 text-[10px] font-bold hover:bg-white/5 flex items-center justify-between group"
                                    >
                                        <span className={s.color}>{s.label}</span>
                                        {source === s.id && <Check size={10} className="text-indigo-400" />}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={() => setViewDate(new Date())}
                    className="p-1.5 hover:bg-slate-800/60 rounded-full text-slate-400 hover:text-white transition-all"
                    title="Palaa tähän päivään"
                >
                    <RotateCcw size={14} />
                </button>
            </div>

            {/* Calendar Header Nav */}
            <div className="flex items-center justify-between mb-4 bg-slate-800/20 px-3 py-2 rounded-2xl border border-white/5">
                <button
                    onClick={() => changeMonth(-1)}
                    className="p-1 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                    <ChevronLeft size={16} />
                </button>
                <div className="text-center">
                    <div className="text-[11px] font-black text-white uppercase tracking-[0.2em]">
                        {monthNames[viewDate.getMonth()]}
                    </div>
                </div>
                <button
                    onClick={() => changeMonth(1)}
                    className="p-1 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Grid */}
            <div className="flex-1">
                <div className={`grid ${showWeekNumbers ? 'grid-cols-[24px_1fr]' : 'grid-cols-1'} gap-2`}>
                    {showWeekNumbers && <div className="invisible"></div>}
                    <div className="grid grid-cols-7 mb-2">
                        {dayNames.map(d => (
                            <div key={d} className="text-[9px] text-center font-black text-slate-600 uppercase">
                                {d}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    {weeks.map((week, wi) => {
                        const firstValidDay = week.find(d => d.day !== null)
                        const weekNum = firstValidDay ? getWeekNumber(firstValidDay.date) : ''

                        return (
                            <div key={wi} className={`grid ${showWeekNumbers ? 'grid-cols-[24px_1fr]' : 'grid-cols-1'} gap-2 items-center`}>
                                {showWeekNumbers && (
                                    <div className="text-[8px] font-black text-slate-700 text-center uppercase tracking-tighter">
                                        {weekNum}
                                    </div>
                                )}
                                <div className="grid grid-cols-7 gap-1">
                                    {week.map((d, di) => (
                                        <div
                                            key={di}
                                            className={`
                                                aspect-square flex flex-col items-center justify-center text-[11px] rounded-lg transition-all relative
                                                ${d.day ? 'cursor-default hover:bg-slate-800/60' : 'opacity-0'}
                                                ${d.isToday ? 'bg-indigo-600 text-white font-black shadow-lg shadow-indigo-500/30' : 'text-slate-400'}
                                            `}
                                        >
                                            {d.day}
                                            {d.markers && d.markers.length > 0 && !d.isToday && (
                                                <div className="absolute bottom-1 flex gap-0.5">
                                                    {d.markers.map((m, mi) => (
                                                        <div key={mi} className={`w-1 h-1 rounded-full ${m.color}`}></div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
