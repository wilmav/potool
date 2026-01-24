import React, { useState, useEffect, useMemo } from 'react'
import { DashboardLayout } from './DashboardLayout'
import { useStore } from '../../store'
import { Widget } from './Widget'
import { NotesWidget, StatsWidget, CalendarWidget } from './widgets'
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
    const { dashboardTabs, updateDashboardLayout } = useStore()
    const activeTab = dashboardTabs.find(t => t.id === activeTabId)

    // Layout configuration
    // lg: 1200px (3 cols in old grid, let's say 12 cols in RGL for flexibility)
    // md: 996px
    // sm: 768px
    // xs: 480px
    const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
    const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }

    const onLayoutChange = (layout, layouts) => {
        // Collect updates
        // RGL returns array of objects {i, x, y, w, h}
        const updates = {}
        layout.forEach(item => {
            updates[item.i] = {
                x: item.x,
                y: item.y,
                w: item.w,
                h: item.h
            }
        })

        // Optimistic update
        updateDashboardLayout(updates)
    }

    if (!activeTab) return null

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

    return (
        <div className="min-h-[500px] text-white p-4 sm:p-10">
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
                                title={getTitle(widget.type)}
                                color={widget.config?.color || '#60a5fa'}
                                {...widget.config}
                                type={widget.type}
                                className="h-full"
                            >
                                {widget.type === 'notes' && <NotesWidget />}
                                {widget.type === 'calendar' && <CalendarWidget />}
                                {widget.type === 'stats' && <StatsWidget />}
                                {!['notes', 'calendar', 'stats'].includes(widget.type) && (
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
function getTitle(type) {
    switch (type) {
        case 'notes': return 'Viimeisimmät'
        case 'stats': return 'Tilastot'
        case 'calendar': return 'Kalenteri'
        default: return type
    }
}
