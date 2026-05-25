function useCountryStates() {
    const useCountries = async () => {
        try {
            const countriesResponse = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
            const countriesData = await countriesResponse.json();

            const countries = countriesData.map(country => ({
                name: country.name.common,
                code: country.cca2,
                states: []
            })).sort((a, b) => a.name.localeCompare(b.name));

            return countries;
        } catch (error) {
            console.error('Error fetching countries:', error);
            return [];
        }
    };

    const useStatesByCountry = async (countryCode = 'IE') => {
        try {
            const username = 'darrenwalls'; // Your username

            // Use the countryInfo endpoint to get the geonameId first
            const countryInfoResponse = await fetch(
                `https://secure.geonames.org/countryInfoJSON?country=${countryCode}&username=${username}`
            );

            const countryInfo = await countryInfoResponse.json();

            if (countryInfo.geonames && countryInfo.geonames.length > 0) {
                const geonameId = countryInfo.geonames[0].geonameId;

                // Now fetch the states using the correct geonameId
                const statesResponse = await fetch(
                    `https://secure.geonames.org/childrenJSON?geonameId=${geonameId}&username=${username}`
                );

                const statesData = await statesResponse.json();

                if (statesData.geonames) {
                    return statesData.geonames.map(state => ({
                        name: state.name,
                        code: state.adminCode1 || state.fcode,
                        id: state.geonameId
                    }));
                }
            }
            return [];
        } catch (error) {
            console.error('Error fetching states:', error);
            return [];
        }
    };

    return { useCountries, useStatesByCountry };
}

export default useCountryStates;