import { create } from 'zustand'
import { supabase } from './supabase'

export const useStore = create((set, get) => ({
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

    // Note State
    noteContent: '',
    setNoteContent: (content) => set({ noteContent: content }),

    addToNote: (text) => set((state) => ({
        noteContent: state.noteContent + (state.noteContent ? '\n\n' : '') + `## ${text}\n`
    }))
}))
