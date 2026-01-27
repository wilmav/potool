import React from 'react'
import { AlertTriangle } from 'lucide-react'

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className={`p-1 bg-gradient-to-r ${isDangerous ? 'from-red-500/20 via-orange-500/20 to-rose-500/20' : 'from-indigo-500/20 via-blue-500/20 to-purple-500/20'}`}>
                    <div className="bg-slate-900/90 p-5 rounded-xl">
                        <div className="flex items-center gap-3 mb-4">
                            {isDangerous && <AlertTriangle className="text-red-500" size={24} />}
                            <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
                        </div>

                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            {message}
                        </p>

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm()
                                    onClose()
                                }}
                                className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-lg transition-all ${isDangerous
                                        ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20'
                                        : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
                                    }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
