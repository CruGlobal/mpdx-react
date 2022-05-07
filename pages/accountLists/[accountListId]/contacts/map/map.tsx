import React, { useState } from 'react';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import {
  Avatar,
  Box,
  CircularProgress,
  styled,
  Typography,
} from '@material-ui/core';
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

interface ContactsMapProps {
  loadingAll: boolean;
  data: (Coordinates | undefined)[] | undefined;
  onContactSelected: (
    contactId: string,
    openDetails: boolean,
    flows: boolean,
    map: boolean,
  ) => void;
}

interface Coordinates {
  id: string | undefined | null;
  name: string | undefined | null;
  avatar: string | undefined | null;
  lat: number | undefined | null;
  lng: number | undefined | null;
  street: string | undefined | null;
  city: string | undefined | null;
  country: string | undefined | null;
  postal: string | undefined | null;
}

const mapContainerStyle = {
  height: '100%',
  width: '100vw',
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

const center = {
  lat: 43.6532,
  lng: -79.3832,
};

export const ContactsMap: React.FC<ContactsMapProps> = ({
  onContactSelected,
  data,
  loadingAll,
}) => {
  const [selected, setSelected] = useState<Coordinates | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  });

  return (
    <>
      {!loadError && isLoaded ? (
        // Important! Always set the container height explicitly
        <div style={{ height: 'calc(100vh - 156px)', width: '100%' }}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={8}
            center={center}
            options={options}
          >
            {data &&
              data.map((contact) => {
                if (!contact) {
                  return;
                }
                return (
                  <Marker
                    key={contact?.id}
                    position={{
                      lat: contact?.lat || 0,
                      lng: contact?.lng || 0,
                    }}
                    onClick={() => {
                      setSelected({
                        name: contact?.name,
                        lat: contact?.lat,
                        lng: contact?.lng,
                        avatar: contact?.avatar,
                        id: contact?.id,
                        street: contact?.street || '',
                        city: contact?.city || '',
                        country: contact?.country || '',
                        postal: contact?.postal || '',
                      });
                    }}
                    icon={{
                      url: '/images/pin.png',
                      origin: new window.google.maps.Point(0, 0),
                      anchor: new window.google.maps.Point(15, 48),
                      scaledSize: new window.google.maps.Size(30, 48),
                    }}
                  />
                );
              })}

            {selected ? (
              <InfoWindow
                position={{ lat: selected.lat || 0, lng: selected.lng || 0 }}
                onCloseClick={() => {
                  setSelected(null);
                }}
              >
                <Box>
                  <Avatar
                    src={selected.avatar || ''}
                    style={{
                      width: theme.spacing(4),
                      height: theme.spacing(4),
                    }}
                  />
                  <Typography variant="h6">{selected.name}</Typography>
                  <Typography variant="body2">{selected.street}</Typography>
                  <Typography variant="body2">{selected.city}</Typography>
                  <Typography variant="body2">{selected.postal}</Typography>
                  <Typography variant="body2">{selected.country}</Typography>
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
