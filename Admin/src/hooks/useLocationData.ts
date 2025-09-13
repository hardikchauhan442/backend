import { useCallback, useEffect, useState } from "react";

import {
  apiGetCities,
  apiGetCountries,
  apiGetStates,
} from "@/services/ProjectService";

export function useLocationData() {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [countriesLoading, setCountriesLoading] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const fetchCountries = useCallback(async () => {
    setCountriesLoading(true);
    try {
      const response: any = await apiGetCountries();
      setCountries(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch countries:", error);
      setCountries([]);
    } finally {
      setCountriesLoading(false);
    }
  }, []);

  const fetchStates = useCallback(async (countryId: string) => {
    if (!countryId) {
      setStates([]);
      return;
    }

    setStatesLoading(true);
    try {
      const response: any = await apiGetStates(countryId);
      setStates(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch states:", error);
      setStates([]);
    } finally {
      setStatesLoading(false);
    }
  }, []);

  const fetchCities = useCallback(async (stateId: string) => {
    if (!stateId) {
      setCities([]);
      return;
    }

    setCitiesLoading(true);
    try {
      const response: any = await apiGetCities(stateId);
      setCities(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch cities:", error);
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  }, []);

  const resetStates = useCallback(() => {
    setStates([]);
  }, []);

  const resetCities = useCallback(() => {
    setCities([]);
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  return {
    countries,
    states,
    cities,
    countriesLoading,
    statesLoading,
    citiesLoading,
    fetchCountries,
    fetchStates,
    fetchCities,
    resetStates,
    resetCities,
  };
}
