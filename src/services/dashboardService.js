import { supabase } from '../supabase'

export const DashboardService = {
    // Dashboards
    async getDashboards() {
        // Fetch own and shared dashboards
        const { data, error } = await supabase
            .from('dashboards')
            .select(`
                *,
                dashboard_permissions (role)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    async createDashboard(title) {
        const { data, error } = await supabase
            .from('dashboards')
            .insert({ title, owner_id: (await supabase.auth.getUser()).data.user.id })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async getDashboardDetails(dashboardId) {
        // Fetch tabs and widgets for a dashboard
        const { data: tabs, error: tabsError } = await supabase
            .from('dashboard_tabs')
            .select(`
                *,
                widgets (*)
            `)
            .eq('dashboard_id', dashboardId)
            .order('order_index')

        if (tabsError) throw tabsError
        return tabs // Returns tabs with their widgets nested
    },

    // Tabs
    async createTab(dashboardId, title, orderIndex, color) {
        const { data, error } = await supabase
            .from('dashboard_tabs')
            .insert({ dashboard_id: dashboardId, title, order_index: orderIndex, color })
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Widgets
    async createWidget(tabId, type, layout = {}, config = {}) {
        const { data, error } = await supabase
            .from('widgets')
            .insert({ tab_id: tabId, type, layout, config })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateWidget(widgetId, updates) {
        const { data, error } = await supabase
            .from('widgets')
            .update(updates)
            .eq('id', widgetId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateWidgetsLayout(updates) {
        // updates: { id: string, layout: object }[]
        // Supabase doesn't support bulk update with different values easily in client-js
        // We'll use upsert if we have enough data, or just loop updates.
        // Looping is fine for small number of widgets (<50)

        // Optimistic approach: we don't wait for response for each
        const promises = updates.map(update =>
            supabase
                .from('widgets')
                .update({ layout: update.layout })
                .eq('id', update.id)
        )

        const results = await Promise.all(promises)
        const errors = results.filter(r => r.error).map(r => r.error)

        if (errors.length > 0) {
            console.error('Errors updating layouts:', errors)
            throw errors[0]
        }

        return true
    }
}
