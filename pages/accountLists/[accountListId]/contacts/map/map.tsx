import React, { useEffect, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import Geocode from 'react-geocode';
import { useContactsQuery } from '../Contacts.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';

interface ContactsMapProps {
  selectedIds: string[];
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
  lat: number;
  lng: number;
}

Geocode.setApiKey(process.env.GOOGLE_GEOCODE_API_KEY);

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
      <a className="btn btn-primary" href="/">
        Show Contact
      </a>
    </div>
  );
};

interface MapMarkerProps {
  lat: number;
  lng: number;
}

const MapMarker: React.FC<MapMarkerProps> = () => {
  return (
    <div>
      <img src={'/images/pin.png'} alt={'pin'} />
    </div>
  );
};

export const ContactsMap: React.FC<ContactsMapProps> = () => {
  const accountListId = useAccountListId();
  const [ccc, setCcc] = useState<Coordinates[]>([]);
  const { data, loading, fetchMore } = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
    },
    skip: !accountListId,
  });

  // const getCoords = async (address: string) => {
  //   let x = {};
  //   await Geocode.fromAddress(`${address}`).then(
  //     (response: {
  //       results: { geometry: { location: { lat: any; lng: any } } }[];
  //     }) => {
  //       const { lat, lng } = response.results[0].geometry.location;
  //       x = { lat, lng };
  //     },
  //     (error: any) => {
  //       console.error(error);
  //     },
  //   );
  //   return x;
  // };

  // const filterCoords = () => {
  //   const v = [];
  //   const coords = data?.contacts.nodes.map((contact) => {
  //     // console.log(contact.name);
  //     // console.log(contact.primaryAddress?.street);
  //     if (!contact.primaryAddress?.street) {
  //       return;
  //     }
  //     const z = { lat: 0, lng: 0 };
  //     getCoords(contact.primaryAddress?.street).then((x) => {
  //       //console.log(`${contact.name} ${x.lat}`);
  //       if (x.lat) {
  //         setCcc([...ccc, { lat: x.lat, lng: x.lng }]);
  //       }
  //     });
  //     return z;
  //   });
  //   const filtered = coords?.filter((coord) => coord !== undefined);
  //   //console.log(filtered);
  //   //setCcc(filtered);
  // };

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
          coords.push({ lat, lng });
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
      getCoords();
    }
  }, [loading]);

  return (
    // Important! Always set the container height explicitly
    <div style={{ height: '100vh', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.GOOGLE_MAPS_API_KEY }}
        defaultCenter={{ lat: 59.95, lng: 30.33 }}
        defaultZoom={11}
      >
        {ccc.map((coord, index) => (
          <MapMarker lat={coord.lat} lng={coord.lng} key={index} />
        ))}
      </GoogleMapReact>
    </div>
  );
};
