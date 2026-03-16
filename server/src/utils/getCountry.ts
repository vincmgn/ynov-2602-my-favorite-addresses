import axios from "axios";

export async function getCountriesStartingWith(srch: string): Promise<string[]> {
  const { data } = await axios.get(`https://api.first.org/data/v1/countries?limit=1000`);

  const filteredCountries = data.data.filter((country: any) => {
    return country.name.startsWith(srch);
  });
  const countryNames = filteredCountries.map((country: any) => {
    return country.name;
  });
  return countryNames;
}
