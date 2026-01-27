import React, { useEffect, useState } from 'react'
import { useStore } from '../../store'
import { Plus, Layout, Settings, Grid, Presentation, Hash, FileText, ChevronUp, ChevronDown } from 'lucide-react'
import { AddWidgetModal } from './AddWidgetModal' // New import
import { InputModal } from './InputModal'
import { ConfirmationModal } from './ConfirmationModal'

// Helper to map icons string to Component
const IconMap = {
    'grid': Grid,
    'presentation': Presentation,
    'layout': Layout,
    'hash': Hash
}

const BrowserTab = ({ title, isActive, color, onClick, onContextMenu, iconName, language, handleTooltipEnter, handleTooltipLeave }) => {
    const Icon = IconMap[iconName] || Grid

    return (
        <button
            onClick={onClick}
            onContextMenu={onContextMenu}
            onMouseEnter={(e) => handleTooltipEnter && handleTooltipEnter(e, `${language === 'fi' ? 'Välilehti' : 'Tab'}: ${title}`)}
            onMouseLeave={handleTooltipLeave}
            className={`
                relative group flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ease-out
                ${isActive
                    ? 'shadow-lg shadow-black/20 scale-105'
                    : 'hover:bg-white/10 hover:scale-105 active:scale-95 opacity-70 hover:opacity-100'
                }
            `}
            style={{
                backgroundColor: isActive ? color : 'transparent',
                color: isActive ? '#000' : '#e2e8f0',
            }}
        >
            <div className={`p-1 rounded-full ${isActive ? 'bg-black/10' : 'bg-white/10 group-hover:bg-white/20'}`}>
                <Icon size={16} />
            </div>
            <span>{title}</span>
        </button>
    )
}

export const DashboardLayout = ({ children }) => {
    const {
        language,
        dashboards,
        activeDashboardId,
        dashboardTabs,
        loadingDashboards,
        fetchDashboards,
        createDashboard,
        loadDashboard,
        createTab,
        updateTab,
        deleteTab,
        addWidget,
        fetchNotes
    } = useStore()


    // const [activeTabId, setActiveTabId] = useState(null) <-- activeTabId comes from parent mostly now, but DashboardPage manages layout actually?
    // Wait, DashboardPage renders DashboardLayout but logic for activeTab set is inside Layout?
    // Actually DashboardPage passes activeTabId? No, DashboardPage RECEIVES it if we lift state up?
    // Looking at DashboardPage code: DashboardLayout wraps DashboardContent. DashboardContent receives nothing?
    // Ah, previous code had `children` logic. DashboardPage renders `<DashboardLayout><DashboardContent /></DashboardLayout>`
    // DashboardLayout has `const [activeTabId, setActiveTabId] = useState(null)` inside it in previous versions.

    // Let's stick to internal state for now as it was working, just ensuring it syncs.
    const [internalActiveTabId, setInternalActiveTabId] = useState(null)

    // Effect to sync internal state if needed, or just use it.

    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)
    const [activeTooltip, setActiveTooltip] = useState(null)
    const [isNavVisible, setIsNavVisible] = useState(false)
    const [isPinned, setIsPinned] = useState(() => {
        try { return localStorage.getItem('dash_nav_pinned') === 'true' } catch { return false }
    })

    // Modal States
    const [inputModal, setInputModal] = useState({
        isOpen: false,
        title: '',
        placeholder: '',
        initialValue: '',
        onSubmit: () => { }
    })

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDangerous: false
    })

    const togglePin = () => {
        const next = !isPinned
        setIsPinned(next)
        localStorage.setItem('dash_nav_pinned', next)
    }

    // Initial load
    useEffect(() => {
        if (dashboards.length === 0) {
            fetchDashboards()
        }
        fetchNotes()
    }, [])

    // If we have dashboards but no active one, load the first one
    useEffect(() => {
        if (dashboards.length > 0 && !activeDashboardId) {
            loadDashboard(dashboards[0].id)
        }
    }, [dashboards, activeDashboardId])

    // When dashboard tabs load, set active tab
    useEffect(() => {
        if (dashboardTabs.length > 0) {
            const isTabInCurrent = dashboardTabs.find(t => t.id === internalActiveTabId)
            if (!isTabInCurrent || !internalActiveTabId) {
                setInternalActiveTabId(dashboardTabs[0].id)
            }
        } else {
            setInternalActiveTabId(null)
        }
    }, [dashboardTabs, internalActiveTabId]) // Added internalActiveTabId to dependency array

    const openInputModal = (title, placeholder, callback, initialValue = '') => {
        setInputModal({
            isOpen: true,
            title,
            placeholder,
            initialValue,
            onSubmit: (value) => {
                callback(value)
                setInputModal(prev => ({ ...prev, isOpen: false }))
            }
        })
    }

    const handleCreateDashboard = () => {
        openInputModal(
            language === 'fi' ? 'Luo uusi työtila' : 'Create New Workspace',
            language === 'fi' ? 'Työtilan nimi...' : 'Workspace name...',
            (title) => createDashboard(title)
        )
    }

    const handleCreateTab = () => {
        if (!activeDashboardId) return
        openInputModal(
            language === 'fi' ? 'Luo uusi välilehti' : 'Create New Tab',
            language === 'fi' ? 'Välilehden nimi...' : 'Tab name...',
            (title) => createTab(activeDashboardId, title)
        )
    }

    const [contextMenu, setContextMenu] = useState(null) // { x, y, type, id, title }

    const onContextMenu = (e, type, id, title) => {
        e.preventDefault()
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            type, // 'tab' or 'dashboard'
            id,
            title
        })
    }

    const handleRename = () => {
        if (!contextMenu) return
        const { type, id, title } = contextMenu
        setContextMenu(null)

        const label = type === 'tab'
            ? (language === 'fi' ? 'Nimeä välilehti' : 'Rename Tab')
            : (language === 'fi' ? 'Nimeä työtila' : 'Rename Workspace')

        openInputModal(
            label,
            '',
            (newTitle) => {
                if (type === 'tab') updateTab(id, { title: newTitle })
                // if(type === 'dashboard') updateDashboard(id, { title: newTitle }) // Needed store action
            },
            title
        )
    }

    const handleDelete = () => {
        if (!contextMenu) return
        const { type, id, title } = contextMenu
        setContextMenu(null)

        setConfirmModal({
            isOpen: true,
            title: language === 'fi' ? `Poista ${type === 'tab' ? 'välilehti' : 'työtila'}?` : `Delete ${type === 'tab' ? 'Tab' : 'Workspace'}?`,
            message: language === 'fi'
                ? `Haluatko varmasti poistaa "${title}"? Tätä toimintoa ei voi peruuttaa.`
                : `Are you sure you want to delete "${title}"? This cannot be undone.`,
            confirmText: language === 'fi' ? 'Poista' : 'Delete',
            cancelText: language === 'fi' ? 'Peruuta' : 'Cancel',
            isDangerous: true,
            onConfirm: () => {
                if (type === 'tab') deleteTab(id)
                else if (type === 'dashboard') { /* deleteDashboard(id) */ }
                setConfirmModal(prev => ({ ...prev, isOpen: false }))
            }
        })
    }


    const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false)

    const handleAddWidget = (type, config) => {
        if (type) {
            addWidget(type.toLowerCase(), config)
            setIsAddWidgetOpen(false)
        }
    }

    const handleTooltipEnter = (e, content) => {
        if (!content) return
        const rect = e.currentTarget.getBoundingClientRect()
        setActiveTooltip({ content, rect })
    }
    const handleTooltipLeave = () => setActiveTooltip(null)

    const currentDashboard = dashboards.find(d => d.id === activeDashboardId)
    const currentTab = dashboardTabs.find(t => t.id === internalActiveTabId)

    return (
        <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative" onClick={() => setContextMenu(null)}>

            <InputModal
                isOpen={inputModal.isOpen}
                onClose={() => setInputModal(prev => ({ ...prev, isOpen: false }))}
                title={inputModal.title}
                placeholder={inputModal.placeholder}
                initialValue={inputModal.initialValue}
                onSubmit={inputModal.onSubmit}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                {...confirmModal}
            />

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-[9999] bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 w-40 overflow-hidden animate-in fade-in duration-100"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800 mb-1">
                        {contextMenu.type === 'tab' ? (language === 'fi' ? 'Välilehti' : 'Tab') : 'Workspace'}
                    </div>
                    <button
                        onClick={handleRename}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                        {language === 'fi' ? 'Nimeä uudelleen' : 'Rename'}
                    </button>
                    <button
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                    >
                        {language === 'fi' ? 'Poista' : 'Delete'}
                    </button>
                </div>
            )}

            {/* Fixed Navigation Area (Top Left) */}
            <div className="fixed top-4 left-8 z-[100] flex items-center gap-3">
                <div className="flex items-center bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-full p-1 shadow-2xl">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-cyan-300 transition-colors hover:bg-slate-800/80 group"
                        title={language === 'fi' ? 'Suunnittelu' : 'Planning'}
                    >
                        <FileText size={16} className="text-cyan-500 group-hover:scale-110 transition-transform" />
                    </button>
                    <div className="w-px h-4 bg-slate-700 mx-1"></div>
                    <button
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/50 text-slate-500 shadow-inner"
                        title="Workspaces"
                    >
                        <Layout size={16} className="text-slate-400" />
                    </button>
                </div>

                {/* Switcher Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                        className={`flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-full max-w-[200px] overflow-hidden hover:bg-slate-800 hover:border-slate-600 transition-all group ${isSwitcherOpen ? 'ring-2 ring-indigo-500/30' : ''}`}
                    >
                        <span className="text-xs font-bold text-white truncate">
                            {currentDashboard ? currentDashboard.title : (language === 'fi' ? 'Valitse...' : 'Select...')}
                        </span>
                        <ChevronDown size={12} className={`text-slate-500 transition-transform duration-200 ${isSwitcherOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isSwitcherOpen && (
                        <>
                            {/* Backdrop to close */}
                            <div
                                className="fixed inset-0 z-[105]"
                                onClick={() => setIsSwitcherOpen(false)}
                            />
                            <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl py-2 z-[110] animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-3 py-1 mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    {language === 'fi' ? 'Työtilat' : 'Workspaces'}
                                </div>
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {dashboards.map(dash => (
                                        <button
                                            key={dash.id}
                                            onClick={() => {
                                                loadDashboard(dash.id)
                                                setIsSwitcherOpen(false)
                                            }}
                                            onContextMenu={(e) => onContextMenu(e, 'dashboard', dash.id, dash.title)}
                                            className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-slate-800 flex items-center justify-between ${dash.id === activeDashboardId ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-300'}`}
                                        >
                                            <span className="truncate">{dash.title}</span>
                                            {dash.id === activeDashboardId && <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />}
                                        </button>
                                    ))}
                                </div>
                                <div className="h-px bg-slate-700/50 my-1 mx-2"></div>
                                <button
                                    onClick={handleCreateDashboard}
                                    className="w-full text-left px-4 py-2 text-xs text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-2"
                                >
                                    <Plus size={14} />
                                    {language === 'fi' ? 'Uusi työtila' : 'New Workspace'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Top Reveal Zone */}
            <div
                className="fixed top-0 left-0 w-full h-8 z-50"
                onMouseEnter={() => setIsNavVisible(true)}
            />

            {/* Top Navigation Bar (Floating Island) */}
            <div
                className={`
                    fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-4 transition-all duration-500 ease-in-out
                    ${isNavVisible || isPinned ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
                `}
                onMouseLeave={() => setIsNavVisible(false)}
            >
                <div className="flex gap-2 p-1 bg-slate-950/90 border border-slate-800/80 rounded-full shadow-2xl backdrop-blur-3xl ring-1 ring-white/5">
                    {/* Add Widget & Present (Moved here) */}
                    <div className="flex items-center gap-1 px-1">
                        <button
                            onClick={() => setIsAddWidgetOpen(true)}
                            className="h-8 px-3 flex items-center gap-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <Plus size={14} /> {language === 'fi' ? 'Lisää widget' : 'Add Widget'}
                        </button>
                        <button className="h-8 px-3 flex items-center gap-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider transition-all border border-slate-700/50">
                            <Presentation size={14} /> {language === 'fi' ? 'Esitä' : 'Present'}
                        </button>
                    </div>

                    <div className="w-px h-5 bg-white/10 mx-1 self-center"></div>

                    {/* Dashboard/Tab Switcher */}
                    <div className="flex gap-1">
                        {dashboardTabs.map(tab => (
                            <BrowserTab
                                key={tab.id}
                                title={tab.title}
                                color={tab.color || '#60a5fa'}
                                isActive={internalActiveTabId === tab.id}
                                onClick={() => setInternalActiveTabId(tab.id)}
                                onContextMenu={(e) => onContextMenu(e, 'tab', tab.id, tab.title)}
                                iconName={tab.is_present_friendly ? 'presentation' : 'grid'}
                                language={language}
                                handleTooltipEnter={handleTooltipEnter}
                                handleTooltipLeave={handleTooltipLeave}
                            />
                        ))}
                    </div>

                    <div className="w-px h-5 bg-white/10 mx-1 self-center"></div>

                    {/* Utility Controls */}
                    <div className="flex items-center gap-1 pr-1">
                        <button
                            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                            title={language === 'fi' ? 'Uusi välilehti' : 'New Tab'}
                            onClick={handleCreateTab}
                        >
                            <Plus size={16} />
                        </button>

                        <button
                            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                            title={language === 'fi' ? 'Vaihda dashboardia' : 'Switch Dashboard'}
                            onClick={handleCreateDashboard}
                        >
                            <Settings size={16} />
                        </button>

                        {/* Pin Button */}
                        <button
                            onClick={togglePin}
                            className={`h-8 w-8 flex items-center justify-center rounded-full transition-all ${isPinned ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                            title={isPinned ? (language === 'fi' ? 'Vapauta' : 'Unpin') : (language === 'fi' ? 'Kiinnitä' : 'Pin')}
                        >
                            <Grid size={16} className={isPinned ? 'rotate-45' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Portal Tooltip */}
            {activeTooltip && (
                <div
                    className="fixed z-[9999] bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-xl pointer-events-none text-xs text-white"
                    style={{
                        top: activeTooltip.rect.bottom + 10,
                        left: activeTooltip.rect.left + (activeTooltip.rect.width / 2) - 10,
                    }}
                >
                    {activeTooltip.content}
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 pt-4 px-8 pb-8 overflow-y-auto relative">
                {/* Background ambient gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-slate-950 to-slate-950 pointer-events-none" />

                {((loadingDashboards || (dashboardTabs.length > 0 && !internalActiveTabId)) && dashboardTabs.length === 0) ? (
                    <div className="max-w-7xl mx-auto relative z-0 animate-pulse">
                        <div className="h-4 w-48 bg-slate-800 rounded-full mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-slate-900/50 rounded-3xl border border-slate-700/50"></div>
                            ))}
                        </div>
                    </div>
                ) : (loadingDashboards || (dashboardTabs.length > 0 && !internalActiveTabId)) ? (
                    <div className="max-w-7xl mx-auto relative z-0 animate-pulse">
                        <div className="h-4 w-48 bg-slate-800 rounded-full mb-8 opacity-50"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2].map(i => (
                                <div key={i} className="h-64 bg-slate-800/20 rounded-3xl border border-slate-700/30"></div>
                            ))}
                        </div>
                    </div>
                ) : currentDashboard ? (
                    <div className="max-w-7xl mx-auto relative z-0">
                        {/* Header Area (Empty or minimal to reduce space) */}
                        <div className="mb-4"></div>

                        {/* Content Rendering */}
                        <div className="min-h-[400px]">
                            {/* Pass activeTabId effectively to the child content */}
                            {children ? React.cloneElement(children, { activeTabId: internalActiveTabId }) : (
                                <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-700 rounded-3xl text-slate-200 bg-slate-900/50">
                                    No widgets configured yet.
                                </div>
                            )}
                        </div>
                    </div>
                ) : !loadingDashboards ? (
                    <div className="flex items-center justify-center h-full text-slate-300">
                        <div className="text-center p-8 bg-slate-900/50 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
                            <h2 className="text-3xl font-bold mb-4 text-white !text-white drop-shadow-md">
                                Welcome to Dashboard (Live)
                            </h2>
                            <p className="mb-8 text-slate-100 max-w-md mx-auto leading-relaxed font-medium">
                                Create your first workspace to start organizing your plans, notes, and team updates in one view.
                            </p>
                            <button
                                onClick={handleCreateDashboard}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold transition-all shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95"
                            >
                                + Create New Dashboard
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>

            <AddWidgetModal
                isOpen={isAddWidgetOpen}
                onClose={() => setIsAddWidgetOpen(false)}
                onAdd={handleAddWidget}
            />
        </div>
    )
}
