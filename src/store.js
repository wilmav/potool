import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from './supabase'

export const useStore = create(persist((set, get) => ({
    // Language State
    language: 'fi',

    // Auth State
    user: null,
    setUser: (user) => set({ user }),

    // Bullet Library State
    bullets: [],
    loadingBullets: false,

    fetchBullets: async () => {
        set({ loadingBullets: true })

        try {
            const { data, error } = await supabase
                .from('bullet_templates')
                .select('*')

            if (error) {
                console.warn('Fetch bullets warning:', error.message)
            } else if (data) {
                // Init bullets with default state (not active, not hidden)
                // In future: Merge with 'user_selected_bullets' table
                const initializedData = data.map(b => ({ ...b, is_active: false, is_hidden: false }))
                set({ bullets: initializedData })
            }
        } catch (err) {
            console.error('Unexpected error fetching bullets:', err)
        }
        set({ loadingBullets: false })
    },

    // Actions
    toggleBulletActive: (id) => set((state) => ({
        bullets: state.bullets.map((b) =>
            b.id === id ? { ...b, is_active: !b.is_active } : b
        ),
    })),

    hideBullet: (id) => set((state) => ({
        bullets: state.bullets.map((b) =>
            b.id === id ? { ...b, is_hidden: true } : b
        ),
    })),

    unhideBullet: (id) => set((state) => ({
        bullets: state.bullets.map((b) =>
            b.id === id ? { ...b, is_hidden: false } : b
        ),
    })),

    // Note State
    noteContent: '',
    noteTitle: '', // Start empty, placeholder will handle it
    noteSummary: '', // NEW: Summary field
    activeNoteId: null,
    notes: [], // List of available notes { id, title, updated_at ... }
    isSaving: false,

    setNoteContent: (content) => set({ noteContent: content }),
    setNoteTitle: (title) => set({ noteTitle: title }),
    setNoteSummary: (summary) => set({ noteSummary: summary }), // NEW: Setter

    categoryColors: {},
    setCategoryColor: (topic, color) => {
        set(state => ({
            categoryColors: { ...state.categoryColors, [topic]: color }
        }))
        get().saveUserSettings()
    },

    recentColors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ffffff'],
    addRecentColor: (color) => {
        set(state => {
            const newColors = [color, ...state.recentColors.filter(c => c !== color)].slice(0, 10)
            return { recentColors: newColors }
        })
        get().saveUserSettings()
    },
    removeRecentColor: (color) => {
        set(state => ({
            recentColors: state.recentColors.filter(c => c !== color)
        }))
        get().saveUserSettings()
    },

    setLanguage: (lang) => {
        set({ language: lang })
        get().saveUserSettings()
    },

    fetchUserSettings: async () => {
        const { user } = get()
        if (!user) return
        const { data } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single()
        if (data) {
            set({
                categoryColors: data.category_colors || {},
                language: data.language || 'fi',
                recentColors: data.recent_colors || ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ffffff']
            })
        }
    },

    saveUserSettings: async () => {
        const { user, categoryColors, language, recentColors } = get()
        if (!user) return
        await supabase.from('user_settings').upsert({
            user_id: user.id,
            category_colors: categoryColors,
            language: language,
            recent_colors: recentColors
        })
    },

    // Content Insertion Trigger
    insertionTrigger: 0,
    insertedContent: null, // { text, type, color }

    addToNote: (text, type = 'h2', color = null) => set((state) => {
        // We don't update noteContent string directly anymore to avoid overwriting editor state blindy.
        // Instead, we signal the editor to insert this content.
        return {
            insertionTrigger: Date.now(),
            insertedContent: { text, type, color }
        }
    }),

    // Cloud Actions
    versions: [], // List of versions for active note
    sidebarVersions: {}, // Cache for sidebar expansion: { [noteId]: version[] }
    isManualSaving: false,

    fetchNotes: async () => {
        const { user } = get()
        if (!user) return

        const { data } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .is('deleted_at', null) // Filter not deleted
            .order('updated_at', { ascending: false })

        if (data) set({ notes: data })
    },

    createNote: async () => {
        const { user, notes, language } = get()
        if (!user) return

        // 1. Determine base default title
        const baseTitle = language === 'fi' ? 'Nimetön suunnitelma' : 'Untitled Plan'
        let finalTitle = baseTitle

        // 2. Check for duplicates and auto-increment
        // We filter notes to find those that start with the baseTitle
        // We need a loop or regex to find the next available number
        // Simple approach: Check exact match, then append 2, 3, 4...

        const existingTitles = new Set(notes.map(n => n.title))

        if (existingTitles.has(finalTitle)) {
            let counter = 2
            while (existingTitles.has(`${baseTitle} ${counter}`)) {
                counter++
            }
            finalTitle = `${baseTitle} ${counter}`
        }

        const { data, error } = await supabase
            .from('notes')
            .insert({
                user_id: user.id,
                title: finalTitle,
                content: ''
            })
            .select()
            .single()

        if (!error && data) {
            console.log('Created note:', { id: data.id, title: data.title })
            set(state => ({
                activeNoteId: data.id,
                noteTitle: data.title,
                noteContent: data.content,
                noteSummary: '', // Reset summary for new note
                notes: [data, ...state.notes],
                versions: []
            }))
        }
    },

    loadNote: async (id) => {
        set({ isSaving: true })
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('id', id)
            .single()

        if (!error && data) {
            set(state => ({
                activeNoteId: data.id,
                noteContent: data.content || '',
                noteTitle: data.title,
                noteSummary: data.summary || '', // NEW: Load summary
                isSaving: false,
                // Synchronize the notes list with the fresh data from the single fetch
                // This fixes issues where the list might be stale (e.g. after restore)
                notes: state.notes.map(n => n.id === data.id ? { ...n, ...data } : n)
            }))
            get().fetchVersions(id)
        } else {
            set({ isSaving: false })
        }
    },

    saveNote: async (isManual = false) => {
        const { activeNoteId, noteContent, noteTitle, noteSummary, user } = get()
        if (!user) return

        set({ isSaving: true })
        if (isManual) set({ isManualSaving: true })

        if (activeNoteId) {
            // Update existing note (Draft)
            const { error } = await supabase
                .from('notes')
                .update({
                    content: noteContent,
                    title: noteTitle,
                    summary: noteSummary, // NEW: Save summary
                    updated_at: new Date()
                })
                .eq('id', activeNoteId)

            if (!error) {
                // Update list locally
                set(state => ({
                    notes: state.notes.map(n =>
                        n.id === activeNoteId
                            ? { ...n, title: noteTitle, summary: noteSummary, updated_at: new Date() } // NEW: Update local list with summary
                            : n
                    ).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                }))

                // If Manual Save, create a Version Snapshot
                if (isManual) {
                    const { error: versionError } = await supabase
                        .from('note_versions')
                        .insert({
                            note_id: activeNoteId,
                            title: noteTitle,
                            content: noteContent,
                            summary: noteSummary // NEW: Save summary to version
                        })

                    if (versionError) {
                        console.error('Error creating version:', versionError)
                    } else {
                        // Refresh versions list
                        get().fetchVersions(activeNoteId)
                    }
                }
            }
        } else {
            // Create new (First Save)
            const { data, error } = await supabase
                .from('notes')
                .insert({
                    user_id: user.id,
                    title: noteTitle,
                    content: noteContent,
                    summary: noteSummary // NEW: Create with summary
                })
                .select()
                .single()

            if (!error && data) {
                set(state => ({
                    activeNoteId: data.id,
                    notes: [data, ...state.notes]
                }))
                // If Manual Save on first create, also create version
                if (isManual) {
                    const { error: versionError } = await supabase
                        .from('note_versions')
                        .insert({
                            note_id: data.id,
                            title: noteTitle,
                            content: noteContent,
                            summary: noteSummary // NEW: Save summary to version
                        })

                    if (versionError) {
                        console.error('Error creating version:', versionError)
                    } else {
                        get().fetchVersions(data.id)
                    }
                }
            }
        }
        set({ isSaving: false, isManualSaving: false })
    },

    fetchVersions: async (noteId) => {
        const { data, error } = await supabase
            .from('note_versions')
            .select('*')
            .eq('note_id', noteId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching versions:', error)
        }
        if (data) set({ versions: data })
    },

    fetchSidebarVersions: async (noteId) => {
        const { sidebarVersions } = get()
        // If already cached, don't refetch (unless we want to force refresh? For now cache is enough)
        if (sidebarVersions[noteId]) return

        const { data, error } = await supabase
            .from('note_versions')
            .select('*')
            .eq('note_id', noteId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching sidebar versions:', error)
            return
        }

        if (data) {
            set(state => ({
                sidebarVersions: {
                    ...state.sidebarVersions,
                    [noteId]: data
                }
            }))
        }
    },

    versionTimestamp: null,

    restoreVersion: async (version) => {
        set({
            noteTitle: version.title,
            noteContent: version.content,
            noteSummary: version.summary || '', // NEW: Restore summary
            versionTimestamp: Date.now()
        })
        // Immediately save as current draft
        await get().saveNote(true)
    },

    // NEW: Special action to update summary
    updateQuickSummary: async (newSummary) => {
        set({ noteSummary: newSummary })
        // Trigger save to update main note
        await get().saveNote()
    },

    // Trash State
    trashNotes: [],
    loadingTrash: false,

    fetchTrash: async () => {
        set({ loadingTrash: true })
        const { user } = get()
        if (!user) return

        // Fetch deleted Notes
        const { data: notes, error: notesError } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false })

        // Fetch deleted Versions
        // We need to join with notes to ensure we only get user's versions
        // But RLS should handle that if we trust it. 
        // For safety, let's verify note ownership via RLS policy or implicit join
        const { data: versions, error: versionsError } = await supabase
            .from('note_versions')
            .select('*, notes!inner(user_id)') // Use inner join to filter by user
            .eq('notes.user_id', user.id)
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false })

        if (notesError) console.error('Error fetching trash notes:', notesError)
        if (versionsError) console.error('Error fetching trash versions:', versionsError)

        const allTrash = [
            ...(notes || []).map(n => ({ ...n, type: 'note' })),
            ...(versions || []).map(v => ({ ...v, type: 'version' }))
        ].sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at))

        set({ trashNotes: allTrash, loadingTrash: false })
    },

    softDeleteNotes: async (items) => {
        // items: { id: string, type: 'note' | 'version' }[]
        const noteIds = items.filter(i => i.type === 'note').map(i => i.id)
        const versionIds = items.filter(i => i.type === 'version').map(i => i.id)

        const now = new Date().toISOString()

        if (noteIds.length > 0) {
            await supabase.from('notes').update({ deleted_at: now }).in('id', noteIds)
            // Update local state: allow "undo" by just refreshing or filtering locally?
            // Local update for immediate feedback:
            set(state => {
                const isActiveDeleted = state.activeNoteId && noteIds.includes(state.activeNoteId)
                return {
                    notes: state.notes.filter(n => !noteIds.includes(n.id)),
                    activeNoteId: isActiveDeleted ? null : state.activeNoteId,
                    noteContent: isActiveDeleted ? '' : state.noteContent,
                    currentNote: isActiveDeleted ? null : state.currentNote // Also clear the note object
                }
            })
        }

        if (versionIds.length > 0) {
            await supabase.from('note_versions').update({ deleted_at: now }).in('id', versionIds)
            // Local update for sidebar versions
            set(state => {
                const newSidebarVersions = { ...state.sidebarVersions }
                for (const noteId in newSidebarVersions) {
                    newSidebarVersions[noteId] = newSidebarVersions[noteId].filter(v => !versionIds.includes(v.id))
                }
                return { sidebarVersions: newSidebarVersions, versions: state.versions.filter(v => !versionIds.includes(v.id)) }
            })
        }

        // Refresh trash if it's open could be good, but we might not need to if we just push to it.
        // For now, let's assume we fetch trash when opening it.
    },

    restoreNotes: async (items) => {
        const { notes, trashNotes, language } = get()
        const noteIds = items.filter(i => i.type === 'note').map(i => i.id)
        const versionIds = items.filter(i => i.type === 'version').map(i => i.id)

        if (noteIds.length > 0) {
            // Check for title collisions
            const existingTitles = new Set(notes.map(n => n.title))
            const notesToRestore = trashNotes.filter(n => noteIds.includes(n.id) && n.type === 'note')

            for (const note of notesToRestore) {
                if (existingTitles.has(note.title)) {
                    // Collision detected
                    const baseTitle = note.title
                    let newTitle = `${baseTitle} (${language === 'fi' ? 'Palautettu' : 'Restored'})`
                    let counter = 2

                    // Ensure unique restored name
                    while (existingTitles.has(newTitle)) {
                        newTitle = `${baseTitle} (${language === 'fi' ? 'Palautettu' : 'Restored'} ${counter})`
                        counter++
                    }

                    // Rename in DB before restoring
                    await supabase.from('notes').update({ title: newTitle }).eq('id', note.id)
                }
            }

            await supabase.from('notes').update({ deleted_at: null }).in('id', noteIds)
            // Cascade restore: automatically restore ALL versions for these notes
            // This ensures that if a user restores a plan, they get their version history back
            await supabase.from('note_versions').update({ deleted_at: null }).in('note_id', noteIds)
        }
        if (versionIds.length > 0) {
            await supabase.from('note_versions').update({ deleted_at: null }).in('id', versionIds)
        }

        // Refetch everything to be safe
        await get().fetchNotes()
        await get().fetchTrash()
        // Clear sidebar cache to ensure restored versions are re-fetched
        set({ sidebarVersions: {} })
    },

    permanentDeleteNotes: async (items) => {
        const noteIds = items.filter(i => i.type === 'note').map(i => i.id)
        const versionIds = items.filter(i => i.type === 'version').map(i => i.id)

        if (noteIds.length > 0) {
            await supabase.from('notes').delete().in('id', noteIds)
        }
        if (versionIds.length > 0) {
            await supabase.from('note_versions').delete().in('id', versionIds)
        }
        get().fetchTrash()
    },

    // Translation State & Action
    isTranslating: false,

    translateNoteContent: async (targetLangCode) => {
        const { noteContent, language } = get()
        if (!noteContent) return

        set({ isTranslating: true })

        try {
            // Determine language pair
            // Use provided targetLangCode, or fallback to inverse of current UI language
            let targetLang = targetLangCode
            if (!targetLang) {
                targetLang = language === 'fi' ? 'fi' : 'en'
            }

            const langPair = `AUTODETECT|${targetLang}`

            // Split by paragraphs to respect API limits better
            const paragraphs = noteContent.split('\n\n')

            const translatedParagraphs = await Promise.all(paragraphs.map(async (para) => {
                if (!para.trim()) return para

                // If it's a header (starts with #), we keep the structure but translate the text
                // MyMemory handles punctuation usually well.

                const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(para)}&langpair=${langPair}`)
                const data = await response.json()

                if (data.responseStatus === 200) {
                    return data.responseData.translatedText
                } else {
                    console.warn('Translation error for paragraph:', data.responseDetails)
                    return para // Fallback to original
                }
            }))

            set({ noteContent: translatedParagraphs.join('\n\n') })

        } catch (error) {
            console.error('Translation failed:', error)
        } finally {
            set({ isTranslating: false })
        }
    },
    // Dashboard State
    dashboards: [],
    loadingDashboards: false,
    activeDashboardId: null,
    dashboardTabs: [], // Tabs for the active dashboard (with nested widgets)
    tabsLoadedForDashboardId: null, // Track which dashboard the tabs belong to

    fetchDashboards: async () => {
        set({ loadingDashboards: true })
        try {
            console.log('Fetching dashboards...')
            // Lazy import to avoid circular dep issues if any, though service is clean
            const { DashboardService } = await import('./services/dashboardService')
            const data = await DashboardService.getDashboards()
            console.log('Fetched dashboards:', data)
            set({ dashboards: data || [] })
        } catch (err) {
            console.error('Error fetching dashboards:', err)
        }
        set({ loadingDashboards: false })
    },

    loadDashboard: async (dashboardId) => {
        set({ activeDashboardId: dashboardId, loadingDashboards: true })
        try {
            const { DashboardService } = await import('./services/dashboardService')
            const tabs = await DashboardService.getDashboardDetails(dashboardId)
            set({
                dashboardTabs: tabs || [],
                tabsLoadedForDashboardId: dashboardId,
                activeTabId: tabs && tabs.length > 0 ? tabs[0].id : null // Set first tab as active
            })
        } catch (err) {
            console.error('Error loading dashboard details:', err)
            // Prevent infinite loop by marking this dashboard as "loaded" (even if failed)
            // or by resetting activeDashboardId if it's invalid.
            // For now, let's mark it as loaded with empty tabs so UI shows empty state instead of looping.
            set({
                dashboardTabs: [],
                tabsLoadedForDashboardId: dashboardId,
                activeTabId: null
            })
        }
        set({ loadingDashboards: false })
    },

    activeTabId: null,
    setActiveTabId: (id) => set({ activeTabId: id }),

    createDashboard: async (title) => {
        const { language } = get()
        try {
            const { DashboardService } = await import('./services/dashboardService')
            const newDash = await DashboardService.createDashboard(title)
            set(state => ({
                dashboards: [newDash, ...state.dashboards],
                activeDashboardId: newDash.id
            }))
            // Create default tab?
            const defaultTabName = language === 'fi' ? 'Oma työtila' : 'My Workspace'
            await DashboardService.createTab(newDash.id, defaultTabName, 0, '#60a5fa')
            get().loadDashboard(newDash.id)
        } catch (err) {
            console.error('Error creating dashboard:', err)
        }
    },

    updateDashboard: async (dashboardId, updates) => {
        try {
            const { DashboardService } = await import('./services/dashboardService')
            await DashboardService.updateDashboard(dashboardId, updates)

            set(state => ({
                dashboards: state.dashboards.map(d =>
                    d.id === dashboardId ? { ...d, ...updates } : d
                )
            }))
        } catch (err) {
            console.error('Error updating dashboard:', err)
        }
    },

    createTab: async (dashboardId, title) => {
        try {
            const { DashboardService } = await import('./services/dashboardService')
            // Default color/index
            await DashboardService.createTab(dashboardId, title, 0, '#60a5fa')

            // Refresh dashboard to show new tab
            get().loadDashboard(dashboardId)
        } catch (err) {
            console.error('Error creating tab:', err)
        }
    },

    updateTab: async (tabId, updates) => {
        try {
            const { DashboardService } = await import('./services/dashboardService')
            await DashboardService.updateTab(tabId, updates)

            // Update local state
            set(state => ({
                dashboardTabs: state.dashboardTabs.map(t =>
                    t.id === tabId ? { ...t, ...updates } : t
                )
            }))
        } catch (err) {
            console.error('Error updating tab:', err)
        }
    },

    deleteTab: async (tabId) => {
        try {
            const { DashboardService } = await import('./services/dashboardService')
            await DashboardService.deleteTab(tabId)

            // Update local state
            const { activeTabId } = get()
            set(state => ({
                dashboardTabs: state.dashboardTabs.filter(t => t.id !== tabId),
                // If we deleted the active tab, clear selection or fallback will handle it
                activeTabId: activeTabId === tabId ? null : activeTabId
            }))
        } catch (err) {
            console.error('Error deleting tab:', err)
        }
    },

    deleteDashboard: async (dashboardId) => {
        try {
            const { DashboardService } = await import('./services/dashboardService')
            await DashboardService.deleteDashboard(dashboardId)

            set(state => ({
                dashboards: state.dashboards.filter(d => d.id !== dashboardId),
                activeDashboardId: state.activeDashboardId === dashboardId
                    ? (state.dashboards.find(d => d.id !== dashboardId)?.id || null)
                    : state.activeDashboardId
            }))
        } catch (err) {
            console.error('Error deleting dashboard:', err)
        }
    },

    addWidget: async (type, config = {}) => {
        const { activeDashboardId, dashboardTabs, activeTabId } = get()
        // If no active tab, try to find the first one or return
        let targetTabId = activeTabId
        if (!targetTabId && dashboardTabs.length > 0) {
            targetTabId = dashboardTabs[0].id
        }
        if (!targetTabId) return

        try {
            const { DashboardService } = await import('./services/dashboardService')
            // Default layout
            const layout = { x: 0, y: 0, w: 2, h: 2 } // Responsive grid handles placement usually, but we set default size

            const newWidget = await DashboardService.createWidget(targetTabId, type, layout, config)

            // Optimistic update
            set(state => ({
                dashboardTabs: state.dashboardTabs.map(tab =>
                    tab.id === targetTabId
                        ? { ...tab, widgets: [...(tab.widgets || []), newWidget] }
                        : tab
                )
            }))
        } catch (err) {
            console.error('Error creating widget:', err)
        }
    },

    updateWidget: async (widgetId, updates) => {
        const { dashboardTabs, activeTabId } = get()

        // Find current widget to merge config if needed
        let currentWidget = null
        // Search in all tabs or just active? Widget ID should be unique.
        // But dashboardTabs usually only has tabs for active dashboard.
        for (const t of dashboardTabs) {
            const w = t.widgets?.find(w => w.id === widgetId)
            if (w) { currentWidget = w; break; }
        }

        if (!currentWidget) return

        // Deep merge config if present in updates
        let newConfig = currentWidget.config || {}
        if (updates.config) {
            newConfig = { ...newConfig, ...updates.config }
        }

        const finalUpdates = { ...updates, config: newConfig }

        // 1. Optimistic Update
        const newTabs = dashboardTabs.map(tab => {
            // Check if widget is in this tab
            if (!tab.widgets?.find(w => w.id === widgetId)) return tab

            return {
                ...tab,
                widgets: tab.widgets.map(w =>
                    w.id === widgetId
                        ? { ...w, ...finalUpdates }
                        : w
                )
            }
        })
        set({ dashboardTabs: newTabs })

        // 2. Persist
        try {
            const { DashboardService } = await import('./services/dashboardService')
            await DashboardService.updateWidget(widgetId, finalUpdates)
        } catch (err) {
            console.error('Error updating widget:', err)
        }
    },

    updateDashboardLayout: async (layoutUpdates) => {
        // layoutUpdates: { [widgetId]: { x, y, w, h } }
        const { dashboardTabs, activeTabId } = get()

        // 1. Optimistic Update
        const newTabs = dashboardTabs.map(tab => {
            if (tab.id !== activeTabId) return tab
            return {
                ...tab,
                widgets: tab.widgets.map(w => {
                    if (layoutUpdates[w.id]) {
                        return { ...w, layout: { ...w.layout, ...layoutUpdates[w.id] } }
                    }
                    return w
                })
            }
        })
        set({ dashboardTabs: newTabs })

        // 2. Persist to DB
        try {
            const { DashboardService } = await import('./services/dashboardService')
            const updatesArray = Object.entries(layoutUpdates).map(([id, layout]) => ({ id, layout }))
            await DashboardService.updateWidgetsLayout(updatesArray)
        } catch (err) {
            console.error('Failed to save layout:', err)
            // Revert? For now, we just log.
        }
    },

    deleteWidget: async (widgetId) => {
        const { dashboardTabs, activeTabId } = get()

        // 1. Optimistic Update
        const newTabs = dashboardTabs.map(tab => {
            if (tab.id !== activeTabId) return tab
            return {
                ...tab,
                widgets: tab.widgets.filter(w => w.id !== widgetId)
            }
        })
        set({ dashboardTabs: newTabs })

        // 2. Persist to DB
        try {
            const { DashboardService } = await import('./services/dashboardService')
            await DashboardService.deleteWidget(widgetId)
        } catch (err) {
            console.error('Failed to delete widget:', err)
            // Revert would be nice here
        }
    },

    // Comments Slice
    comments: {}, // { [noteId]: [Comment] }
    loadingComments: false,

    fetchComments: async (noteId) => {
        if (!noteId) return
        set({ loadingComments: true })
        const { data, error } = await supabase
            .from('comments')
            .select('*, profiles(full_name, email)') // Join profiles to get user info
            .eq('note_id', noteId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching comments:', error)
        } else {
            console.log('Fetched comments:', data)
            set(state => ({
                comments: {
                    ...state.comments,
                    [noteId]: data || []
                },
                loadingComments: false
            }))
        }
    },

    addComment: async (noteId, content) => {
        const user = get().user
        if (!user) return

        const { data, error } = await supabase
            .from('comments')
            .insert({
                note_id: noteId,
                user_id: user.id,
                content
            })
            .select('*, profiles(full_name, email)')
            .single()

        if (error) {
            console.error('Error adding comment:', error)
        } else if (data) {
            set(state => ({
                comments: {
                    ...state.comments,
                    [noteId]: [...(state.comments[noteId] || []), data]
                }
            }))
        }
    },

    resolveComment: async (commentId, noteId) => {
        const { error } = await supabase
            .from('comments')
            .update({ is_resolved: true })
            .eq('id', commentId)

        if (error) {
            console.error('Error resolving comment:', error)
        } else {
            set(state => ({
                comments: {
                    ...state.comments,
                    [noteId]: state.comments[noteId].map(c =>
                        c.id === commentId ? { ...c, is_resolved: true } : c
                    )
                }
            }))
        }
    },

    // Files State
    files: [],
    loadingFiles: false,

    fetchFiles: async () => {
        const { user } = get()
        if (!user) return

        set({ loadingFiles: true })

        // List files from storage
        const { data, error } = await supabase.storage
            .from('project_files')
            .list(`${user.id}`, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' },
            })

        if (error) {
            console.error('Error fetching files:', error)
        } else {
            // Transform to useful objects
            const fileList = data.map(file => ({
                id: file.id,
                name: file.name,
                size: file.metadata?.size,
                mimetype: file.metadata?.mimetype,
                created_at: file.created_at,
                // Construct path for operations
                path: `${user.id}/${file.name}`
            }))

            set({ files: fileList })
        }
        set({ loadingFiles: false })
    },

    uploadFile: async (file) => {
        const { user } = get()
        if (!user) return

        const fileExt = file.name.split('.').pop()
        // Keep original name but prepend timestamp to avoid collisions if desired, 
        // OR just keep original name and overwrite? Requirement didn't specify.
        // Let's use original name but handle duplicate error or overwrite?
        // Safe bet: `${Date.now()}_${file.name}`
        const fileName = `${Date.now()}_${file.name}`
        const filePath = `${user.id}/${fileName}`

        const { error } = await supabase.storage
            .from('project_files')
            .upload(filePath, file)

        if (error) {
            console.error('Error uploading file:', error)
            throw error
        }

        // Refresh list
        await get().fetchFiles()
    },

    deleteFile: async (filePath) => {
        const { error } = await supabase.storage
            .from('project_files')
            .remove([filePath])

        if (error) {
            console.error('Error deleting file:', error)
            throw error
        }

        // Refresh list
        await get().fetchFiles()
    },

    getDownloadUrl: async (filePath) => {
        // Create signed url for private bucket
        const { data, error } = await supabase.storage
            .from('project_files')
            .createSignedUrl(filePath, 60 * 60) // 1 hour

        if (error) {
            console.error('Error getting URL:', error)
            return null
        }
        return data.signedUrl
    }
}), {
    name: 'potool-storage',
    partialize: (state) => ({
        noteContent: state.noteContent,
        noteTitle: state.noteTitle,
        noteSummary: state.noteSummary,
        activeNoteId: state.activeNoteId,
        categoryColors: state.categoryColors,
        language: state.language,
        recentColors: state.recentColors,
        activeDashboardId: state.activeDashboardId // Persist active dashboard
    }),
}))
