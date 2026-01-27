import React, { useEffect, useState } from 'react'
import { useStore } from '../../store'
import { Plus, Layout, Settings, Grid, Presentation, Hash, FileText, ChevronUp, ChevronDown } from 'lucide-react'
import { AddWidgetModal } from './AddWidgetModal' // New import

// Helper to map icons string to Component
const IconMap = {
    'grid': Grid,
    'presentation': Presentation,
    'layout': Layout,
    'hash': Hash
}

const BrowserTab = ({ title, isActive, color, onClick, iconName, language, handleTooltipEnter, handleTooltipLeave }) => {
    const Icon = IconMap[iconName] || Grid

    return (
        <button
            onClick={onClick}
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
                color: isActive ? '#000' : '#e2e8f0', // Dark text on active, slate-200 on inactive
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
        fetchDashboards,
        createDashboard,
        loadDashboard,
        addWidget,
        fetchNotes
    } = useStore()

    console.log('DashboardLayout rendered', {
        dashboardsCount: dashboards.length,
        activeDashboardId,
        dashboardTabsCount: dashboardTabs.length
    })

    const [activeTabId, setActiveTabId] = useState(null)
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)
    const [activeTooltip, setActiveTooltip] = useState(null)
    const [isNavVisible, setIsNavVisible] = useState(false)
    const [isPinned, setIsPinned] = useState(() => {
        return localStorage.getItem('dash_nav_pinned') === 'true'
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
        fetchNotes() // Ensure notes are available for widget modal
    }, [])

    // If we have dashboards but no active one, load the first one
    useEffect(() => {
        if (dashboards.length > 0 && !activeDashboardId) {
            loadDashboard(dashboards[0].id)
        }
    }, [dashboards, activeDashboardId])

    // When dashboard tabs load, set active tab to first one if not set
    useEffect(() => {
        if (dashboardTabs.length > 0 && !activeTabId) {
            setActiveTabId(dashboardTabs[0].id)
        }
    }, [dashboardTabs, activeTabId])

    const handleCreateDashboard = async () => {
        const title = prompt("Anna uudelle dashboardille nimi:")
        if (title) {
            await createDashboard(title)
        }
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
    const currentTab = dashboardTabs.find(t => t.id === activeTabId)

    return (
        <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative">

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
                        title="Dashboard"
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
                        <div
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: currentTab?.color || '#60a5fa' }}
                        ></div>
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
                                            className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-slate-800 flex items-center justify-between ${dash.id === activeDashboardId ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-300'}`}
                                        >
                                            <span className="truncate">{dash.title}</span>
                                            {dash.id === activeDashboardId && <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />}
                                        </button>
                                    ))}
                                </div>
                                <div className="h-px bg-slate-700/50 my-1 mx-2"></div>
                                <button
                                    onClick={() => {
                                        const title = prompt(language === 'fi' ? 'Dashboardin nimi:' : 'Dashboard name:')
                                        if (title) createDashboard(title)
                                        setIsSwitcherOpen(false)
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-2"
                                >
                                    <Plus size={14} />
                                    {language === 'fi' ? 'Uusi Dashboard' : 'New Dashboard'}
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
                                isActive={activeTabId === tab.id}
                                onClick={() => setActiveTabId(tab.id)}
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
                            onClick={() => alert("Tab creation coming soon!")}
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

            {/* Add Widget Modal */}
            <AddWidgetModal
                isOpen={isAddWidgetOpen}
                onClose={() => setIsAddWidgetOpen(false)}
                onAdd={handleAddWidget}
            />

            {/* Main Content Area */}
            <div className="flex-1 pt-4 px-8 pb-8 overflow-y-auto relative">
                {/* Background ambient gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-slate-950 to-slate-950 pointer-events-none" />

                {currentDashboard ? (
                    <div className="max-w-7xl mx-auto relative z-0">
                        {/* Header Area (Empty or minimal to reduce space) */}
                        <div className="mb-4"></div>

                        {/* Content Rendering */}
                        <div className="min-h-[400px]">
                            {/* Pass activeTabId effectively to the child content */}
                            {children ? React.cloneElement(children, { activeTabId }) : (
                                <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-700 rounded-3xl text-slate-200 bg-slate-900/50">
                                    No widgets configured yet.
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
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
                )}
            </div>
        </div>
    )
}
