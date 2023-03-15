import { act, render } from '@testing-library/react';
import { useJsApiLoader } from '@react-google-maps/api';
import { Field, Formik } from 'formik';
import { parsePlace, StreetAutocomplete } from './StreetAutocomplete';
import { useEffect, useState } from 'react';
import userEvent from '@testing-library/user-event';

jest.mock('@react-google-maps/api');

const place = {
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

jest.useFakeTimers();

const onSubmit = jest.fn();

const ComponentWithMocks = () => (
  <Formik
    initialValues={{
      street: '',
      city: '',
    }}
    onSubmit={onSubmit}
  >
    {() => (
      <form>
        <StreetAutocomplete />

        <label htmlFor="city">City</label>
        <Field id="city" name="city" type="text" />
      </form>
    )}
  </Formik>
);

describe('StreetAutocomplete', () => {
  const placePromise = Promise.resolve({
    predictions: [
      { description: '100 Lake Hart Dr, Orlando, FL 32832, USA' },
      { description: '100 Lake Hart Dr, New York City, NY 20000, USA' },
      { description: '100 Lake Hart Dr, Los Angeles, CA 30000, USA' },
    ] as google.maps.places.AutocompletePrediction[],
  });

  const getPlacePredictions = jest.fn().mockReturnValue(placePromise);

  const getDetails = jest.fn().mockImplementation((_place, callback) => {
    callback(place, 'OK');
  });

  const google = {
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

  beforeEach(() => {
    jest.useFakeTimers();

    // Pretend to load Google Maps asynchronously
    (useJsApiLoader as jest.MockedFn<typeof useJsApiLoader>).mockImplementation(
      () => {
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
      },
    );
  });

  it('renders', () => {
    const { getByRole } = render(<ComponentWithMocks />);

    expect(getByRole('combobox', { name: 'Street' })).toBeInTheDocument();
  });

  it('succeeds when Google Maps API has not loaded yet', () => {
    // Make Google Maps API never load
    (useJsApiLoader as jest.MockedFn<typeof useJsApiLoader>)
      .mockReset()
      .mockImplementation(() => ({
        isLoaded: false,
        loadError: undefined,
      }));

    const { getByRole } = render(<ComponentWithMocks />);

    userEvent.type(
      getByRole('combobox', { name: 'Street' }),
      '123 Main Street',
    );

    expect(useJsApiLoader).toHaveBeenCalled();
    expect(window.google).toBeUndefined();
  });

  it('queries the Google Maps places API for predictions', async () => {
    const { getByRole, getByTestId, queryByTestId } = render(
      <ComponentWithMocks />,
    );

    // Let Google Maps initialize
    jest.runOnlyPendingTimers();

    userEvent.type(getByRole('combobox', { name: 'Street' }), '100 Lake Hart');
    expect(getByTestId('LoadingPredictions')).toBeInTheDocument();

    jest.advanceTimersByTime(2000);
    await act(async () => {
      await placePromise;
    });

    expect(queryByTestId('LoadingPredictions')).not.toBeInTheDocument();

    userEvent.click(
      getByRole('option', { name: '100 Lake Hart Dr, Orlando, FL 32832, USA' }),
    );
    expect(getDetails).toHaveBeenCalled();
    expect(getByRole('textbox', { name: 'City' })).toHaveValue('Orlando');
    expect(getByRole('combobox', { name: 'Street' })).toHaveValue(
      'A/100 Lake Hart Drive',
    );
  });

  it('does not query for predictions when the street is empty', async () => {
    const { getByRole } = render(<ComponentWithMocks />);

    // Let Google Maps initialize
    jest.runOnlyPendingTimers();

    userEvent.type(getByRole('combobox', { name: 'Street' }), '100 Lake Hart');

    jest.advanceTimersByTime(2000);
    expect(getPlacePredictions).toHaveBeenCalledTimes(1);
    await act(async () => {
      await placePromise;
    });

    userEvent.clear(getByRole('combobox', { name: 'Street' }));
    jest.advanceTimersByTime(2000);
    expect(getPlacePredictions).toHaveBeenCalledTimes(1);
  });

  it('changing the focus cancels loading predictions', () => {
    const { getByRole, queryByTestId } = render(<ComponentWithMocks />);

    // Let Google Maps initialize
    jest.runOnlyPendingTimers();

    userEvent.type(getByRole('combobox', { name: 'Street' }), '100 Lake Hart');
    jest.advanceTimersByTime(100);
    userEvent.click(getByRole('textbox', { name: 'City' }));

    expect(queryByTestId('LoadingPredictions')).not.toBeInTheDocument();
  });

  describe('parsePlace', () => {
    it('parses places', () => {
      expect(parsePlace(place)).toEqual({
        street: 'A/100 Lake Hart Drive',
        city: 'Orlando',
        region: 'Orange County',
        metroArea: 'Orlando',
        state: 'FL',
        country: 'United States',
        postalCode: '32832',
      });
    });
  });
});
