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
        const { data, error } = await supabase
            .from('bullet_templates')
            .select('*')

        if (error) {
            console.error('Error fetching bullets:', error)
        } else {
            // Init bullets with default state (not active, not hidden)
            // In future: Merge with 'user_selected_bullets' table
            const initializedData = data.map(b => ({ ...b, is_active: false, is_hidden: false }))
            set({ bullets: initializedData })
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

    addToNote: (text) => set((state) => ({
        noteContent: state.noteContent + (state.noteContent ? '\n\n' : '') + `## ${text}\n`
    })),

    // Cloud Actions
    fetchNotes: async () => {
        const { data, error } = await supabase
            .from('notes')
            .select('id, title, updated_at')
            .order('updated_at', { ascending: false })

        if (!error && data) {
            set({ notes: data })
        }
    },

    createNote: async () => {
        const { user } = get()
        if (!user) return

        const newNote = {
            user_id: user.id,
            title: 'Untitled Plan',
            content: ''
        }

        const { data, error } = await supabase
            .from('notes')
            .insert(newNote)
            .select()
            .single()

        if (!error && data) {
            set({
                activeNoteId: data.id,
                noteContent: '',
                noteTitle: 'Untitled Plan',
                notes: [data, ...get().notes]
            })
        }
    },

    loadNote: async (id) => {
        set({ isSaving: true }) // Reuse loading state visual or add specific loading state
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('id', id)
            .single()

        if (!error && data) {
            set({
                activeNoteId: data.id,
                noteContent: data.content || '',
                noteTitle: data.title || 'Untitled Plan'
            })
        }
        set({ isSaving: false })
    },

    saveNote: async () => {
        const { activeNoteId, noteContent, noteTitle, user } = get()
        if (!user) return

        set({ isSaving: true })

        if (activeNoteId) {
            // Update existing
            const { error } = await supabase
                .from('notes')
                .update({
                    content: noteContent,
                    title: noteTitle,
                    updated_at: new Date()
                })
                .eq('id', activeNoteId)

            if (!error) {
                // Update list locally to reflect new timestamp/title
                set(state => ({
                    notes: state.notes.map(n =>
                        n.id === activeNoteId
                            ? { ...n, title: noteTitle, updated_at: new Date() }
                            : n
                    ).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                }))
            }
        } else {
            // Create new (if user started typing without clicking 'New')
            // This is "First Save" logic
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
            }
        }
        set({ isSaving: false })
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
                targetLang = language === 'fi' ? 'fi-FI' : 'en-GB'
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
        activeNoteId: state.activeNoteId
    }),
}))
