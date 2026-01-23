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
    }
}
