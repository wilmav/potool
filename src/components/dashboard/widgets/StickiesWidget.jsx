import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../../../store'
import { Palette } from 'lucide-react'

export const StickiesWidget = ({ id, data }) => {
    const { updateWidget } = useStore()
    const [content, setContent] = useState(data.config?.text || '')
    const [showColorPicker, setShowColorPicker] = useState(false)

    // Update local state if prop changes (remote update)
    // We only update if the content is drastically different to avoid cursor jumping
    // Or we assume single user for now and don't overwrite if local definition exists?
    // Let's safe update:
    useEffect(() => {
        if (data.config?.text !== undefined && data.config?.text !== content) {
            // To avoid overwriting while typing, we might check if 'saving' is in progress?
            // But for now, we just sync.
            if (document.activeElement?.tagName !== 'TEXTAREA') {
                setContent(data.config.text)
            }
        }
    }, [data.config?.text])

    const saveTimeoutRef = useRef(null)

    const handleChange = (e) => {
        const newVal = e.target.value
        setContent(newVal)

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(() => {
            updateWidget(id, { config: { text: newVal } })
        }, 800)
    }

    const handleColorChange = (color) => {
        updateWidget(id, { config: { color: color } })
        setShowColorPicker(false)
    }

    const colors = [
        '#ef4444', // Red
        '#f97316', // Orange
        '#eab308', // Yellow
        '#22c55e', // Green
        '#3b82f6', // Blue
        '#a855f7', // Purple
        '#ec4899', // Pink
        '#ffffff', // White
    ]

    return (
        <div className="h-full flex flex-col relative w-full group">
            <textarea
                className="w-full h-full bg-transparent resize-none focus:outline-none text-slate-200 placeholder-slate-600 leading-relaxed custom-scrollbar text-sm font-medium"
                placeholder="Kirjoita muistilappuun..."
                value={content}
                onChange={handleChange}
                spellCheck={false}
            />

            {/* Minimal Toolbar */}
            <div className={`absolute bottom-0 right-0 flex gap-1 transition-opacity duration-200 opacity-0 group-hover:opacity-100`}>
                <div className="relative">
                    <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
                    >
                        <Palette size={14} />
                    </button>

                    {showColorPicker && (
                        <div className="absolute bottom-full right-0 mb-2 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-xl flex gap-2 z-20 flex-wrap w-[136px]">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    onClick={() => handleColorChange(c)}
                                    className="w-6 h-6 rounded-full border border-slate-600 shadow-sm hover:scale-110 transition-transform"
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
