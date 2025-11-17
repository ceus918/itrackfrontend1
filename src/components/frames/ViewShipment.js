import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import "../css/ServiceRequest.css";

import truckIconImg from "../icons/truck1.png";

const defaultCenter = {
  lat: 14.3336,  // Latitude for Biñan, Laguna
  lng: 121.0830, // Longitude for Biñan, Laguna
};
const isValidLatLng = (lat, lng) =>
  typeof lat === "number" &&
  typeof lng === "number" &&
  !isNaN(lat) &&
  !isNaN(lng);

const ViewShipment = ({ isOpen, onClose, data }) => {
  const [currentLocation, setCurrentLocation] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,

  });

  useEffect(() => {
    if (!isOpen || !data?._id) return;

    const fetchCurrentLocation = async () => {
      try {
        const res = await axios.get(
          `https://itrack-web-backend.onrender.com/api/getAllocation/${data._id}`,
          { withCredentials: true }
        );

        const loc = res.data?.currentLocation;

        if (loc?.latitude && loc?.longitude) {
          const lat = Number(loc.latitude);
          const lng = Number(loc.longitude);

          if (!isNaN(lat) && !isNaN(lng)) {
            setCurrentLocation({ lat, lng });
          }
        }
      } catch (err) {
        console.error("Error fetching live location:", err);
      }
    };

    fetchCurrentLocation();
    const interval = setInterval(fetchCurrentLocation, 5000);
    return () => clearInterval(interval);
  }, [isOpen, data?._id]);

  const mapCenter =
    currentLocation && isValidLatLng(currentLocation.lat, currentLocation.lng)
      ? currentLocation
      : data?.currentLocation &&
        isValidLatLng(
          data.currentLocation.latitude,
          data.currentLocation.longitude
        )
      ? {
          lat: data.currentLocation.latitude,
          lng: data.currentLocation.longitude,
        }
      : defaultCenter;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="viewshipment-header">
          <p className="modaltitle">View Shipment</p>
          <button className="viewshipment-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modalline"></div>

        <div className="modal-content viewshipment-flex">
          {data ? (
            <>
              {/* Left: Shipment details */}
              <div className="viewshipment-info">
                <p><strong>Date: </strong>{new Date(data.date).toLocaleDateString("en-CA")}</p>
                <p><strong>Unit Name: </strong>{data.unitName}</p>
                <p><strong>Driver: </strong>{data.assignedDriver}</p>
                <p><strong>Status: </strong>{data.status}</p>
              </div>

              {/* Right: Google Map */}
              <div className="viewshipment-map">
                {isLoaded ? (
  <GoogleMap
    center={mapCenter}
    zoom={14}
    mapContainerStyle={{
      height: "450px",
      width: "900px",
      borderRadius: "10px",
    }}
  >
    <Marker
      position={mapCenter}
      icon={{
        url: truckIconImg,
        scaledSize: new window.google.maps.Size(65, 65),
      }}
    />
  </GoogleMap>
) : (
  <p>Loading Map...</p>
)}

              </div>
            </>
          ) : (
            <p>No data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewShipment;
