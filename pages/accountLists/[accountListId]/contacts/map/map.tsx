import GoogleMapReact from 'google-map-react';

interface ContactsMapProps {
  selectedIds: string[];
}

interface ContactCardProps {
  contactId: string;
  contactName: string;
  contactAddress: object;
}

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
      <a className="btn btn-primary">Show Contact</a>
    </div>
  );
};

interface MapMarkerProps {
  latitude: number;
  longitude: number;
}

const MapMarker: React.FC<MapMarkerProps> = () => {
  return (
    <div>
      <img src={'/images/pin.png'} alt={'pin'} />
    </div>
  );
};

export const ContactsMap: React.FC<ContactsMapProps> = () => {
  return (
    // Important! Always set the container height explicitly
    <div style={{ height: '100vh', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.GOOGLE_MAPS_API_KEY }}
        defaultCenter={{ lat: 59.95, lng: 30.33 }}
        defaultZoom={11}
      >
        <MapMarker latitude={59.955413} longitude={30.337844} />
      </GoogleMapReact>
    </div>
  );
};
