import { useDebouncedCallback } from 'src/hooks/useDebounce';
import { useMemo, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormikContext } from 'formik';
import {
  Autocomplete,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import { useJsApiLoader } from '@react-google-maps/api';
import { CreateAddressSchema } from '../AddAddressModal/createAddressSchema';
import { UpdateAddressSchema } from '../EditContactAddressModal/updateAddressSchema';

interface MapsApi {
  autocompleteService: google.maps.places.AutocompleteService;
  placesService: google.maps.places.PlacesService;
  sessionToken: google.maps.places.AutocompleteSessionToken;
}

type FormSchema = CreateAddressSchema | UpdateAddressSchema;

// Convert a Google Maps place into its constituent form field values
export const parsePlace = (
  place: google.maps.places.PlaceResult,
): Partial<FormSchema> => {
  const updatedFields: Partial<FormSchema> = {
    street: '',
    metroArea: '',
  };

  place.address_components?.forEach((addressComponent) => {
    switch (addressComponent.types[0]) {
      case 'subpremise':
        updatedFields.street += addressComponent.long_name + '/';
        break;
      case 'street_number':
        updatedFields.street += addressComponent.long_name + ' ';
        break;
      case 'route':
        updatedFields.street += addressComponent.long_name;
        break;
      case 'administrative_area_level_1':
        updatedFields.state = addressComponent.short_name;
        break;
      case 'administrative_area_level_2':
        updatedFields.region = addressComponent.long_name;
        break;
      case 'administrative_area_level_3':
        updatedFields.metroArea = addressComponent.long_name;
        break;
      case 'country':
        updatedFields.country = addressComponent.long_name;
        break;
      case 'postal_code':
        updatedFields.postalCode = addressComponent.long_name;
        break;
      case 'locality':
        updatedFields.city = addressComponent.long_name;
        break;
    }
  });

  return updatedFields;
};

export const StreetAutocomplete: React.FC = () => {
  const { t } = useTranslation();
  const googleAttributionRef = useRef<HTMLDivElement | null>(null);

  const { values, handleChange, setFieldValue } =
    useFormikContext<CreateAddressSchema>();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    libraries: useMemo(() => ['places'], []),
  });

  const mapsApi = useRef<MapsApi>();

  useEffect(() => {
    if (isLoaded) {
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
      if (street === values.street) {
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
          Object.entries(parsePlace(result)).forEach(([field, value]) => {
            setFieldValue(field, value);
          });

          if (!values.location) {
            setFieldValue('location', 'Home');
          }
        }
      },
    );
  };

  return (
    <>
      <Autocomplete
        freeSolo
        disableClearable
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.description
        }
        options={predictions}
        value={values.street}
        onChange={(_event, newValue) => {
          if (typeof newValue === 'string') {
            setFieldValue('street', newValue);
          } else {
            handlePlaceChosen(newValue);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            name="street"
            label={t('Street')}
            required
            onChange={(event) => {
              handleChange(event);

              const street = event.target.value;
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
            fullWidth
          />
        )}
      />
      <Typography component="div" ref={googleAttributionRef} />
    </>
  );
};
