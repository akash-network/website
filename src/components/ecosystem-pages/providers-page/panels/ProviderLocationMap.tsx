import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

interface Props {
  lat: number;
  lng: number;
}

/** Static, non-interactive — no zoom/pan/drag. Just enough to place the provider on the map; the draggable 3D globe is reserved for the network-wide explorer. */
export function ProviderLocationMap({ lat, lng }: Props) {
  return (
    <ComposableMap className="rounded-md border bg-background2" projectionConfig={{ rotate: [-lng, -lat, 0], scale: 220 }}>
      <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json">
        {({ geographies }) =>
          geographies.map((geo, index) => (
            <Geography
              key={index}
              geography={geo}
              className="fill-[#DCDCDC] dark:fill-[#404040]"
              style={{
                default: { outline: "none" },
                hover: { outline: "none" },
                pressed: { outline: "none" },
              }}
            />
          ))
        }
      </Geographies>
      <Marker coordinates={[lng, lat]}>
        <circle r={6} fill="#ff414c" stroke="currentColor" strokeWidth={1} className="text-background2" />
      </Marker>
    </ComposableMap>
  );
}
