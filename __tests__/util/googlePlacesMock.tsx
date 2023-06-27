import { useJsApiLoader } from '@react-google-maps/api';
import { act } from '@testing-library/react-hooks';
import { useEffect, useState } from 'react';

export const place = {
  address_components: [
    {
      long_name: 'A',
      short_name: 'A',
      types: ['subpremise'],
    },
    {
      long_name: '100',
      short_name: '100',
      types: ['street_number'],
    },
    {
      long_name: 'Lake Hart Drive',
      short_name: 'Lake Hart Dr',
      types: ['route'],
    },
    {
      long_name: 'Orlando',
      short_name: 'Orlando',
      types: ['locality', 'political'],
    },
    {
      long_name: 'Orlando',
      short_name: 'Orlando',
      types: ['administrative_area_level_3', 'political'],
    },
    {
      long_name: 'Orange County',
      short_name: 'Orange County',
      types: ['administrative_area_level_2', 'political'],
    },
    {
      long_name: 'Florida',
      short_name: 'FL',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'United States',
      short_name: 'US',
      types: ['country', 'political'],
    },
    {
      long_name: '32832',
      short_name: '32832',
      types: ['postal_code'],
    },
    {
      long_name: '0100',
      short_name: '0100',
      types: ['postal_code_suffix'],
    },
  ],
};

export const placePromise = Promise.resolve({
  predictions: [
    { description: '100 Lake Hart Dr, Orlando, FL 32832, USA' },
    { description: '100 Lake Hart Dr, New York City, NY 20000, USA' },
    { description: '100 Lake Hart Dr, Los Angeles, CA 30000, USA' },
  ] as google.maps.places.AutocompletePrediction[],
});

export const getPlacePredictions = jest.fn().mockReturnValue(placePromise);

export const getDetails = jest.fn().mockImplementation((_place, callback) => {
  callback(place, 'OK');
});

export const google = {
  maps: {
    places: {
      AutocompleteService: jest.fn().mockReturnValue({
        getPlacePredictions,
      }),
      PlacesService: jest.fn().mockReturnValue({
        getDetails,
      }),
      AutocompleteSessionToken: jest.fn(),
    },
  },
} as unknown as typeof window.google;

export const useJsApiLoaderMock = useJsApiLoader as jest.MockedFn<
  typeof useJsApiLoader
>;

// jest.mock('@react-google-maps/api') must be called in the test file before setupMocks is used.
// It doesn't work when the mock call is in this file.
export const setupMocks = () => {
  // Pretend to load Google Maps asynchronously
  useJsApiLoaderMock.mockImplementation(() => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      const timeoutId = setTimeout(() => {
        window.google = google;

        act(() => {
          setLoaded(true);
        });
      }, 0);

      return () => clearTimeout(timeoutId);
    }, []);

    return {
      isLoaded: loaded,
      loadError: undefined,
    };
  });
};
