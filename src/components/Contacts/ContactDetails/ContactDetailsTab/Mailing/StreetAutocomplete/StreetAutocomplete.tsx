import { useEffect, useRef, useState } from 'react';
import {
  Autocomplete,
  CircularProgress,
  TextField,
  TextFieldProps,
  Typography,
} from '@mui/material';
import { useJsApiLoader } from '@react-google-maps/api';
import { AddressCreateInput } from 'src/graphql/types.generated';
import { useDebouncedCallback } from 'src/hooks/useDebounce';

interface MapsApi {
  autocompleteService: google.maps.places.AutocompleteService;
  placesService: google.maps.places.PlacesService;
  sessionToken: google.maps.places.AutocompleteSessionToken;
}

export type AddressFields = Pick<
  AddressCreateInput,
  | 'city'
  | 'country'
  | 'metroArea'
  | 'postalCode'
  | 'region'
  | 'state'
  | 'street'
>;

// Convert a Google Maps place into its constituent form field values
export const parsePlace = (
  place: google.maps.places.PlaceResult,
): AddressFields => {
  const updatedFields: AddressFields = {
    street: '',
    metroArea: '',
  };

  // Unit, apartment, or suite number
  let subpremise = '';
  place.address_components?.forEach((addressComponent) => {
    const { long_name: longName, short_name: shortName } = addressComponent;
    switch (addressComponent.types[0]) {
      case 'subpremise':
        subpremise = longName;
        break;
      case 'street_number':
        updatedFields.street += longName + ' ';
        break;
      case 'route':
        updatedFields.street += longName;
        break;
      case 'administrative_area_level_1':
        updatedFields.state = shortName;
        break;
      case 'administrative_area_level_2':
        updatedFields.region = longName;
        break;
      case 'administrative_area_level_3':
        updatedFields.metroArea = longName;
        break;
      case 'country':
        updatedFields.country = longName;
        break;
      case 'postal_code':
        updatedFields.postalCode = longName;
        break;
      case 'locality':
        updatedFields.city = longName;
        break;
    }
  });

  // TODO - Replace this manual formatting with a library that can handle all edge cases
  // We should use Google Places API to format the address.
  if (subpremise) {
    if (
      updatedFields.country === 'United States' ||
      updatedFields.country === 'Singapore'
    ) {
      // Adding subpremise to the end of street as this is preferred by USPS and other mail carriers
      // Singapore prefers subpremise to be at the end of the street with a "#" prefix
      updatedFields.street +=
        updatedFields.country === 'United States'
          ? ` ${subpremise}`
          : ` #${subpremise}`;
    } else {
      // Adding subpremise to the end of street as this is preferred by USPS and other mail carriers
      updatedFields.street = `${subpremise}/${updatedFields.street}`;
    }
  }

  return updatedFields;
};

export interface StreetAutocompleteProps {
  streetValue: string;
  onStreetChange: (street: string) => void;
  onPredictionChosen: (fields: AddressFields) => void;
  TextFieldProps?: TextFieldProps;
  disabled?: boolean;
}

export const StreetAutocomplete: React.FC<StreetAutocompleteProps> = ({
  streetValue,
  onStreetChange,
  onPredictionChosen,
  TextFieldProps,
  disabled,
}) => {
  const googleAttributionRef = useRef<HTMLDivElement | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    libraries: useRef(['places' as const]).current,
  });

  const mapsApi = useRef<MapsApi>();

  useEffect(() => {
    if (isLoaded) {
      // Bizz 05/23/2023 - Removing this as a precaution as we think we've fixed the error.
      // if (!window.google.maps.places) return;
      mapsApi.current = {
        autocompleteService:
          new window.google.maps.places.AutocompleteService(),
        placesService: new window.google.maps.places.PlacesService(
          googleAttributionRef.current ?? document.createElement('div'),
        ),
        sessionToken: new window.google.maps.places.AutocompleteSessionToken(),
      };
    }
  }, [isLoaded]);

  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);

  const loadPredictions = useDebouncedCallback(
    async (mapsApi: MapsApi, street: string) => {
      const { autocompleteService, sessionToken } = mapsApi;
      const { predictions } = await autocompleteService.getPlacePredictions({
        input: street,
        sessionToken,
      });

      // Ignore stale predictions (i.e. the street we loaded predictions for is now different from the current street)
      if (street === streetValue) {
        setPredictions(predictions);
        setLoadingPredictions(false);
      }
    },
    1500,
  );

  const handlePlaceChosen = (
    place: google.maps.places.AutocompletePrediction,
  ) => {
    if (!mapsApi.current) {
      // This branch is needed for type narrowing but is impossible to reach because there will
      // only ever be place predictions after mapsApi.current is not undefined
      /* istanbul ignore next */
      return;
    }

    const { placesService, sessionToken } = mapsApi.current;
    placesService.getDetails(
      {
        placeId: place.place_id,
        sessionToken,
        fields: ['address_components'],
      },
      (result, status) => {
        if (result && status === 'OK') {
          onPredictionChosen(parsePlace(result));
        }
      },
    );
  };

  return (
    <>
      <Autocomplete
        freeSolo
        disableClearable
        autoHighlight
        disabled={disabled}
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.description
        }
        options={predictions}
        // Disable filtering addresses by the input and rely on the Google Maps API to provide
        // relevant address predictions
        filterOptions={(options) => options}
        value={streetValue}
        onChange={(_event, newValue) => {
          if (typeof newValue === 'string') {
            onStreetChange(newValue);
          } else {
            onStreetChange(newValue.description);
            handlePlaceChosen(newValue);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            {...TextFieldProps}
            multiline
            onChange={(event) => {
              const street = event.target.value;
              onStreetChange(street);
              if (mapsApi.current && street) {
                setLoadingPredictions(true);
                loadPredictions(mapsApi.current, street);
              } else {
                setLoadingPredictions(false);
                setPredictions([]);
              }
            }}
            onBlur={() => {
              setLoadingPredictions(false);
              setPredictions([]);
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: loadingPredictions ? (
                <CircularProgress
                  color="primary"
                  size={20}
                  data-testid="LoadingPredictions"
                />
              ) : null,
            }}
          />
        )}
      />
      <Typography component="div" ref={googleAttributionRef} />
    </>
  );
};
