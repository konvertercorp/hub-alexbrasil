import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'

const markerIconDefault = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function Recenter({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.setView([position.lat, position.lng], map.getZoom())
  }, [position, map])
  return null
}

export function LiveMap({ position, accuracy }) {
  return (
    <MapContainer
      center={[position.lat, position.lng]}
      zoom={16}
      scrollWheelZoom
      className="h-64 w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[position.lat, position.lng]} icon={markerIconDefault} />
      {accuracy && (
        <Circle
          center={[position.lat, position.lng]}
          radius={accuracy}
          pathOptions={{ color: '#60a5fa', fillOpacity: 0.1 }}
        />
      )}
      <Recenter position={position} />
    </MapContainer>
  )
}
