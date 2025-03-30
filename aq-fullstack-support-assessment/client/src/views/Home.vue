<template>
  <main class="container">
    <HomeHeader
      :current-year="currentYear"
      :total="totalCarbon"
    />
    
    <div v-if="dataStore.loading" class="loading">
      Loading data...
    </div>
    
    <div v-else-if="dataStore.error" class="error">
      {{ dataStore.error }}
      <button @click="getData">Retry</button>
    </div>
    
    <TransitionGroup
      v-else-if="!!currentYearSortedCountries.length"
      name="chart"
      tag="div"
      class="chart"
    >
      <HomeChartRow
        v-for="country in currentYearSortedCountries"
        :key="country.code"
        :country="country"
        :max-value="maxCarbonValuePerYear"
      />
    </TransitionGroup>
  </main>
</template>

<script lang="ts">
  import { mapStores } from 'pinia';
  import { defineComponent } from 'vue';

  import { getColorsRange } from '@/lib/utils/getColorsRange';
  import { useDataStore } from '@/stores/dataStore';
  import type { CountryEmissionsForYear, Emissions } from '@/typings/general';
  import HomeHeader from '@/components/home/HomeHeader.vue';
  import HomeChartRow from '@/components/home/HomeChartRow.vue';

  interface ChartCountry {
    name: string;
    color: string;
    carbon: number;
    code: string;
  }

  interface HomeState {
    currentYear: number;
    minYear: number;
    maxYear: number;
    emissionData: Emissions['data'];
    yearInterval?: number;
  }

  export default defineComponent({
    name: 'home',

    components: { HomeHeader, HomeChartRow },

    data(): HomeState {
      return {
        currentYear: 0,
        minYear: 0,
        maxYear: 0,
        emissionData: {},
        yearInterval: undefined,
      };
    },
    computed: {
      ...mapStores(useDataStore),

      countriesForCurrentYear(): ChartCountry[] {
        if (!this.currentYear || !this.emissionData) return [];

        const countriesForCurrentYear = this.emissionData[this.currentYear];

        if (!countriesForCurrentYear || !Array.isArray(countriesForCurrentYear)) return [];

        const colorSet = getColorsRange(countriesForCurrentYear.length);

        return countriesForCurrentYear.map((country: CountryEmissionsForYear, i: number) => ({
          name: country.country,
          color: colorSet[i],
          carbon: country.total,
          code: country.country,
        }));
      },

      currentYearSortedCountries(): ChartCountry[] {
        if (!this.countriesForCurrentYear?.length) return [];
        return this.countriesForCurrentYear.slice().sort((a, b) => {
          return b.carbon - a.carbon;
        });
      },

      maxCarbonValuePerYear(): number {
        return this.currentYearSortedCountries[0]?.carbon || 0;
      },

      totalCarbon(): number {
        return Math.floor(
          this.currentYearSortedCountries.reduce((acc: number, curr: ChartCountry) => {
            return acc + curr.carbon;
          }, 0)
        );
      },
    },
    async mounted() {
      await this.getData();
      this.startYearLoop();
    },
    beforeUnmount() {
      if (this.yearInterval) {
        clearInterval(this.yearInterval);
      }
    },

    methods: {
      async getData() {
        try {
          const data = await this.dataStore.getAllEmissionData();
          if (data) {
            this.emissionData = data;

            const years = Object.keys(data).map(Number);

            if (years.length) {
              this.minYear = Math.min(...years);
              this.maxYear = Math.max(...years);
              this.currentYear = this.minYear;
            }
          }
        } catch (err) {
          console.error(err);
        }
      },

      startYearLoop() {
        this.yearInterval = window.setInterval(() => {
          if (this.currentYear >= this.maxYear) {
            this.currentYear = this.minYear;
          } else {
            this.currentYear++;
          }
        }, 1000);
      },
    },
  });
</script>

<style lang="scss" scoped>
  @use '@/styles/colors' as colors;

  .chart-move {
    transition: all 500ms;
  }

  .container {
    display: flex;
    flex-flow: column;
    align-items: center;
    padding: 89px 0 81px;
  }

  .chart {
    display: flex;
    flex-flow: column;
    gap: 10px;

    max-width: 837px;
    width: 100%;
    padding: 50px;

    background-color: colors.$white;

    border: 1px solid #e6e6e6;
    border-radius: 8px;

    margin-top: 20px;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    font-size: 1.2em;
    color: colors.$grey-600;
  }

  .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    color: #dc2626;
    
    button {
      padding: 0.5rem 1rem;
      background-color: colors.$brand-color-1;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      
      &:hover {
        background-color: darken(colors.$brand-color-1, 10%);
      }
    }
  }
</style>
