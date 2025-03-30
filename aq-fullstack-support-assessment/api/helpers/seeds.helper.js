import footprintApi from './../helpers/footprint.helper';

/**
 * Transform input data by organizing it by year.
 * 
 * @param {Object} inputData - The raw input data organized by country.
 * @returns {Object} The transformed data organized by year.
 */
export const transformData = (inputData) => {
  const dataByYear = {};
  const countries = Object.keys(inputData);

  // Initialize all years with empty arrays
  const allYears = new Set();
  countries.forEach(country => {
    inputData[country].forEach(record => {
      allYears.add(record.year);
    });
  });

  // Initialize the data structure for all years
  allYears.forEach(year => {
    dataByYear[year] = [];
  });

  // Fill in the data for each country and year
  countries.forEach(country => {
    inputData[country].forEach(record => {
      const year = record.year;
      const total = parseFloat(record.carbon.toFixed(4));

      if (total) {
        dataByYear[year].push({
          country,
          total,
          countryCode: record.countryCode
        });
      }
    });
  });

  // Validate that each year has all countries
  const expectedCountryCount = countries.length;
  Object.entries(dataByYear).forEach(([year, data]) => {
    if (data.length < expectedCountryCount) {
      console.warn(`Warning: Year ${year} is missing some countries. Expected ${expectedCountryCount}, got ${data.length}`);
      const presentCountries = new Set(data.map(d => d.country));
      const missingCountries = countries.filter(c => !presentCountries.has(c));
      console.warn(`Missing countries for year ${year}:`, missingCountries);
    }
  });

  return dataByYear;
};

/**
 * Fetch data for a country
 * 
 * @param {string} countryCode - The country code to fetch data for.
 * @returns {Promise<Object>} The data for the specified country.
 */
export const fetchData = async (countryCode) => {
  return await footprintApi.getDataForCountry(countryCode);
};

/**
 * Sort data by highest total emissions.
 * 
 * @param {Object} data - The data organized by year.
 * @returns {Object} The data sorted by highest total emissions per year.
 */
export const sortByHighestTotal = async (data) => {
  for (let year in data) {
    data[year].sort((a, b) => b.total - a.total);
  }
  return data;
};