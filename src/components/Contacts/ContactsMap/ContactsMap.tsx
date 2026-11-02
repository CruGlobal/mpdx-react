import NextLink from 'next/link';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Box, Button, CircularProgress, Link, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  GoogleMap,
  InfoWindowF,
  Marker,
  MarkerClusterer,
  useJsApiLoader,
} from '@react-google-maps/api';
import { useTranslation } from 'react-i18next';
import { useContactPanel } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import { StatusEnum } from 'src/graphql/types.generated';
import { useContactPartnershipStatuses } from 'src/hooks/useContactPartnershipStatuses';
import { sourceToStr } from 'src/lib/sourceHelper';
import theme from 'src/theme';
import {
  ContactsContext,
  ContactsType,
} from '../ContactsContext/ContactsContext';

const InlineTypography = styled(Typography)(() => ({
  display: 'inline',
}));

const MapLoading = styled(CircularProgress)(() => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
}));

const ZoomToFitButton = styled(Button)(() => ({
  position: 'absolute',
  top: theme.spacing(1.5),
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 701, // above the map
}));

const mapContainerStyle = {
  height: '100%',
  width: '100%',
  zIndex: 700, // contact details drawer are 800
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
};

const defaultCenter = {
  lat: 40,
  lng: -95,
};

export const ContactsMap: React.FC = ({}) => {
  const { t } = useTranslation();
  const {
    mapData: data,
    mapRef,
    selected,
    setSelected,
  } = React.useContext(ContactsContext) as ContactsType;
  const { contactStatuses } = useContactPartnershipStatuses();
  const { buildContactUrl } = useContactPanel();

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    libraries: useRef(['places' as const]).current,
  });

  useEffect(() => {
    // Add styles to Helpjuice beacon to move left of Google zoom buttons.
    const beacon = document.querySelector('#helpjuice-widget.bottomRight');
    if (!(beacon instanceof HTMLElement)) {
      return;
    }
    const oldRight = beacon.style.getPropertyValue('right');
    const oldWidgetRight = beacon.style.getPropertyValue('--widget-right');
    beacon.style.setProperty('right', '120px', 'important');
    // helpjuice.css lines the popup up with the button on phones from --widget-right
    beacon.style.setProperty('--widget-right', '120px');
    return () => {
      beacon.style.setProperty('right', oldRight);
      beacon.style.setProperty('--widget-right', oldWidgetRight);
    };
  }, []);

  const contactBounds = useMemo(() => {
    if (!data || !isLoaded) {
      return null;
    }

    const bounds = new window.google.maps.LatLngBounds();
    data.forEach((contact) => {
      if (typeof contact.lat === 'number' && typeof contact.lng === 'number') {
        bounds.extend({ lat: contact.lat, lng: contact.lng });
      }
    });
    return bounds.isEmpty() ? null : bounds;
  }, [data, isLoaded]);

  // Once the user pans or zooms, stop fitting the map to the contacts as more
  // pages of contacts load, so that we don't undo what they just did
  const [userMovedMap, setUserMovedMap] = useState(false);
  // Camera changes caused by fitBounds (and the map's initial setup) until the
  // next idle event, which shouldn't count as the user moving the map
  const autoMoving = useRef(true);
  const fittedBounds = useRef<google.maps.LatLngBounds | null>(null);

  const fitToContacts = useCallback(() => {
    if (!contactBounds || !mapRef.current) {
      return;
    }

    autoMoving.current = true;
    fittedBounds.current = contactBounds;
    mapRef.current.fitBounds(contactBounds);
  }, [contactBounds]);

  useEffect(() => {
    // Skip refitting when a new page of contacts didn't change the bounds,
    // because the map won't move and won't fire the idle event
    if (!userMovedMap && !contactBounds?.equals(fittedBounds.current)) {
      fitToContacts();
    }
  }, [contactBounds, fitToContacts, userMovedMap, mapRef.current]);

  const handleCameraChanged = useCallback(() => {
    if (!autoMoving.current) {
      setUserMovedMap(true);
    }
  }, []);

  const handleIdle = useCallback(() => {
    autoMoving.current = false;
  }, []);

  const handleZoomToFit = () => {
    setUserMovedMap(false);
    fitToContacts();
  };

  const getStatusPin = (status: StatusEnum | null | undefined): string => {
    return status && contactStatuses[status] ? status.toLowerCase() : 'grey';
  };

  return !loadError && isLoaded ? (
    // Important! Always set the container height explicitly
    // Top bar is 96px + header is 60px = 156px
    <div
      style={{
        height: 'calc(100vh - 156px)',
        width: '100%',
        position: 'relative',
      }}
    >
      {userMovedMap && contactBounds && (
        <ZoomToFitButton
          variant="contained"
          size="small"
          onClick={handleZoomToFit}
        >
          {t('Zoom to Fit')}
        </ZoomToFitButton>
      )}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        id="map"
        zoom={5}
        center={defaultCenter}
        options={options}
        onLoad={onMapLoad}
        onClick={() => setSelected(null)}
        onCenterChanged={handleCameraChanged}
        onZoomChanged={handleCameraChanged}
        onIdle={handleIdle}
      >
        {data && (
          <MarkerClusterer>
            {(clusterer) => (
              <>
                {data.map(
                  (contact) =>
                    typeof contact.lat === 'number' &&
                    typeof contact.lng === 'number' && (
                      <Marker
                        key={contact.id}
                        clusterer={clusterer}
                        position={{
                          lat: contact.lat,
                          lng: contact.lng,
                        }}
                        onClick={() => {
                          setSelected(contact);
                        }}
                        icon={{
                          url: `/images/pin_${getStatusPin(
                            contact.status,
                          )}.png`,
                          origin: new window.google.maps.Point(0, 0),
                          anchor: new window.google.maps.Point(15, 48),
                          scaledSize: new window.google.maps.Size(30, 48),
                        }}
                      />
                    ),
                )}
              </>
            )}
          </MarkerClusterer>
        )}
        {/* Using InfoWindowF instead of InfoWindow as there is a problem with React Strict rendering the component twice. */}
        {selected ? (
          <InfoWindowF
            position={{
              lat: selected.lat ?? 0,
              lng: selected.lng ?? 0,
            }}
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            {/*Box width the same size as old app (224px)*/}
            <Box minWidth={theme.spacing(28)}>
              <Typography style={{ fontWeight: 550 }}>
                {selected.name}
              </Typography>
              <Typography>{selected.street}</Typography>
              <Typography>{`${selected.city} ${selected.state} ${selected.postal}`}</Typography>
              <InlineTypography sx={{ marginRight: 0.5 }}>
                {t('Source:')}
              </InlineTypography>
              <InlineTypography sx={{ marginRight: 0.5 }}>
                {sourceToStr(t, selected.source ?? '')}
              </InlineTypography>
              <InlineTypography>{selected.date}</InlineTypography>
              <Typography>
                <Link
                  component={NextLink}
                  href={buildContactUrl(selected.id)}
                  shallow
                >
                  {t('Show Contact')}
                </Link>
              </Typography>
            </Box>
          </InfoWindowF>
        ) : null}
      </GoogleMap>
    </div>
  ) : (
    <MapLoading />
  );
};
