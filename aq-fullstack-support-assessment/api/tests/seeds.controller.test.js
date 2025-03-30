import { expect } from 'chai';
import sinon from 'sinon';
import { prepareEmissionsByCountry } from '../controllers/seeds.controller';
import footprintApi from '../helpers/footprint.helper';
import { transformData, fetchData, sortByHighestTotal } from '../helpers/seeds.helper';

describe('Seeds Controller', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should fetch and transform data for all countries', async () => {
    const mockCountries = [
      { countryName: 'Country1', countryCode: 'C1' },
      { countryName: 'Country2', countryCode: 'C2' },
    ];

    const mockCountryData = [
      {
        countryName: 'Country1',
        countryCode: 'C1',
        year: 2020,
        carbon: 100,
      },
      {
        countryName: 'Country2',
        countryCode: 'C2',
        year: 2020,
        carbon: 200,
      },
    ];

    sandbox.stub(footprintApi, 'getCountries').resolves(mockCountries);
    sandbox.stub(footprintApi, 'getDataForCountry').resolves(mockCountryData);

    const result = await prepareEmissionsByCountry();

    expect(result).to.be.an('object');
    expect(Object.keys(result)).to.have.length.greaterThan(0);
    expect(Object.values(result)[0]).to.be.an('array');
    expect(Object.values(result)[0]).to.have.length(2);
  });

  it('should handle failed country data fetches', async () => {
    const mockCountries = [
      { countryName: 'Country1', countryCode: 'C1' },
      { countryName: 'Country2', countryCode: 'C2' },
      { countryName: 'Country3', countryCode: 'C3' },
    ];

    const mockCountryData = [
      {
        countryName: 'Country1',
        countryCode: 'C1',
        year: 2020,
        carbon: 100,
      },
    ];

    sandbox.stub(footprintApi, 'getCountries').resolves(mockCountries);
    sandbox.stub(footprintApi, 'getDataForCountry')
      .withArgs('C1').resolves(mockCountryData)
      .withArgs('C2').rejects(new Error('Failed to fetch'))
      .withArgs('C3').resolves(mockCountryData);

    const result = await prepareEmissionsByCountry();

    expect(result).to.be.an('object');
    expect(Object.keys(result)).to.have.length.greaterThan(0);
    expect(Object.values(result)[0]).to.be.an('array');
    expect(Object.values(result)[0]).to.have.length(2);
  });

  it('should validate country count in output', async () => {
    const mockCountries = Array.from({ length: 269 }, (_, i) => ({
      countryName: `Country${i + 1}`,
      countryCode: `C${i + 1}`,
    }));

    const mockCountryData = [
      {
        countryName: 'Country1',
        countryCode: 'C1',
        year: 2020,
        carbon: 100,
      },
    ];

    sandbox.stub(footprintApi, 'getCountries').resolves(mockCountries);
    sandbox.stub(footprintApi, 'getDataForCountry').resolves(mockCountryData);

    const result = await prepareEmissionsByCountry();

    const firstYear = Object.keys(result)[0];
    expect(result[firstYear]).to.be.an('array');
    expect(result[firstYear].length).to.equal(269);
  });

  it('should sort countries by emissions', async () => {
    const mockCountries = [
      { countryName: 'Country1', countryCode: 'C1' },
      { countryName: 'Country2', countryCode: 'C2' },
    ];

    const mockCountryData = [
      {
        countryName: 'Country1',
        countryCode: 'C1',
        year: 2020,
        carbon: 100,
      },
      {
        countryName: 'Country2',
        countryCode: 'C2',
        year: 2020,
        carbon: 200,
      },
    ];

    sandbox.stub(footprintApi, 'getCountries').resolves(mockCountries);
    sandbox.stub(footprintApi, 'getDataForCountry').resolves(mockCountryData);

    const result = await prepareEmissionsByCountry();

    const firstYear = Object.keys(result)[0];
    expect(result[firstYear][0].total).to.be.greaterThan(result[firstYear][1].total);
  });
}); 