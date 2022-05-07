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
import { Contact } from '../../../../../graphql/types.generated';
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
  data: Contact[] | undefined;
  onContactSelected: (
    contactId: string,
    openDetails: boolean,
    flows: boolean,
  ) => void;
}

interface Coordinates {
  id: string;
  name: string;
  avatar: string;
  lat: number;
  lng: number;
  street: string;
  city: string;
  country: string;
  postal: string;
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
      {loadError || !isLoaded || loadingAll ? (
        <MapLoading />
      ) : (
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
                if (!contact.primaryAddress?.geo) {
                  return;
                }
                const coords = contact.primaryAddress?.geo?.split(',');
                const [lat, lng] = coords;
                return (
                  <Marker
                    key={contact.id}
                    position={{ lat: Number(lat), lng: Number(lng) }}
                    onClick={() => {
                      setSelected({
                        name: contact.name,
                        lat: Number(lat),
                        lng: Number(lng),
                        avatar: contact.avatar,
                        id: contact.id,
                        street: contact.primaryAddress?.street || '',
                        city: contact.primaryAddress?.city || '',
                        country: contact.primaryAddress?.country || '',
                        postal: contact.primaryAddress?.postalCode || '',
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
                position={{ lat: selected.lat, lng: selected.lng }}
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
                    onClick={() => onContactSelected(selected.id, true, true)}
                  >
                    Show Contact
                  </ContactLink>
                </Box>
              </InfoWindow>
            ) : null}
          </GoogleMap>
        </div>
      )}
    </>
  );
};
