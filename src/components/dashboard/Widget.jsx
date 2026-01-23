import React, { forwardRef } from 'react'
import { Settings } from 'lucide-react'

export const Widget = forwardRef(({ className, style, onMouseDown, onMouseUp, onTouchEnd, children, title, color, type, ...props }, ref) => {

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

                {/* Drag Handle Area - Optional, RGL drags by whole item by default unless draggableHandle is set */}
                <div className="flex items-center justify-between text-xs uppercase tracking-wider font-bold opacity-70 mb-2 select-none">
                    <span style={{ color: color || '#fff' }}>{title || type}</span>
                    <button className="hover:bg-white/10 p-1.5 rounded-full transition-colors text-slate-400 hover:text-white">
                        <Settings size={14} />
                    </button>
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
