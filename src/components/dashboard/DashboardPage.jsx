import React, { useState, useEffect, useMemo } from 'react'
import { DashboardLayout } from './DashboardLayout'
import { useStore } from '../../store'
import { Widget } from './Widget'
import { NotesWidget, StatsWidget, CalendarWidget } from './widgets'

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

    console.log('DashboardContent debug:', { activeTabId, tabCount: dashboardTabs.length, activeTab })

    // Layout logic was removed as we are currently using CSS Grid
    // Can be re-added when we switch to React-Grid-Layout

    if (!activeTab) return null

    return (
        <div className="min-h-[500px] text-white p-10">
            {activeTab.widgets && activeTab.widgets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeTab.widgets.map(widget => (
                        <div key={widget.id} className={`
                            ${widget.layout?.w >= 2 ? 'col-span-2' : 'col-span-1'}
                            ${widget.layout?.h >= 2 ? 'row-span-2' : 'row-span-1'}
                        `}>
                            <Widget
                                title={getTitle(widget.type)}
                                color={widget.config?.color || '#60a5fa'}
                                {...widget.config}
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
                </div>
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
