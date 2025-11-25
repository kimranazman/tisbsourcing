import { create } from 'zustand'

export const useFilterStore = create((set) => ({
  // Filter values
  search: '',
  brands: [],
  states: [],
  dateRange: {
    start: null,
    end: null
  },

  // Actions
  setSearch: (search) => set({ search }),

  setBrands: (brands) => set({ brands }),

  setStates: (states) => set({ states }),

  setDateRange: (dateRange) => set({ dateRange }),

  clearFilters: () => set({
    search: '',
    brands: [],
    states: [],
    dateRange: { start: null, end: null }
  }),

  // Check if any filters are active
  hasActiveFilters: () => {
    const state = useFilterStore.getState()
    return (
      state.search.trim() !== '' ||
      state.brands.length > 0 ||
      state.states.length > 0 ||
      state.dateRange.start !== null ||
      state.dateRange.end !== null
    )
  }
}))
