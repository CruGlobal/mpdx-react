import { useState } from 'react';
import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  getDetails,
  getPlacePredictions,
  place,
  placePromise,
  setupMocks,
  useJsApiLoaderMock,
} from '__tests__/util/googlePlacesMock';
import { StreetAutocomplete, parsePlace } from './StreetAutocomplete';

jest.mock('@react-google-maps/api');

const onStreetChange = jest.fn();
const onPredictionChosen = jest.fn();

const ComponentWithMocks = () => {
  const [street, setStreet] = useState('');

  return (
    <div data-testid="container">
      <StreetAutocomplete
        streetValue={street}
        onStreetChange={(street) => {
          setStreet(street);
          onStreetChange(street);
        }}
        onPredictionChosen={onPredictionChosen}
        TextFieldProps={{
          label: 'Street',
        }}
      />
    </div>
  );
};

describe('StreetAutocomplete', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setupMocks();
  });

  it('renders', () => {
    const { getByRole } = render(<ComponentWithMocks />);

    expect(getByRole('combobox', { name: 'Street' })).toBeInTheDocument();
  });

  it('succeeds when Google Maps API has not loaded yet', () => {
    // Make Google Maps API never load
    useJsApiLoaderMock.mockReset().mockImplementation(() => ({
      isLoaded: false,
      loadError: undefined,
    }));

    const { getByRole } = render(<ComponentWithMocks />);

    userEvent.type(
      getByRole('combobox', { name: 'Street' }),
      '123 Main Street',
    );

    expect(useJsApiLoaderMock).toHaveBeenCalled();
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
    expect(onPredictionChosen).toHaveBeenLastCalledWith({
      city: 'Orlando',
      country: 'United States',
      metroArea: 'Orlando',
      postalCode: '32832',
      region: 'Orange County',
      state: 'FL',
      street: 'A/100 Lake Hart Drive',
    });
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
    const { getByRole, getByTestId, queryByTestId } = render(
      <ComponentWithMocks />,
    );

    // Let Google Maps initialize
    jest.runOnlyPendingTimers();

    userEvent.type(getByRole('combobox', { name: 'Street' }), '100 Lake Hart');
    jest.advanceTimersByTime(100);
    userEvent.click(getByTestId('container'));

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
