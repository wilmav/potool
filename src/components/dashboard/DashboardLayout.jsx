import React, { useEffect, useState } from 'react'
import { useStore } from '../../store'
import { Plus, Layout, Settings, Grid, Presentation, Hash } from 'lucide-react' // Using lucide-react now as it helps consistency

// Helper to map icons string to Component
const IconMap = {
    'grid': Grid,
    'presentation': Presentation,
    'layout': Layout,
    'hash': Hash
}

const BrowserTab = ({ title, isActive, color, onClick, iconName }) => {
    const Icon = IconMap[iconName] || Grid

    return (
        <button
            onClick={onClick}
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
        dashboards,
        activeDashboardId,
        dashboardTabs,
        fetchDashboards,
        createDashboard,
        loadDashboard,
        addWidget
    } = useStore()

    console.log('DashboardLayout rendered', {
        dashboardsCount: dashboards.length,
        activeDashboardId,
        dashboardTabsCount: dashboardTabs.length
    })

    const [activeTabId, setActiveTabId] = useState(null)

    // Initial load
    useEffect(() => {
        if (dashboards.length === 0) {
            fetchDashboards()
        }
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

    const handleAddWidget = async () => {
        const type = prompt("Lisää widget (notes, stats, calendar):", "notes")
        if (type) {
            await addWidget(type.toLowerCase())
        }
    }

    const currentDashboard = dashboards.find(d => d.id === activeDashboardId)
    const currentTab = dashboardTabs.find(t => t.id === activeTabId)

    return (
        <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">

            {/* Top Navigation Bar (Floating Island) */}
            <div className="flex justify-center pt-6 pb-2 relative z-10">
                <div className="flex gap-2 p-1.5 bg-slate-900/80 border border-slate-700/50 rounded-full shadow-2xl backdrop-blur-xl">

                    {/* Dashboard/Tab Switcher Logic - For now showing Tabs of current dashboard */}
                    {dashboardTabs.map(tab => (
                        <BrowserTab
                            key={tab.id}
                            title={tab.title}
                            color={tab.color || '#60a5fa'} // Default blue
                            isActive={activeTabId === tab.id}
                            onClick={() => setActiveTabId(tab.id)}
                            iconName={tab.is_present_friendly ? 'presentation' : 'grid'}
                        />
                    ))}

                    <div className="w-px h-6 bg-white/10 mx-2 self-center"></div>

                    {/* Add Tab Button (Mockup for now) */}
                    <button
                        className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all hover:rotate-90"
                        title="Create new tab"
                        onClick={() => alert("Tab creation coming soon!")}
                    >
                        <Plus size={20} />
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2 self-center"></div>
                    <button
                        className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        title="Switch Dashboard"
                        onClick={handleCreateDashboard}
                    >
                        <Layout size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 overflow-y-auto relative">
                {/* Background ambient gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-slate-950 to-slate-950 pointer-events-none" />

                {currentDashboard ? (
                    <div className="max-w-7xl mx-auto relative z-0">
                        {/* Header Area */}
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-4">
                                <div className="box-content p-1 border-2 border-slate-700 rounded-full">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: currentTab?.color || '#60a5fa' }}
                                    ></div>
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold tracking-tight text-white">
                                        {currentTab ? currentTab.title : currentDashboard.title}
                                    </h1>
                                    <p className="text-slate-300 mt-1 text-sm font-medium">
                                        {currentDashboard.title} • Updated just now
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-sm font-bold transition-all border border-slate-700/50 flex gap-2 items-center hover:shadow-lg active:scale-95 text-slate-300">
                                    <Presentation size={18} /> Present
                                </button>
                                <button
                                    onClick={handleAddWidget}
                                    className="px-5 py-2.5 bg-white text-black hover:bg-slate-200 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all hover:-translate-y-1 active:translate-y-0 active:scale-95"
                                >
                                    + Add Widget
                                </button>
                            </div>
                        </div>

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
