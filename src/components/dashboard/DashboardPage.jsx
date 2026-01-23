import React, { useState } from 'react'
import { DashboardLayout } from './DashboardLayout'
import { useStore } from '../../store'

export const DashboardPage = () => {
    // This component will eventually act as the "Widget Grid" controller
    return (
        <DashboardLayout>
            <DashboardContent />
        </DashboardLayout>
    )
}

const DashboardContent = ({ activeTabId }) => {
    const { dashboardTabs } = useStore()
    const activeTab = dashboardTabs.find(t => t.id === activeTabId)

    if (!activeTab) return null

    // Here we will eventually map over activeTab.widgets and render them
    // For now, let's keep it simple to verify Layout integration

    return (
        <div className="grid grid-cols-4 auto-rows-[200px] gap-6">
            {/* Placeholder for Widgets */}
            {activeTab.widgets && activeTab.widgets.length > 0 ? (
                activeTab.widgets.map(widget => (
                    <div key={widget.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-white">
                        Widget: {widget.type}
                    </div>
                ))
            ) : (
                <div className="col-span-4 flex items-center justify-center h-40 bg-slate-900/80 rounded-3xl border border-dashed border-slate-700 text-slate-200 text-lg font-medium">
                    {activeTab.title} is empty. Add a widget!
                </div>
            )}
        </div>
    )
}
