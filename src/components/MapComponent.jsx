import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const MapComponent = ({ coordinates, onCoordinatesChange }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // your API key
  });

  if (!isLoaded) return <p>Loading map...</p>;

  const center = {
    lat: coordinates.latitude || 6.5244, // default lat (e.g., Lagos)
    lng: coordinates.longitude || 3.3792, // default lng
  };

  return (
    <GoogleMap
      center={center}
      zoom={15}
      mapContainerStyle={{ width: "100%", height: "100%" }}
    >
      <Marker
        position={center}
        draggable
        onDragEnd={(e) => onCoordinatesChange(e.latLng.lat(), e.latLng.lng())}
      />
    </GoogleMap>
  );
};

export default MapComponent;
