import { create } from 'zustand';
import axios from 'axios';

const useContentStore = create((set) => ({
  result: null,
  isLoading: false,
  error: '',

  handleSubmit: async (formData) => {
    set({ isLoading: true, error: '', result: null });
    try {
      const { data } = await axios.post('/api/generate', formData);
      if (data.success) {
        set({ result: data });
      } else {
        set({ error: data.error || 'An unexpected error occurred.' });
      }
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Failed to connect to the server. Is the backend running?';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  handleClear: () => set({ result: null, error: '' }),
}));

export default useContentStore;
