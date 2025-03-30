import footprintApi from './../helpers/footprint.helper';
import { transformData, fetchData, sortByHighestTotal } from './../helpers/seeds.helper';
import { SKIPPED_COUNTRIES } from './../configs/vars';

/**
 * Prepare emissions data by country.
 * 
 * Fetches data for all countries from the footprint API, processes it, and returns the results
 * 
 * @returns {Promise<Object>} The emissions data organized by country.
 */
export const prepareEmissionsByCountry = async () => {
  const dataByCountry = {};

  // Fetch all countries data from the footprint API
  const countries = await footprintApi.getCountries();

  // Create a request for each country
  const promises = countries.map(country => {
    const countryName = country.countryName.toLowerCase().trim();
    // Only skip if the country is in the SKIPPED_COUNTRIES list
    if (SKIPPED_COUNTRIES.includes(countryName)) {
      console.log(`Skipping country: ${countryName}`);
      return Promise.resolve(null);
    }
    return fetchData(country.countryCode);
  });

  let results = await Promise.allSettled(promises);
  
  // Filter out skipped countries and failed requests
  results = results
    .filter(result => result.status === 'fulfilled' && result.value !== null && result.value.length)
    .map(result => result.value);

  // Key by country name, transform and sort the data
  results.forEach(r => {
    const countryName = r[0].countryName.toLowerCase().trim();
    dataByCountry[countryName] = r;
  });

  let emissionsPerCountry = transformData(dataByCountry);
  emissionsPerCountry = await sortByHighestTotal(emissionsPerCountry);

  // Validate that we have all countries
  const expectedCountryCount = 269;
  const actualCountryCount = Object.keys(emissionsPerCountry[Object.keys(emissionsPerCountry)[0]]).length;
  
  if (actualCountryCount < expectedCountryCount) {
    console.warn(`Warning: Only ${actualCountryCount} countries found, expected ${expectedCountryCount}`);
    // Log missing countries
    const allCountries = new Set(countries.map(c => c.countryName.toLowerCase().trim()));
    const includedCountries = new Set(Object.keys(dataByCountry));
    const missingCountries = [...allCountries].filter(c => !includedCountries.has(c));
    console.warn('Missing countries:', missingCountries);
  }

  return emissionsPerCountry;
};