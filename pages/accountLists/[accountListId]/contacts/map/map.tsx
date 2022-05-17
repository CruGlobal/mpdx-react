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
import { StatusEnum } from '../../../../../graphql/types.generated';
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
  status: StatusEnum | undefined | null;
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

// TODO: Determine how default center
const center = {
  lat: 44.967243,
  lng: -103.771556,
};

export const ContactsMap: React.FC<ContactsMapProps> = ({
  onContactSelected,
  data,
}) => {
  const [selected, setSelected] = useState<Coordinates | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  });

  const getStatusPin = (status: StatusEnum | null | undefined) => {
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

  return (
    <>
      {!loadError && isLoaded ? (
        // Important! Always set the container height explicitly
        <div style={{ height: 'calc(100vh - 156px)', width: '100%' }}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={5}
            center={center}
            options={options}
          >
            {data &&
              data.map((contact) => {
                if (!contact) {
                  return;
                }
                const statusPin = getStatusPin(contact.status);
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
                        status: contact?.status,
                        id: contact?.id,
                        street: contact?.street || '',
                        city: contact?.city || '',
                        country: contact?.country || '',
                        postal: contact?.postal || '',
                      });
                    }}
                    icon={{
                      url: `/images/pin${statusPin}.png`,
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
