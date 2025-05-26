import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import transportService from '../services/transportService';

// Correction pour les icônes Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Création d'icônes personnalisées pour les différents types de marqueurs
const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Icônes pour les différents types de marqueurs
const busStopIcon = createCustomIcon('blue');
const busIcon = createCustomIcon('red');
const selectedStopIcon = createCustomIcon('green');

// Coordonnées du centre de La Réunion
const REUNION_CENTER = [-21.115141, 55.536384];
const ZOOM_LEVEL = 10;

// Points d'intérêt principaux de La Réunion (villes principales)
const MAIN_CITIES = [
  { name: "Saint-Denis", position: [-20.8789, 55.4481], description: "Capitale administrative" },
  { name: "Saint-Pierre", position: [-21.3393, 55.4781], description: "Capitale du Sud" },
  { name: "Saint-Paul", position: [-21.0096, 55.2707], description: "Ville côtière de l'Ouest" },
  { name: "Saint-André", position: [-20.9633, 55.6496], description: "Ville de l'Est" },
  { name: "Le Tampon", position: [-21.2791, 55.5176], description: "Ville des Hauts" },
  { name: "Saint-Louis", position: [-21.2882, 55.4112], description: "Ville du Sud" },
  { name: "Saint-Joseph", position: [-21.3777, 55.6119], description: "Ville du Sud Sauvage" },
  { name: "Saint-Benoît", position: [-21.0340, 55.7130], description: "Ville de l'Est" },
];

// Composant pour centrer la carte sur un point spécifique
const CenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 13);
    }
  }, [map, position]);
  return null;
};

const TransportMap = ({ darkMode }) => {
  const [transportQuery, setTransportQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gtfsDataLoaded, setGtfsDataLoaded] = useState(false);
  const [busStops, setBusStops] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [centerPosition, setCenterPosition] = useState(null);
  const textareaRef = useRef(null);
  
  // Fonction pour ajuster automatiquement la hauteur du textarea
  const autoResizeTextarea = (element) => {
    if (!element) return;
    
    // Réinitialiser la hauteur pour obtenir la hauteur correcte
    element.style.height = 'auto';
    
    // Calculer la nouvelle hauteur en fonction du contenu
    const newHeight = Math.min(Math.max(element.scrollHeight, 48), 200);
    element.style.height = `${newHeight}px`;
  };
  
  // Charger les données GTFS au chargement du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Charger les données GTFS statiques
        const gtfsData = await transportService.loadGtfsData();
        setGtfsDataLoaded(true);
        
        // Extraire les arrêts de bus
        setBusStops(gtfsData.stops);
        
        // Charger les données temps réel
        await updateRealtimeData();
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données GTFS:', err);
        setError('Impossible de charger les données de transport. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };
    
    loadData();
    
    // Mettre à jour les données temps réel toutes les 30 secondes
    const intervalId = setInterval(updateRealtimeData, 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Mettre à jour les données temps réel
  const updateRealtimeData = async () => {
    try {
      const realtimeData = await transportService.loadRealtimeData();
      setVehicles(transportService.getVehiclePositions());
    } catch (err) {
      console.error('Erreur lors de la mise à jour des données temps réel:', err);
    }
  };
  
  // Fonction pour envoyer une question sur les transports
  const handleSendTransportQuery = async () => {
    if (!transportQuery.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Analyser la question et obtenir les informations pertinentes
      const result = await transportService.analyzeTransportQuery(transportQuery);
      console.log('Résultat de la requête:', result); // Debug
      setQueryResult(result);
      
      // Centrer la carte en fonction du résultat
      if (result.type === 'departures' && result.stop) {
        setCenterPosition([result.stop.stop_lat, result.stop.stop_lon]);
      } else if (result.type === 'route' && result.fromStop) {
        setCenterPosition([result.fromStop.stop_lat, result.fromStop.stop_lon]);
        // Stocker l'itinéraire sélectionné pour l'afficher sur la carte
        if (result.routes && result.routes.length > 0) {
          setSelectedRoute(result.routes[0]);
        }
      } else if (result.type === 'line' && result.route) {
        // Si des véhicules sont disponibles pour cette ligne, centrer sur le premier
        if (result.vehicles && result.vehicles.length > 0) {
          setCenterPosition([result.vehicles[0].position.lat, result.vehicles[0].position.lng]);
        }
      } else if (result.type === 'vehicles' && result.vehicles && result.vehicles.length > 0) {
        setCenterPosition([result.vehicles[0].position.lat, result.vehicles[0].position.lng]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors de l\'analyse de la question:', err);
      setError('Impossible de traiter votre question. Veuillez réessayer.');
      setLoading(false);
    }
    
    // Réinitialiser le champ de saisie
    setTransportQuery('');
    
    // Réinitialiser la hauteur du textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }
  };
  
  useEffect(() => {
    // Effet pour s'assurer que la carte est correctement rendue
    const map = document.querySelector('.leaflet-container');
    if (map) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 300);
    }
  }, []);
  
  // Formater les résultats pour l'affichage
  const formatQueryResult = () => {
    if (!queryResult) return null;
    
    switch (queryResult.type) {
      case 'departures':
        return (
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} shadow-lg`}>
            <h3 className="font-bold text-lg mb-2">Prochains départs depuis {queryResult.stop.stop_name}</h3>
            {queryResult.departures.length > 0 ? (
              <ul className="space-y-2">
                {queryResult.departures.map((departure, index) => (
                  <li key={index} className="border-b pb-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">{departure.routeName} - {departure.headsign}</span>
                      <span className={departure.delay > 0 ? 'text-red-500' : 'text-green-500'}>
                        {departure.estimatedDeparture} {departure.delay > 0 ? `(+${Math.floor(departure.delay / 60)} min)` : ''}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucun départ prévu prochainement.</p>
            )}
          </div>
        );
      
      case 'route':
        return (
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} shadow-lg max-h-[70vh] overflow-y-auto`}>
            <h3 className="font-bold text-lg mb-2">Itinéraire de {queryResult.fromStop.stop_name} à {queryResult.toStop.stop_name}</h3>
            {queryResult.routes.length > 0 ? (
              <div>
                {queryResult.hasAlternatives && (
                  <div className={`mb-4 p-2 rounded-lg ${darkMode ? 'bg-purple-900 text-purple-100' : 'bg-purple-100 text-purple-800'}`}>
                    <p className="text-sm font-medium">Plusieurs options disponibles pour cet itinéraire !</p>
                  </div>
                )}
                
                {/* Regrouper les itinéraires par ligne */}
                {queryResult.routesByLine && Object.keys(queryResult.routesByLine || {}).map((routeId, lineIndex) => {
                  // Vérifier que la ligne existe et contient au moins un itinéraire
                  if (!queryResult.routesByLine[routeId] || !queryResult.routesByLine[routeId][0]) {
                    return null;
                  }
                  
                  const firstRoute = queryResult.routesByLine[routeId][0];
                  
                  return (
                    <div key={`line-${lineIndex}`} className="mb-4">
                      <h4 className="font-semibold border-b pb-1 mb-2">
                        Ligne {firstRoute.routeName || routeId} {firstRoute.routeLongName ? `- ${firstRoute.routeLongName}` : ''}
                      </h4>
                      
                      <ul className="space-y-2">
                        {queryResult.routesByLine[routeId].map((route, routeIndex) => {
                          if (!route) return null;
                          
                          return (
                            <li 
                              key={`route-${routeIndex}`} 
                              className={`p-2 rounded-lg cursor-pointer transition-colors duration-200 ${selectedRoute && selectedRoute.tripId === route.tripId ? 
                                (darkMode ? 'bg-purple-800' : 'bg-purple-200') : 
                                (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')}`}
                              onClick={() => setSelectedRoute(route)}
                            >
                              <div className="flex justify-between mb-1">
                                <span className="font-semibold">
                                  {route.type === 'alternative' && (
                                    <span className="inline-block px-2 py-0.5 mr-2 text-xs rounded-full bg-green-500 text-white">Option</span>
                                  )}
                                  {route.headsign || 'Trajet'}
                                </span>
                                <span>{route.duration || '--'}</span>
                              </div>
                              
                              <div className="flex justify-between text-sm">
                                <span>Départ: {route.departureStop?.estimatedTime || '--'}</span>
                                <span>Arrivée: {route.arrivalStop?.estimatedTime || '--'}</span>
                              </div>
                              
                              {route.type === 'alternative' && route.via && (
                                <div className="mt-1 text-xs italic">
                                  Via {route.via}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>Aucun itinéraire trouvé.</p>
            )}
          </div>
        );
      
      case 'line':
        return (
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} shadow-lg`}>
            <h3 className="font-bold text-lg mb-2">Ligne {queryResult.route.route_short_name} - {queryResult.route.route_long_name}</h3>
            {queryResult.alerts && queryResult.alerts.length > 0 && (
              <div className="mb-3 p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-200">Alertes</h4>
                <ul>
                  {queryResult.alerts.map((alert, index) => (
                    <li key={index} className="text-sm">{alert.header}</li>
                  ))}
                </ul>
              </div>
            )}
            <p>Véhicules en circulation: {queryResult.vehicles.length}</p>
          </div>
        );
      
      case 'alerts':
        return (
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} shadow-lg`}>
            <h3 className="font-bold text-lg mb-2">Alertes en cours</h3>
            {queryResult.alerts.length > 0 ? (
              <ul className="space-y-2">
                {queryResult.alerts.map((alert, index) => (
                  <li key={index} className="border-b pb-2">
                    <div className="font-semibold">{alert.header}</div>
                    <div className="text-sm">{alert.description}</div>
                    <div className="text-xs mt-1">
                      Lignes concernées: {alert.routes.map(r => r.routeName).join(', ')}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucune alerte en cours.</p>
            )}
          </div>
        );
      
      case 'vehicles':
        return (
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} shadow-lg`}>
            <h3 className="font-bold text-lg mb-2">Véhicules en circulation</h3>
            <p>{queryResult.vehicles.length} véhicules actuellement en service</p>
            <p className="text-sm">Les positions des véhicules sont affichées sur la carte (marqueurs rouges).</p>
          </div>
        );
      
      case 'unknown':
      default:
        return (
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} shadow-lg`}>
            <p>{queryResult.message || "Je n'ai pas pu trouver d'informations correspondant à votre demande."}</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="p-4 border-b mb-2">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          Transport à La Réunion
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Consultez les informations de transport en commun et posez vos questions à Ti'Bot.
        </p>
      </div>
      
      <div className="flex-1 relative">
        {/* Affichage des résultats de la requête */}
        {queryResult && (
          <div className="absolute top-4 right-4 z-10 max-w-md w-full">
            {formatQueryResult()}
          </div>
        )}
        
        {/* Indicateur de chargement */}
        {loading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
              <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>Chargement...</span>
            </div>
          </div>
        )}
        
        {/* Message d'erreur */}
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-2 rounded-lg shadow-lg">
              {error}
            </div>
          </div>
        )}
        
        <MapContainer 
          center={REUNION_CENTER} 
          zoom={ZOOM_LEVEL} 
          style={{ height: 'calc(100% - 80px)', width: '100%', borderRadius: '0.5rem' }}
          className="z-0"
        >
          {/* Composant pour centrer la carte */}
          {centerPosition && <CenterMap position={centerPosition} />}
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Affichage des villes principales */}
          {MAIN_CITIES.map((city, index) => (
            <Marker key={`city-${index}`} position={city.position}>
              <Popup>
                <div>
                  <h3 className="font-bold text-lg">{city.name}</h3>
                  <p className="text-sm">{city.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Affichage des arrêts de bus */}
          {gtfsDataLoaded && busStops.map((stop) => (
            <Marker 
              key={`stop-${stop.stop_id}`} 
              position={[stop.stop_lat, stop.stop_lon]} 
              icon={busStopIcon}
            >
              <Popup>
                <div>
                  <h3 className="font-bold text-lg">{stop.stop_name}</h3>
                  <p className="text-sm">Arrêt Car Jaune</p>
                  <button 
                    className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    onClick={() => {
                      setTransportQuery(`Horaires de ${stop.stop_name}`);
                      handleSendTransportQuery();
                    }}
                  >
                    Voir les horaires
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Affichage des véhicules en temps réel */}
          {vehicles.map((vehicle) => (
            <Marker 
              key={`vehicle-${vehicle.vehicleId}`} 
              position={[vehicle.position.lat, vehicle.position.lng]} 
              icon={busIcon}
            >
              <Popup>
                <div>
                  <h3 className="font-bold text-lg">Bus {vehicle.vehicleId}</h3>
                  <p className="text-sm">Ligne {vehicle.routeName} - Direction {vehicle.headsign}</p>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Affichage de l'itinéraire sélectionné */}
          {selectedRoute && queryResult && queryResult.type === 'route' && selectedRoute.shape && (
            <>
              {/* Ligne suivant les routes réelles */}
              <Polyline 
                positions={selectedRoute.shape}
                color="#8B5CF6" // Violet
                weight={4}
                opacity={0.7}
              />
              
              {/* Points intermédiaires le long de l'itinéraire */}
              {selectedRoute.shape.length > 2 && selectedRoute.shape.slice(1, -1).map((point, index) => (
                <Circle 
                  key={`waypoint-${index}`}
                  center={point}
                  radius={100}
                  pathOptions={{ fillColor: '#8B5CF6', fillOpacity: 0.5, color: '#8B5CF6', weight: 1 }}
                />
              ))}
              
              {/* Marqueurs pour les arrêts de départ et d'arrivée */}
              <Marker 
                position={[queryResult.fromStop.stop_lat, queryResult.fromStop.stop_lon]}
                icon={selectedStopIcon}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold text-lg">{queryResult.fromStop.stop_name}</h3>
                    <p className="text-sm">Départ: {selectedRoute.departureStop.estimatedTime}</p>
                  </div>
                </Popup>
              </Marker>
              
              <Marker 
                position={[queryResult.toStop.stop_lat, queryResult.toStop.stop_lon]}
                icon={selectedStopIcon}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold text-lg">{queryResult.toStop.stop_name}</h3>
                    <p className="text-sm">Arrivée: {selectedRoute.arrivalStop.estimatedTime}</p>
                  </div>
                </Popup>
              </Marker>
            </>
          )}
        </MapContainer>
        
        {/* Zone de saisie pour les questions sur les transports */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-3 max-w-3xl mx-auto`}>
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={transportQuery}
                  onChange={(e) => {
                    setTransportQuery(e.target.value);
                    autoResizeTextarea(e.target);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendTransportQuery();
                    } else {
                      // Délai court pour permettre à la valeur de se mettre à jour avant le redimensionnement
                      setTimeout(() => autoResizeTextarea(e.target), 0);
                    }
                  }}
                  placeholder="Posez une question sur les transports à La Réunion..."
                  rows="1"
                  style={{
                    resize: 'none',
                    minHeight: '48px',
                    maxHeight: '200px',
                    overflow: 'auto',
                    height: '48px' // Hauteur initiale
                  }}
                  className={`w-full px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    darkMode 
                      ? 'bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              <button
                onClick={handleSendTransportQuery}
                className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
            
            {/* Exemples de questions */}
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Exemples : </span>
              {[
                "Horaires de Saint-Denis",
                "Comment aller de Saint-Denis à Saint-Pierre ?",
                "Informations ligne T",
                "Alertes en cours",
                "Position des bus"
              ].map((example, index) => (
                <button
                  key={index}
                  className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                  onClick={() => {
                    setTransportQuery(example);
                    if (textareaRef.current) {
                      autoResizeTextarea(textareaRef.current);
                    }
                  }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportMap;
