import React, { useState, useEffect, useMemo } from 'react'
import { Layout } from 'lucide-react'
import { DashboardLayout } from './DashboardLayout'
import { useStore } from '../../store'
import { Widget } from './Widget'
import { NotesWidget, StatsWidget, CalendarWidget, StickiesWidget } from './widgets'
import { PlanWidget } from './widgets/PlanWidget'
import { PlanReaderModal } from './PlanReaderModal'
import { Responsive } from 'react-grid-layout'

// RGL Styles
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

// Custom WidthProvider since the one from RGL is missing in v2.2.2 dist
const WidthProvider = (WrappedComponent) => {
    return (props) => {
        const [width, setWidth] = React.useState(1200)
        const elementRef = React.useRef(null)
        const [mounted, setMounted] = React.useState(false)

        React.useEffect(() => {
            setMounted(true)
            const element = elementRef.current
            if (!element) return

            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    setWidth(entry.contentRect.width)
                }
            })

            resizeObserver.observe(element)
            // Initial set
            setWidth(element.offsetWidth)

            return () => resizeObserver.disconnect()
        }, [])

        return (
            <div ref={elementRef} className={props.className} style={{ ...props.style, width: '100%' }}>
                {mounted && <WrappedComponent {...props} width={width} />}
            </div>
        )
    }
}

const ResponsiveGridLayout = WidthProvider(Responsive)

export const DashboardPage = () => {
    return (
        <DashboardLayout>
            <DashboardContent />
        </DashboardLayout>
    )
}

const DashboardContent = ({ activeTabId }) => {
    const { dashboardTabs, updateDashboardLayout, loadingDashboards, deleteWidget, language } = useStore()
    const activeTab = dashboardTabs.find(t => t.id === activeTabId)

    // Reader Modal State
    const [selectedPlan, setSelectedPlan] = useState(null)

    // Layout configuration
    const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
    const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }

    const onLayoutChange = (layout, layouts) => {
        const updates = {}
        layout.forEach(item => {
            updates[item.i] = {
                x: item.x,
                y: item.y,
                w: item.w,
                h: item.h
            }
        })
        updateDashboardLayout(updates)
    }

    // 1. Loading State
    if (loadingDashboards && dashboardTabs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-medium animate-pulse">Ladataan työtilaa...</p>
            </div>
        )
    }

    // 2. No Tabs State
    if (dashboardTabs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800 p-8 shadow-2xl">
                <div className="bg-indigo-500/10 p-6 rounded-3xl mb-6 ring-1 ring-indigo-500/20">
                    <Layout className="w-12 h-12 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Tämä työtila on vielä tyhjä</h3>
                <p className="text-slate-400 text-center max-w-sm mb-8 leading-relaxed">
                    Dashboardit koostuvat <b>välilehdistä</b> (kuten sivut kirjassa).
                    Lisää ensimmäinen välilehti yläpalkin <span className="text-indigo-400 font-bold">+</span> painikkeesta.
                </p>
                <div className="flex gap-4 text-xs font-mono opacity-50 uppercase tracking-widest">
                    <span>1. Välilehti (Sivu)</span>
                    <span>→</span>
                    <span>2. Widgetit (Sisältö)</span>
                </div>
            </div>
        )
    }

    // 3. Tab selected but widgets missing / loading activeTab
    if (!activeTab) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin"></div>
            </div>
        )
    }

    // Prepare layout array for RGL
    // { i: 'id', x: 0, y: 0, w: 1, h: 1 }
    // Transform our widgets to RGL layout items
    const currentLayout = (activeTab.widgets || []).map(widget => ({
        i: widget.id,
        x: widget.layout?.x || 0,
        y: widget.layout?.y || 0,
        w: widget.layout?.w || 4, // Default width (e.g. 1/3 of 12 cols)
        h: widget.layout?.h || 4, // Default height
        minW: 2,
        minH: 2
    }))

    // Widget Delete Confirmation
    const [widgetToDelete, setWidgetToDelete] = useState(null)

    const handleDeleteWidget = (widgetId) => {
        setWidgetToDelete(widgetId)
    }

    const confirmDeleteWidget = async () => {
        if (widgetToDelete) {
            await deleteWidget(widgetToDelete)
            setWidgetToDelete(null)
        }
    }

    // Confirmation Modal for Widget
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    useEffect(() => {
        setConfirmModalOpen(!!widgetToDelete)
    }, [widgetToDelete])

    // Reuse existing ConfirmationModal if possible, but we need to import it or recreate it?
    // DashboardLayout has ConfirmationModal. We can import it from parent or reuse.
    // Let's assume we can import it from shared location or DashboardLayout exports it?
    // DashboardLayout exports { ConfirmationModal }. Let's check imports.
    // DashboardLayout.jsx exports ConfirmationModal? No, it imports it.
    // We need to import ConfirmationModal from './ConfirmationModal'.

    return (
        <div className="min-h-[500px] text-white p-4 sm:p-10 relative">

            {/* Reuse ConfirmationModal component if imported, or creating a simple one here for now if not available easily */}
            {widgetToDelete && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-white mb-2">
                            {language === 'fi' ? 'Poista widget?' : 'Delete Widget?'}
                        </h3>
                        <p className="text-slate-400 text-sm mb-6">
                            {language === 'fi'
                                ? 'Haluatko varmasti poistaa tämän widgetin työtilasta?'
                                : 'Are you sure you want to remove this widget from the workspace?'}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setWidgetToDelete(null)}
                                className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                            >
                                {language === 'fi' ? 'Peruuta' : 'Cancel'}
                            </button>
                            <button
                                onClick={confirmDeleteWidget}
                                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium shadow-lg shadow-red-500/20 transition-colors"
                            >
                                {language === 'fi' ? 'Poista' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedPlan && (
                <PlanReaderModal
                    note={selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                />
            )}

            {activeTab.widgets && activeTab.widgets.length > 0 ? (
                <ResponsiveGridLayout
                    className="layout"
                    layouts={{ lg: currentLayout }} // We feed the same layout for now, RGL handles responsiveness if we provided separate layouts
                    breakpoints={breakpoints}
                    cols={cols}
                    rowHeight={60}
                    draggableHandle=".widget-drag-handle"
                    onLayoutChange={onLayoutChange}
                    isDraggable={true}
                    isResizable={true}
                    compactType="vertical"
                >
                    {activeTab.widgets.map(widget => ( // The key here must match 'i' in layout
                        <div key={widget.id} data-grid={{
                            x: widget.layout?.x || 0,
                            y: widget.layout?.y || 0,
                            w: widget.layout?.w || 4,
                            h: widget.layout?.h || 4
                        }}>
                            <Widget
                                title={getTitle(widget.type, widget.config)}
                                color={widget.config?.color || '#60a5fa'}
                                {...widget.config}
                                type={widget.type}
                                className="h-full"
                                onDelete={() => handleDeleteWidget(widget.id)}
                            >
                                {widget.type === 'notes' && (
                                    <NotesWidget
                                        onOpen={(note) => setSelectedPlan(note)}
                                    />
                                )}
                                {widget.type === 'sticky' && (
                                    <StickiesWidget
                                        id={widget.id}
                                        data={widget}
                                    />
                                )}
                                {widget.type === 'calendar' && <CalendarWidget />}
                                {widget.type === 'stats' && <StatsWidget />}
                                {widget.type === 'plan_viewer' && (
                                    <PlanWidget
                                        id={widget.id}
                                        data={widget}
                                        onOpen={(note) => setSelectedPlan(note)}
                                    />
                                )}
                                {!['notes', 'calendar', 'stats', 'plan_viewer'].includes(widget.type) && (
                                    <div className="flex items-center justify-center h-full text-slate-500">
                                        WIP: {widget.type}
                                    </div>
                                )}
                            </Widget>
                        </div>
                    ))}
                </ResponsiveGridLayout>
            ) : (
                <div className="flex items-center justify-center h-40 bg-slate-900/80 rounded-3xl border border-dashed border-slate-700 text-slate-200 text-lg font-medium">
                    {activeTab.title} is empty. Add a widget!
                </div>
            )}
        </div>
    )
}

// Helper to get friendly title if not set in config
function getTitle(type, config) {
    switch (type) {
        case 'notes': return 'Viimeisimmät'
        case 'stats': return 'Tilastot'
        case 'calendar': return 'Kalenteri'
        case 'sticky': return 'Muistilappu'
        case 'plan_viewer': return 'Suunnitelma'
        default: return type
    }
}
