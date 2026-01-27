import React, { useState, useEffect, useRef } from 'react'
import { X, Check } from 'lucide-react'

export const InputModal = ({ isOpen, onClose, onSubmit, title, placeholder, initialValue = '' }) => {
    const [value, setValue] = useState(initialValue)
    const inputRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            setValue(initialValue)
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [isOpen, initialValue])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (value.trim()) {
            onSubmit(value.trim())
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-1 bg-gradient-to-r from-indigo-500/20 via-blue-500/20 to-purple-500/20">
                    <div className="bg-slate-900/90 p-5 rounded-xl">
                        <h3 className="text-lg font-bold text-white mb-4">{title}</h3>

                        <form onSubmit={handleSubmit}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={placeholder}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all mb-6"
                            />

                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Peruuta
                                </button>
                                <button
                                    type="submit"
                                    disabled={!value.trim()}
                                    className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                                >
                                    <Check size={16} />
                                    Luo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
