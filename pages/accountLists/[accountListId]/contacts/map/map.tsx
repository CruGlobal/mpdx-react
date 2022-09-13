import React, { useCallback } from 'react';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  MarkerClusterer,
  InfoWindow,
} from '@react-google-maps/api';
import { Box, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { StatusEnum } from '../../../../../graphql/types.generated';
import { ContactsPageContext, ContactsPageType } from '../ContactsPageContext';
import theme from 'src/theme';

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

export interface Coordinates {
  id: string | undefined | null;
  name: string | undefined | null;
  avatar: string | undefined | null;
  status?: StatusEnum | undefined | null;
  lat?: number | undefined | null;
  lng?: number | undefined | null;
  street?: string | undefined | null;
  city?: string | undefined | null;
  state?: string | undefined | null;
  country?: string | undefined | null;
  postal?: string | undefined | null;
  source?: string;
  date?: string;
}

const mapContainerStyle = {
  height: '100%',
  width: '100vw',
  zIndex: 2000,
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
};

// TODO: Determine how default center
const center = {
  lat: 44.967243,
  lng: -103.771556,
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
  } = React.useContext(ContactsPageContext) as ContactsPageType;

  const onMapLoad = useCallback((map) => {
    // eslint-disable-next-line
    // @ts-ignore
    mapRef.current = map;
  }, []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  });

  return (
    <>
      {!loadError && isLoaded ? (
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
            center={center}
            options={options}
            onLoad={onMapLoad}
            onClick={() => setSelected(null)}
          >
            {data && (
              <MarkerClusterer>
                {(clusterer) =>
                  data
                    .filter((contact) => contact?.lat)
                    .map((contact) => (
                      <Marker
                        key={contact?.id}
                        clusterer={clusterer}
                        position={{
                          lat: contact?.lat || 0,
                          lng: contact?.lng || 0,
                        }}
                        onClick={() => {
                          setSelected(contact);
                        }}
                        icon={{
                          url: `/images/pin${getStatusPin(
                            contact?.status,
                          )}.png`,
                          origin: new window.google.maps.Point(0, 0),
                          anchor: new window.google.maps.Point(15, 48),
                          scaledSize: new window.google.maps.Size(30, 48),
                        }}
                      />
                    ))
                }
              </MarkerClusterer>
            )}

            {selected ? (
              <InfoWindow
                position={{ lat: selected.lat || 0, lng: selected.lng || 0 }}
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
                    {selected.source}
                  </Typography>
                  <Typography display="inline">{selected.date}</Typography>
                  <ContactLink
                    onClick={() =>
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      onContactSelected(selected.id!, true, false, true)
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
      )}
    </>
  );
};
