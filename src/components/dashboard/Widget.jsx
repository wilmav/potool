import React, { forwardRef } from 'react'
import { Settings } from 'lucide-react'

export const Widget = forwardRef(({ className, style, onMouseDown, onMouseUp, onTouchEnd, children, title, color, type, onDelete, language, ...props }, ref) => {

    // Size classes are handled by RGL using 'w' and 'h' in layout, 
    // but visually we assume the container fills the grid item.
    // The className passed by RGL includes 'react-grid-item' etc.

    return (
        <div
            ref={ref}
            className={`${className} flex flex-col`}
            style={{ ...style }}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onTouchEnd={onTouchEnd}
            {...props}
        >
            <div className={`h-full bg-slate-900/50 backdrop-blur-sm rounded-3xl p-5 border border-slate-700/50 shadow-xl hover:shadow-2xl hover:border-slate-600 transition-all duration-300 flex flex-col gap-3 group relative overflow-hidden`}>

                {/* Drag Handle Area */}
                <div className="widget-drag-handle flex items-center justify-between text-xs uppercase tracking-wider font-bold opacity-70 mb-2 select-none cursor-move">
                    <span style={{ color: color || '#fff' }}>{title || type}</span>
                    <SettingsMenu onDelete={onDelete} language={language} />
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar relative z-10">
                    {children}
                </div>

                {/* Decorative background gradient */}
                <div
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ background: `radial-gradient(circle at top right, ${color || '#fff'}, transparent 70%)` }}
                />
            </div>
        </div>
    )
})

const SettingsMenu = ({ onDelete, language }) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const menuRef = React.useRef(null)

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(!isOpen)
                }}
                onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
                className={`p-1.5 rounded-full transition-colors ${isOpen ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-400 hover:text-white'} cursor-pointer`}
            >
                <Settings size={14} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-slate-800 border border-slate-700/50 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete && onDelete()
                            setIsOpen(false)
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                        {language === 'fi' ? 'Poista' : 'Delete'}
                    </button>
                </div>
            )}
        </div>
    )
}
