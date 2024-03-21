import React, { useCallback, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  GoogleMap,
  InfoWindow,
  Marker,
  MarkerClusterer,
  useJsApiLoader,
} from '@react-google-maps/api';
import { useTranslation } from 'react-i18next';
import { StatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { sourceToStr } from 'src/utils/sourceToStr';
import {
  ContactsContext,
  ContactsType,
} from '../ContactsContext/ContactsContext';

const ContactLink = styled(Typography)(({ theme }) => ({
  color: theme.palette.mpdxBlue.main,
  '&:hover': {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}));

const MapLoading = styled(CircularProgress)(() => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
}));

const mapContainerStyle = {
  height: '100%',
  width: '100%',
  zIndex: 2000,
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
};

const defaultCenter = {
  lat: 40,
  lng: -95,
};

const getStatusPin = (status: StatusEnum | null | undefined): string => {
  switch (status) {
    case StatusEnum.AppointmentScheduled:
      return '_appt_scheduled';
    case StatusEnum.AskInFuture:
      return '_ask_in_future';
    case StatusEnum.CallForDecision:
      return '_call_for_decision';
    case StatusEnum.ContactForAppointment:
      return '_contact_for_appt';
    case StatusEnum.CultivateRelationship:
      return '_cultivate_relationship';
    case StatusEnum.NeverContacted:
      return '_never_contacted';
    case StatusEnum.PartnerFinancial:
      return '_partner_financial';
    case StatusEnum.PartnerPray:
      return '_partner_pray';
    case StatusEnum.PartnerSpecial:
      return '_partner_special';
    default:
      return '_grey';
  }
};

export const ContactsMap: React.FC = ({}) => {
  const { t } = useTranslation();
  const {
    mapData: data,
    mapRef,
    selected,
    setSelected,
    setContactFocus: onContactSelected,
  } = React.useContext(ContactsContext) as ContactsType;

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    libraries: useRef(['places' as const]).current,
  });

  useEffect(() => {
    // Add styles to HelpScout Beacon to move left of Google zoom buttons.
    const beacon = document.querySelector(
      '#beacon-container .BeaconFabButtonFrame',
    ) as HTMLElement;
    if (!beacon) return;
    beacon.style.setProperty('right', '60px', 'important');
    return () => beacon.style.setProperty('right', '20px');
  }, []);

  useEffect(() => {
    if (!data || !isLoaded || !mapRef.current) {
      return;
    }

    // Update the map to contain all of the contacts' locations
    const bounds = new window.google.maps.LatLngBounds();
    data.forEach((contact) => {
      if (typeof contact.lat === 'number' && typeof contact.lng === 'number')
        bounds.extend({ lat: contact.lat, lng: contact.lng });
    });
    mapRef.current.fitBounds(bounds);
  }, [data, isLoaded, mapRef.current]);

  return !loadError && isLoaded ? (
    // Important! Always set the container height explicitly
    // Top bar is 96px + header is 60px = 156px
    <div
      style={{
        height: 'calc(100vh - 156px)',
        width: '100%',
      }}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        id="map"
        zoom={5}
        center={defaultCenter}
        options={options}
        onLoad={onMapLoad}
        onClick={() => setSelected(null)}
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
                          url: `/images/pin${getStatusPin(contact.status)}.png`,
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

        {selected ? (
          <InfoWindow
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
              <Typography
                display="inline"
                style={{ marginRight: theme.spacing(0.5) }}
              >
                {t('Source:')}
              </Typography>
              <Typography
                display="inline"
                style={{ marginRight: theme.spacing(0.5) }}
              >
                {sourceToStr(t, selected.source ?? '')}
              </Typography>
              <Typography display="inline">{selected.date}</Typography>
              <ContactLink
                onClick={() =>
                  onContactSelected(selected.id, true, false, true)
                }
              >
                Show Contact
              </ContactLink>
            </Box>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </div>
  ) : (
    <MapLoading />
  );
};
