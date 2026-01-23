import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from './supabase'

export const useStore = create(persist((set, get) => ({
    // Language State
    language: 'fi',
    setLanguage: (lang) => set({ language: lang }),

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
    noteTitle: 'Untitled Plan',
    activeNoteId: null,
    notes: [], // List of available notes { id, title, updated_at ... }
    isSaving: false,

    setNoteContent: (content) => set({ noteContent: content }),
    setNoteTitle: (title) => set({ noteTitle: title }),

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

    addToNote: (text, type = 'h2', color = null) => set((state) => {
        const inner = color ? `<span style="color: ${color}">${text}</span>` : text
        const element = type === 'h2'
            ? `<h2>${inner}</h2>`
            : `<p>${inner}</p>`

        // Append new content and ensure there's at least one empty line after
        const newContent = state.noteContent + element + '<p></p>'
        return { noteContent: newContent }
    }),

    // Cloud Actions
    versions: [], // List of versions for active note
    isManualSaving: false,

    fetchNotes: async () => {
        const { user } = get()
        if (!user) return

        const { data } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
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
            set(state => ({
                activeNoteId: data.id,
                noteTitle: data.title,
                noteContent: data.content,
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
            set({
                activeNoteId: data.id,
                noteContent: data.content || '',
                noteTitle: data.title,
                isSaving: false
            })
            get().fetchVersions(id)
        } else {
            set({ isSaving: false })
        }
    },

    saveNote: async (isManual = false) => {
        const { activeNoteId, noteContent, noteTitle, user } = get()
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
                    updated_at: new Date()
                })
                .eq('id', activeNoteId)

            if (!error) {
                // Update list locally
                set(state => ({
                    notes: state.notes.map(n =>
                        n.id === activeNoteId
                            ? { ...n, title: noteTitle, updated_at: new Date() }
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
                            content: noteContent
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
                    content: noteContent
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
                            content: noteContent
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
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching versions:', error)
        }
        if (data) set({ versions: data })
    },

    versionTimestamp: null,

    restoreVersion: async (version) => {
        set({
            noteTitle: version.title,
            noteContent: version.content,
            versionTimestamp: Date.now()
        })
        // Immediately save as current draft
        await get().saveNote(true)
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
    }
}), {
    name: 'potool-storage',
    partialize: (state) => ({
        noteContent: state.noteContent,
        noteTitle: state.noteTitle,
        activeNoteId: state.activeNoteId,
        categoryColors: state.categoryColors,
        language: state.language,
        recentColors: state.recentColors
    }),
}))
