import axios from 'axios';
import { defineStore } from 'pinia';

import type { Emissions } from '@/typings/general';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const useDataStore = defineStore('data', {
  state: () => ({
    loading: false,
    error: null as string | null,
    data: null as Emissions | null,
  }),

  actions: {
    async getAllEmissionData() {
      this.loading = true;
      this.error = null;
      
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const { data } = await axiosInstance.get<Emissions>(`countries/emissions-per-country`);
          this.data = data.data;
          return data.data;
        } catch (err) {
          this.error = err instanceof Error ? err.message : 'Failed to fetch data';
          if (attempt < MAX_RETRIES - 1) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (attempt + 1)));
            continue;
          }
          throw err;
        } finally {
          this.loading = false;
        }
      }
    },
  },
});
