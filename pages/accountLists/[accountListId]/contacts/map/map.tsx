import React, { useEffect, useState, useRef } from 'react';
import Geocode from 'react-geocode';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { Avatar, Box, styled, Typography } from '@material-ui/core';
import { ContactFilterSetInput } from '../../../../../graphql/types.generated';
import { useContactsQuery } from '../Contacts.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';

const ContactLink = styled(Typography)(({ theme }) => ({
  color: theme.palette.mpdxBlue.main,
  '&:hover': {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}));

interface ContactsMapProps {
  selectedIds: string[];
  selectedFilters: ContactFilterSetInput;
  searchTerm?: string | string[];
  onContactSelected: (
    contactId: string,
    openDetails: boolean,
    flows: boolean,
  ) => void;
}

interface ContactCardProps {
  contactId: string;
  contactName: string;
  contactAddress: {
    id: string;
    street: string;
  };
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

Geocode.setApiKey(process.env.GOOGLE_GEOCODE_API_KEY);

const mapContainerStyle = {
  height: '100vh',
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ContactCard: React.FC<ContactCardProps> = () => {
  return (
    <div>
      <strong>Contact Name</strong>
      <p>
        Address Line 1<br />
        City State
        <br />
        Postal
        <br />
        Country
        <br />
      </p>
    </div>
  );
};

export const ContactsMap: React.FC<ContactsMapProps> = ({
  onContactSelected,
  selectedFilters,
  searchTerm,
}) => {
  const accountListId = useAccountListId();
  const [contactData, setCcc] = useState<Coordinates[]>([]);
  const [selected, setSelected] = useState<Coordinates | null>(null);
  const { data, loading, fetchMore } = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters: {
        ...selectedFilters,
        wildcardSearch: searchTerm as string,
      },
    },
    skip: !accountListId,
  });

  const mapRef = useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  });

  const getCoords = async () => {
    const coords: Coordinates[] = [];
    if (!data) {
      return;
    }
    for (const contact of data?.contacts.nodes) {
      if (!contact.primaryAddress?.street) {
        continue;
      }
      await Geocode.fromAddress(`${contact.primaryAddress.street}`).then(
        (response: {
          results: { geometry: { location: { lat: any; lng: any } } }[];
        }) => {
          const { lat, lng } = response.results[0].geometry.location;
          coords.push({
            id: contact.id,
            name: contact.name,
            avatar: contact.avatar,
            lat,
            lng,
            street: contact.primaryAddress?.street || '',
            city: contact.primaryAddress?.city || '',
            country: contact.primaryAddress?.country || '',
            postal: contact.primaryAddress?.postalCode || '',
          });
        },
        (error: any) => {
          console.error(error);
        },
      );
    }
    setCcc(coords);
  };

  useEffect(() => {
    if (!loading) {
      if (data?.contacts.pageInfo.hasNextPage) {
        fetchMore({
          variables: {
            after: data.contacts?.pageInfo.endCursor,
          },
        });
      } else {
        getCoords();
      }
    }
  }, [loading]);

  return (
    // Important! Always set the container height explicitly
    <>
      {!loadError && isLoaded && (
        <div style={{ height: '100vh', width: '100%' }}>
          <GoogleMap
            id="map"
            mapContainerStyle={mapContainerStyle}
            zoom={8}
            center={center}
            onLoad={onMapLoad}
            options={options}
          >
            {contactData.map((coord) => (
              <Marker
                key={`${coord.lat}-${coord.lng}`}
                position={{ lat: coord.lat, lng: coord.lng }}
                onClick={() => {
                  setSelected(coord);
                }}
                icon={{
                  url: '/images/pin.png',
                  origin: new window.google.maps.Point(0, 0),
                  anchor: new window.google.maps.Point(15, 15),
                  scaledSize: new window.google.maps.Size(30, 30),
                }}
              />
            ))}

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
