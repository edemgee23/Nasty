import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
  apiKey: "YOUR_GOOGLE_MAPS_API_KEY", // User needs to provide this
  version: "weekly",
  libraries: ["places"]
});

export async function initMap(element: HTMLElement, center: { lat: number, lng: number }) {
  try {
    const { Map } = await (loader as any).importLibrary("maps") as google.maps.MapsLibrary;
    const map = new Map(element, {
      center,
      zoom: 15,
      styles: [
        {
          "featureType": "all",
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#7c7c7c"}]
        },
        {
          "featureType": "all",
          "elementType": "labels.text.stroke",
          "stylers": [{"visibility": "on"}, {"color": "#ffffff"}, {"lightness": 16}]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [{"color": "#e9e9e9"}, {"lightness": 17}]
        },
        {
          "featureType": "landscape",
          "elementType": "geometry",
          "stylers": [{"color": "#f5f5f5"}, {"lightness": 20}]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry.fill",
          "stylers": [{"color": "#ffffff"}, {"lightness": 17}]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry.stroke",
          "stylers": [{"color": "#ffffff"}, {"lightness": 29}, {"weight": 0.2}]
        },
        {
          "featureType": "road.arterial",
          "elementType": "geometry",
          "stylers": [{"color": "#ffffff"}, {"lightness": 18}]
        },
        {
          "featureType": "road.local",
          "elementType": "geometry",
          "stylers": [{"color": "#ffffff"}, {"lightness": 16}]
        },
        {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [{"color": "#f5f5f5"}, {"lightness": 21}]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry",
          "stylers": [{"color": "#dedede"}, {"lightness": 21}]
        }
      ]
    });
    return map;
  } catch (error) {
    console.error("Error loading Google Maps", error);
    return null;
  }
}
