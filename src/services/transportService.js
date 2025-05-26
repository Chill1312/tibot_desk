// Import des bibliothèques nécessaires
// Note: Nous n'utilisons pas axios et GtfsRealtimeBindings pour le moment car nous simulons les données
// import axios from 'axios';
// import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

// URLs des données GTFS et GTFS-RT de Car Jaune (pour référence future)
// const GTFS_STATIC_URL = 'https://opendata.regionreunion.com/api/explore/v2.1/catalog/datasets/car-jaune-gtfs/exports/gtfs';
// const GTFS_REALTIME_URL = 'https://opendata.regionreunion.com/api/explore/v2.1/catalog/datasets/car-jaune-gtfs-rt/exports/gtfs-rt';

// Structure pour stocker les données GTFS
let gtfsData = {
  routes: [],
  stops: [],
  trips: [],
  stopTimes: [],
  calendar: [],
  shapes: [], // Points intermédiaires pour les itinéraires
  loaded: false
};

// Structure pour stocker les données temps réel
let realtimeData = {
  vehiclePositions: [],
  tripUpdates: [],
  alerts: [],
  lastUpdated: null
};

/**
 * Charge les données GTFS statiques (simulées pour le moment)
 */
export const loadGtfsData = async () => {
  try {
    console.log('Chargement des données GTFS statiques...');
    
    // Dans une implémentation réelle, nous ferions une requête HTTP pour récupérer les données GTFS
    // et nous utiliserions la bibliothèque gtfs pour parser le contenu
    // Mais pour simplifier et éviter les erreurs, nous simulons directement les données
    
    // Simulation de chargement des données
    gtfsData = {
      routes: [
        { route_id: 'T', route_short_name: 'T', route_long_name: 'Saint-Denis - Saint-Pierre (Express)', route_color: 'FF0000' },
        { route_id: 'O', route_short_name: 'O', route_long_name: 'Saint-Denis - Saint-Benoît', route_color: 'FFA500' },
        { route_id: 'E', route_short_name: 'E', route_long_name: 'Saint-Denis - Saint-André', route_color: '00FF00' },
        { route_id: 'S', route_short_name: 'S', route_long_name: 'Saint-Pierre - Saint-Joseph', route_color: '0000FF' },
        { route_id: 'S4', route_short_name: 'S4', route_long_name: 'Saint-Denis - Saint-Pierre (via Le Tampon)', route_color: '800080' },
        { route_id: 'O2', route_short_name: 'O2', route_long_name: 'Saint-Denis - Saint-Pierre (via Saint-Benoît)', route_color: '008080' },
      ],
      stops: [
        { stop_id: 'STDENIS', stop_name: 'Gare de Saint-Denis', stop_lat: -20.8789, stop_lon: 55.4481 },
        { stop_id: 'STPIERRE', stop_name: 'Gare de Saint-Pierre', stop_lat: -21.3393, stop_lon: 55.4781 },
        { stop_id: 'STPAUL', stop_name: 'Gare de Saint-Paul', stop_lat: -21.0096, stop_lon: 55.2707 },
        { stop_id: 'STANDRE', stop_name: 'Gare de Saint-André', stop_lat: -20.9633, stop_lon: 55.6496 },
        { stop_id: 'STBENOIT', stop_name: 'Gare de Saint-Benoît', stop_lat: -21.0340, stop_lon: 55.7130 },
        { stop_id: 'STJOSEPH', stop_name: 'Gare de Saint-Joseph', stop_lat: -21.3777, stop_lon: 55.6119 },
        { stop_id: 'TAMPON', stop_name: 'Le Tampon', stop_lat: -21.2791, stop_lon: 55.5176 },
        { stop_id: 'STLOUIS', stop_name: 'Saint-Louis', stop_lat: -21.2882, stop_lon: 55.4112 },
      ],
      // Points intermédiaires pour les itinéraires (formes des routes)
      shapes: {
        // Itinéraire Saint-Denis -> Saint-Pierre (ligne T - Express)
        'T-STDENIS-STPIERRE': [
          [-20.8789, 55.4481], // Saint-Denis
          [-20.9442, 55.3147], // Point intermédiaire (route côtière)
          [-21.0096, 55.2707], // Saint-Paul
          [-21.1542, 55.2683], // Point intermédiaire (route côtière)
          [-21.2138, 55.3444], // Point intermédiaire (vers les terres)
          [-21.2882, 55.4112], // Saint-Louis
          [-21.3393, 55.4781]  // Saint-Pierre
        ],
        // Itinéraire Saint-Pierre -> Saint-Denis (ligne T - Express)
        'T-STPIERRE-STDENIS': [
          [-21.3393, 55.4781], // Saint-Pierre
          [-21.2882, 55.4112], // Saint-Louis
          [-21.2138, 55.3444], // Point intermédiaire (vers les terres)
          [-21.1542, 55.2683], // Point intermédiaire (route côtière)
          [-21.0096, 55.2707], // Saint-Paul
          [-20.9442, 55.3147], // Point intermédiaire (route côtière)
          [-20.8789, 55.4481]  // Saint-Denis
        ],
        // Itinéraire Saint-Denis -> Saint-Pierre (ligne S4 - via Tampon)
        'S4-STDENIS-STPIERRE': [
          [-20.8789, 55.4481], // Saint-Denis
          [-20.9442, 55.3147], // Point intermédiaire (route côtière)
          [-21.0096, 55.2707], // Saint-Paul
          [-21.1542, 55.2683], // Point intermédiaire (route côtière)
          [-21.2138, 55.3444], // Point intermédiaire (vers les terres)
          [-21.2791, 55.5176], // Le Tampon
          [-21.3393, 55.4781]  // Saint-Pierre
        ],
        // Itinéraire Saint-Pierre -> Saint-Denis (ligne S4 - via Tampon)
        'S4-STPIERRE-STDENIS': [
          [-21.3393, 55.4781], // Saint-Pierre
          [-21.2791, 55.5176], // Le Tampon
          [-21.2138, 55.3444], // Point intermédiaire (vers les terres)
          [-21.1542, 55.2683], // Point intermédiaire (route côtière)
          [-21.0096, 55.2707], // Saint-Paul
          [-20.9442, 55.3147], // Point intermédiaire (route côtière)
          [-20.8789, 55.4481]  // Saint-Denis
        ],
        // Itinéraire Saint-Denis -> Saint-Pierre (ligne O2 - via Saint-Benoît)
        'O2-STDENIS-STPIERRE': [
          [-20.8789, 55.4481], // Saint-Denis
          [-20.9211, 55.5489], // Point intermédiaire (route de l'est)
          [-20.9633, 55.6496], // Saint-André
          [-21.0340, 55.7130], // Saint-Benoît
          [-21.2791, 55.5176], // Le Tampon
          [-21.3393, 55.4781]  // Saint-Pierre
        ],
        // Itinéraire Saint-Pierre -> Saint-Denis (ligne O2 - via Saint-Benoît)
        'O2-STPIERRE-STDENIS': [
          [-21.3393, 55.4781], // Saint-Pierre
          [-21.2791, 55.5176], // Le Tampon
          [-21.0340, 55.7130], // Saint-Benoît
          [-20.9633, 55.6496], // Saint-André
          [-20.9211, 55.5489], // Point intermédiaire (route de l'est)
          [-20.8789, 55.4481]  // Saint-Denis
        ],
        // Itinéraire Saint-Denis -> Saint-Benoît (ligne O)
        'O-STDENIS-STBENOIT': [
          [-20.8789, 55.4481], // Saint-Denis
          [-20.9211, 55.5489], // Point intermédiaire (route de l'est)
          [-20.9633, 55.6496], // Saint-André
          [-21.0340, 55.7130]  // Saint-Benoît
        ],
        // Itinéraire Saint-Denis -> Saint-André (ligne E)
        'E-STDENIS-STANDRE': [
          [-20.8789, 55.4481], // Saint-Denis
          [-20.9211, 55.5489], // Point intermédiaire (route de l'est)
          [-20.9633, 55.6496]  // Saint-André
        ],
        // Itinéraire Saint-Pierre -> Saint-Joseph (ligne S)
        'S-STPIERRE-STJOSEPH': [
          [-21.3393, 55.4781], // Saint-Pierre
          [-21.3777, 55.6119]  // Saint-Joseph
        ]
      },
      trips: [
        { trip_id: 'T-AM-1', route_id: 'T', service_id: 'WEEKDAY', trip_headsign: 'Saint-Pierre', departure_time: '07:00:00', arrival_time: '09:00:00' },
        { trip_id: 'T-PM-1', route_id: 'T', service_id: 'WEEKDAY', trip_headsign: 'Saint-Pierre', departure_time: '13:00:00', arrival_time: '15:00:00' },
        { trip_id: 'T-AM-2', route_id: 'T', service_id: 'WEEKDAY', trip_headsign: 'Saint-Denis', departure_time: '07:00:00', arrival_time: '09:00:00' },
        { trip_id: 'O-AM-1', route_id: 'O', service_id: 'WEEKDAY', trip_headsign: 'Saint-Benoît', departure_time: '07:30:00', arrival_time: '09:00:00' },
        { trip_id: 'E-AM-1', route_id: 'E', service_id: 'WEEKDAY', trip_headsign: 'Saint-André', departure_time: '08:00:00', arrival_time: '08:45:00' },
        
        // Nouveaux trajets pour les lignes S4 et O2
        { trip_id: 'S4-AM-1', route_id: 'S4', service_id: 'WEEKDAY', trip_headsign: 'Saint-Pierre (via Tampon)', departure_time: '06:30:00', arrival_time: '09:15:00' },
        { trip_id: 'S4-PM-1', route_id: 'S4', service_id: 'WEEKDAY', trip_headsign: 'Saint-Pierre (via Tampon)', departure_time: '12:30:00', arrival_time: '15:15:00' },
        { trip_id: 'S4-AM-2', route_id: 'S4', service_id: 'WEEKDAY', trip_headsign: 'Saint-Denis (via Tampon)', departure_time: '06:30:00', arrival_time: '09:15:00' },
        
        { trip_id: 'O2-AM-1', route_id: 'O2', service_id: 'WEEKDAY', trip_headsign: 'Saint-Pierre (via Saint-Benoît)', departure_time: '06:00:00', arrival_time: '09:30:00' },
        { trip_id: 'O2-PM-1', route_id: 'O2', service_id: 'WEEKDAY', trip_headsign: 'Saint-Pierre (via Saint-Benoît)', departure_time: '12:00:00', arrival_time: '15:30:00' },
        { trip_id: 'O2-AM-2', route_id: 'O2', service_id: 'WEEKDAY', trip_headsign: 'Saint-Denis (via Saint-Benoît)', departure_time: '06:00:00', arrival_time: '09:30:00' },
      ],
      stopTimes: [
        // Ligne T direction Saint-Pierre (matin)
        { trip_id: 'T-AM-1', stop_id: 'STDENIS', arrival_time: '07:00:00', departure_time: '07:00:00', stop_sequence: 1 },
        { trip_id: 'T-AM-1', stop_id: 'STPAUL', arrival_time: '07:45:00', departure_time: '07:50:00', stop_sequence: 2 },
        { trip_id: 'T-AM-1', stop_id: 'STLOUIS', arrival_time: '08:30:00', departure_time: '08:35:00', stop_sequence: 3 },
        { trip_id: 'T-AM-1', stop_id: 'STPIERRE', arrival_time: '09:00:00', departure_time: '09:00:00', stop_sequence: 4 },
        
        // Ligne T direction Saint-Pierre (après-midi)
        { trip_id: 'T-PM-1', stop_id: 'STDENIS', arrival_time: '13:00:00', departure_time: '13:00:00', stop_sequence: 1 },
        { trip_id: 'T-PM-1', stop_id: 'STPAUL', arrival_time: '13:45:00', departure_time: '13:50:00', stop_sequence: 2 },
        { trip_id: 'T-PM-1', stop_id: 'STLOUIS', arrival_time: '14:30:00', departure_time: '14:35:00', stop_sequence: 3 },
        { trip_id: 'T-PM-1', stop_id: 'STPIERRE', arrival_time: '15:00:00', departure_time: '15:00:00', stop_sequence: 4 },
        
        // Ligne T direction Saint-Denis
        { trip_id: 'T-AM-2', stop_id: 'STPIERRE', arrival_time: '07:00:00', departure_time: '07:00:00', stop_sequence: 1 },
        { trip_id: 'T-AM-2', stop_id: 'STLOUIS', arrival_time: '07:25:00', departure_time: '07:30:00', stop_sequence: 2 },
        { trip_id: 'T-AM-2', stop_id: 'STPAUL', arrival_time: '08:15:00', departure_time: '08:20:00', stop_sequence: 3 },
        { trip_id: 'T-AM-2', stop_id: 'STDENIS', arrival_time: '09:00:00', departure_time: '09:00:00', stop_sequence: 4 },
        
        // Ligne O direction Saint-Benoît
        { trip_id: 'O-AM-1', stop_id: 'STDENIS', arrival_time: '07:30:00', departure_time: '07:30:00', stop_sequence: 1 },
        { trip_id: 'O-AM-1', stop_id: 'STANDRE', arrival_time: '08:15:00', departure_time: '08:20:00', stop_sequence: 2 },
        { trip_id: 'O-AM-1', stop_id: 'STBENOIT', arrival_time: '09:00:00', departure_time: '09:00:00', stop_sequence: 3 },
        
        // Ligne E direction Saint-André
        { trip_id: 'E-AM-1', stop_id: 'STDENIS', arrival_time: '08:00:00', departure_time: '08:00:00', stop_sequence: 1 },
        { trip_id: 'E-AM-1', stop_id: 'STANDRE', arrival_time: '08:45:00', departure_time: '08:45:00', stop_sequence: 2 },
        
        // Ligne S4 direction Saint-Pierre via Tampon (matin)
        { trip_id: 'S4-AM-1', stop_id: 'STDENIS', arrival_time: '06:30:00', departure_time: '06:30:00', stop_sequence: 1 },
        { trip_id: 'S4-AM-1', stop_id: 'STPAUL', arrival_time: '07:15:00', departure_time: '07:20:00', stop_sequence: 2 },
        { trip_id: 'S4-AM-1', stop_id: 'TAMPON', arrival_time: '08:30:00', departure_time: '08:40:00', stop_sequence: 3 },
        { trip_id: 'S4-AM-1', stop_id: 'STPIERRE', arrival_time: '09:15:00', departure_time: '09:15:00', stop_sequence: 4 },
        
        // Ligne S4 direction Saint-Pierre via Tampon (après-midi)
        { trip_id: 'S4-PM-1', stop_id: 'STDENIS', arrival_time: '12:30:00', departure_time: '12:30:00', stop_sequence: 1 },
        { trip_id: 'S4-PM-1', stop_id: 'STPAUL', arrival_time: '13:15:00', departure_time: '13:20:00', stop_sequence: 2 },
        { trip_id: 'S4-PM-1', stop_id: 'TAMPON', arrival_time: '14:30:00', departure_time: '14:40:00', stop_sequence: 3 },
        { trip_id: 'S4-PM-1', stop_id: 'STPIERRE', arrival_time: '15:15:00', departure_time: '15:15:00', stop_sequence: 4 },
        
        // Ligne S4 direction Saint-Denis via Tampon
        { trip_id: 'S4-AM-2', stop_id: 'STPIERRE', arrival_time: '06:30:00', departure_time: '06:30:00', stop_sequence: 1 },
        { trip_id: 'S4-AM-2', stop_id: 'TAMPON', arrival_time: '07:00:00', departure_time: '07:10:00', stop_sequence: 2 },
        { trip_id: 'S4-AM-2', stop_id: 'STPAUL', arrival_time: '08:30:00', departure_time: '08:35:00', stop_sequence: 3 },
        { trip_id: 'S4-AM-2', stop_id: 'STDENIS', arrival_time: '09:15:00', departure_time: '09:15:00', stop_sequence: 4 },
        
        // Ligne O2 direction Saint-Pierre via Saint-Benoît (matin)
        { trip_id: 'O2-AM-1', stop_id: 'STDENIS', arrival_time: '06:00:00', departure_time: '06:00:00', stop_sequence: 1 },
        { trip_id: 'O2-AM-1', stop_id: 'STANDRE', arrival_time: '06:45:00', departure_time: '06:50:00', stop_sequence: 2 },
        { trip_id: 'O2-AM-1', stop_id: 'STBENOIT', arrival_time: '07:30:00', departure_time: '07:40:00', stop_sequence: 3 },
        { trip_id: 'O2-AM-1', stop_id: 'TAMPON', arrival_time: '08:45:00', departure_time: '08:55:00', stop_sequence: 4 },
        { trip_id: 'O2-AM-1', stop_id: 'STPIERRE', arrival_time: '09:30:00', departure_time: '09:30:00', stop_sequence: 5 },
        
        // Ligne O2 direction Saint-Pierre via Saint-Benoît (après-midi)
        { trip_id: 'O2-PM-1', stop_id: 'STDENIS', arrival_time: '12:00:00', departure_time: '12:00:00', stop_sequence: 1 },
        { trip_id: 'O2-PM-1', stop_id: 'STANDRE', arrival_time: '12:45:00', departure_time: '12:50:00', stop_sequence: 2 },
        { trip_id: 'O2-PM-1', stop_id: 'STBENOIT', arrival_time: '13:30:00', departure_time: '13:40:00', stop_sequence: 3 },
        { trip_id: 'O2-PM-1', stop_id: 'TAMPON', arrival_time: '14:45:00', departure_time: '14:55:00', stop_sequence: 4 },
        { trip_id: 'O2-PM-1', stop_id: 'STPIERRE', arrival_time: '15:30:00', departure_time: '15:30:00', stop_sequence: 5 },
        
        // Ligne O2 direction Saint-Denis via Saint-Benoît
        { trip_id: 'O2-AM-2', stop_id: 'STPIERRE', arrival_time: '06:00:00', departure_time: '06:00:00', stop_sequence: 1 },
        { trip_id: 'O2-AM-2', stop_id: 'TAMPON', arrival_time: '06:30:00', departure_time: '06:40:00', stop_sequence: 2 },
        { trip_id: 'O2-AM-2', stop_id: 'STBENOIT', arrival_time: '07:45:00', departure_time: '07:55:00', stop_sequence: 3 },
        { trip_id: 'O2-AM-2', stop_id: 'STANDRE', arrival_time: '08:35:00', departure_time: '08:40:00', stop_sequence: 4 },
        { trip_id: 'O2-AM-2', stop_id: 'STDENIS', arrival_time: '09:30:00', departure_time: '09:30:00', stop_sequence: 5 },
      ],
      calendar: [
        { service_id: 'WEEKDAY', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 0, sunday: 0 },
        { service_id: 'WEEKEND', monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 1, sunday: 1 },
      ],
      loaded: true
    };
    
    console.log('Données GTFS statiques chargées avec succès');
    return gtfsData;
  } catch (error) {
    console.error('Erreur lors du chargement des données GTFS statiques:', error);
    throw error;
  }
};

/**
 * Charge les données GTFS-RT (temps réel) - simulées pour le moment
 */
export const loadRealtimeData = async () => {
  try {
    console.log('Chargement des données GTFS-RT...');
    
    // Dans une implémentation réelle, nous ferions une requête HTTP pour récupérer les données GTFS-RT
    // et nous utiliserions GtfsRealtimeBindings pour parser les données
    // Mais pour simplifier et éviter les erreurs, nous simulons directement les données temps réel
    
    // Simulation de données temps réel
    realtimeData = {
      vehiclePositions: [
        { 
          vehicle: { 
            id: 'BUS001', 
            trip: { trip_id: 'T-AM-1' },
            position: { latitude: -20.9442, longitude: 55.3147, bearing: 180 }, // Entre St-Denis et St-Paul
            timestamp: Math.floor(Date.now() / 1000)
          }
        },
        { 
          vehicle: { 
            id: 'BUS002', 
            trip: { trip_id: 'T-AM-2' },
            position: { latitude: -21.2138, longitude: 55.3444, bearing: 0 }, // Entre St-Louis et St-Paul
            timestamp: Math.floor(Date.now() / 1000)
          }
        },
        { 
          vehicle: { 
            id: 'BUS003', 
            trip: { trip_id: 'O-AM-1' },
            position: { latitude: -20.9211, longitude: 55.5489, bearing: 90 }, // Entre St-Denis et St-André
            timestamp: Math.floor(Date.now() / 1000)
          }
        },
      ],
      tripUpdates: [
        {
          trip: { trip_id: 'T-AM-1' },
          stopTimeUpdate: [
            { stop_id: 'STPAUL', arrival: { delay: 300 }, departure: { delay: 300 } }, // 5 minutes de retard
            { stop_id: 'STLOUIS', arrival: { delay: 300 }, departure: { delay: 300 } },
            { stop_id: 'STPIERRE', arrival: { delay: 300 }, departure: { delay: 300 } }
          ]
        },
        {
          trip: { trip_id: 'O-AM-1' },
          stopTimeUpdate: [
            { stop_id: 'STANDRE', arrival: { delay: 600 }, departure: { delay: 600 } }, // 10 minutes de retard
            { stop_id: 'STBENOIT', arrival: { delay: 600 }, departure: { delay: 600 } }
          ]
        }
      ],
      alerts: [
        {
          id: 'ALERT001',
          effect: 'DETOUR',
          informedEntity: [{ route_id: 'T' }],
          headerText: { translation: [{ text: 'Déviation sur la ligne T' }] },
          descriptionText: { translation: [{ text: 'En raison de travaux, la ligne T effectue une déviation entre Saint-Paul et Saint-Louis.' }] }
        }
      ],
      lastUpdated: new Date()
    };
    
    console.log('Données GTFS-RT chargées avec succès');
    return realtimeData;
  } catch (error) {
    console.error('Erreur lors du chargement des données GTFS-RT:', error);
    throw error;
  }
};

/**
 * Recherche les arrêts par nom
 */
export const findStopsByName = (searchTerm) => {
  if (!gtfsData.loaded) {
    throw new Error('Les données GTFS ne sont pas chargées');
  }
  
  const normalizedSearchTerm = searchTerm.toLowerCase();
  return gtfsData.stops.filter(stop => 
    stop.stop_name.toLowerCase().includes(normalizedSearchTerm)
  );
};

/**
 * Recherche les lignes par numéro ou nom
 */
export const findRoutesByName = (searchTerm) => {
  if (!gtfsData.loaded) {
    throw new Error('Les données GTFS ne sont pas chargées');
  }
  
  const normalizedSearchTerm = searchTerm.toLowerCase();
  return gtfsData.routes.filter(route => 
    route.route_short_name.toLowerCase().includes(normalizedSearchTerm) ||
    route.route_long_name.toLowerCase().includes(normalizedSearchTerm)
  );
};

/**
 * Trouve les prochains départs depuis un arrêt
 */
export const findNextDepartures = (stopId, limit = 5) => {
  if (!gtfsData.loaded) {
    throw new Error('Les données GTFS ne sont pas chargées');
  }
  
  // Obtenir tous les arrêts pour ce stopId
  const stopTimes = gtfsData.stopTimes.filter(st => st.stop_id === stopId);
  
  // Obtenir l'heure actuelle au format HH:MM:SS
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  // Filtrer les départs qui sont après l'heure actuelle
  const upcomingDepartures = stopTimes.filter(st => st.departure_time > currentTime);
  
  // Trier par heure de départ
  upcomingDepartures.sort((a, b) => a.departure_time.localeCompare(b.departure_time));
  
  // Limiter le nombre de résultats
  const limitedDepartures = upcomingDepartures.slice(0, limit);
  
  // Enrichir avec les informations de ligne et de destination
  return limitedDepartures.map(departure => {
    const trip = gtfsData.trips.find(t => t.trip_id === departure.trip_id);
    const route = trip ? gtfsData.routes.find(r => r.route_id === trip.route_id) : null;
    
    // Vérifier s'il y a des retards en temps réel
    let delay = 0;
    if (realtimeData.tripUpdates) {
      const tripUpdate = realtimeData.tripUpdates.find(tu => tu.trip.trip_id === departure.trip_id);
      if (tripUpdate) {
        const stopUpdate = tripUpdate.stopTimeUpdate.find(stu => stu.stop_id === stopId);
        if (stopUpdate && stopUpdate.departure) {
          delay = stopUpdate.departure.delay || 0;
        }
      }
    }
    
    return {
      stopId: departure.stop_id,
      stopName: gtfsData.stops.find(s => s.stop_id === departure.stop_id)?.stop_name,
      tripId: departure.trip_id,
      routeId: route?.route_id,
      routeName: route?.route_short_name,
      routeLongName: route?.route_long_name,
      scheduledDeparture: departure.departure_time,
      estimatedDeparture: calculateTimeWithDelay(departure.departure_time, delay),
      delay: delay,
      headsign: trip?.trip_headsign
    };
  });
};

/**
 * Trouve un itinéraire entre deux arrêts
 */
export const findRoute = (fromStopId, toStopId) => {
  if (!gtfsData.loaded) {
    throw new Error('Les données GTFS ne sont pas chargées');
  }
  
  // Trouver tous les trajets qui passent par l'arrêt de départ
  const departureStopTimes = gtfsData.stopTimes.filter(st => st.stop_id === fromStopId);
  
  // Regrouper par trip_id
  const tripGroups = {};
  departureStopTimes.forEach(dst => {
    if (!tripGroups[dst.trip_id]) {
      tripGroups[dst.trip_id] = {
        departure: dst,
        arrival: null
      };
    }
  });
  
  // Pour chaque trajet, vérifier s'il passe également par l'arrêt d'arrivée
  Object.keys(tripGroups).forEach(tripId => {
    const arrivalStopTime = gtfsData.stopTimes.find(st => 
      st.trip_id === tripId && 
      st.stop_id === toStopId && 
      st.stop_sequence > tripGroups[tripId].departure.stop_sequence
    );
    
    if (arrivalStopTime) {
      tripGroups[tripId].arrival = arrivalStopTime;
    } else {
      delete tripGroups[tripId];
    }
  });
  
  // Convertir en tableau de résultats
  const directRoutes = Object.keys(tripGroups).map(tripId => {
    const { departure, arrival } = tripGroups[tripId];
    const trip = gtfsData.trips.find(t => t.trip_id === tripId);
    const route = trip ? gtfsData.routes.find(r => r.route_id === trip.route_id) : null;
    
    // Vérifier s'il y a des retards en temps réel
    let departureDelay = 0;
    let arrivalDelay = 0;
    
    if (realtimeData.tripUpdates) {
      const tripUpdate = realtimeData.tripUpdates.find(tu => tu.trip.trip_id === tripId);
      if (tripUpdate) {
        const departureUpdate = tripUpdate.stopTimeUpdate.find(stu => stu.stop_id === fromStopId);
        if (departureUpdate && departureUpdate.departure) {
          departureDelay = departureUpdate.departure.delay || 0;
        }
        
        const arrivalUpdate = tripUpdate.stopTimeUpdate.find(stu => stu.stop_id === toStopId);
        if (arrivalUpdate && arrivalUpdate.arrival) {
          arrivalDelay = arrivalUpdate.arrival.delay || 0;
        }
      }
    }
    
    // Déterminer la clé pour les points intermédiaires de l'itinéraire
    let shapeKey = null;
    if (route) {
      // Construire la clé pour accéder aux points intermédiaires
      // Format: 'route_id-fromStopId-toStopId'
      shapeKey = `${route.route_id}-${fromStopId}-${toStopId}`;
      
      // Si cette clé n'existe pas, essayer l'inverse (pour les lignes bidirectionnelles)
      if (!gtfsData.shapes[shapeKey]) {
        // Essayer avec les arrêts inversés
        const reverseKey = `${route.route_id}-${toStopId}-${fromStopId}`;
        if (gtfsData.shapes[reverseKey]) {
          // Utiliser l'itinéraire inversé et inverser l'ordre des points
          const reverseShape = [...gtfsData.shapes[reverseKey]];
          gtfsData.shapes[shapeKey] = reverseShape.reverse();
        } else {
          // Essayer avec une clé simplifiée (juste la ligne)
          const simpleKey = Object.keys(gtfsData.shapes).find(k => k.startsWith(`${route.route_id}-`));
          if (simpleKey) {
            shapeKey = simpleKey;
          }
        }
      }
    }
    
    // Récupérer les points intermédiaires de l'itinéraire
    const routeShape = shapeKey && gtfsData.shapes[shapeKey] ? gtfsData.shapes[shapeKey] : [
      // Si aucun itinéraire détaillé n'est disponible, utiliser juste les points de départ et d'arrivée
      [gtfsData.stops.find(s => s.stop_id === fromStopId)?.stop_lat, gtfsData.stops.find(s => s.stop_id === fromStopId)?.stop_lon],
      [gtfsData.stops.find(s => s.stop_id === toStopId)?.stop_lat, gtfsData.stops.find(s => s.stop_id === toStopId)?.stop_lon]
    ];
    
    return {
      tripId,
      routeId: route?.route_id,
      routeName: route?.route_short_name,
      routeLongName: route?.route_long_name,
      headsign: trip?.trip_headsign,
      departureStop: {
        stopId: fromStopId,
        stopName: gtfsData.stops.find(s => s.stop_id === fromStopId)?.stop_name,
        scheduledTime: departure.departure_time,
        estimatedTime: calculateTimeWithDelay(departure.departure_time, departureDelay),
        delay: departureDelay
      },
      arrivalStop: {
        stopId: toStopId,
        stopName: gtfsData.stops.find(s => s.stop_id === toStopId)?.stop_name,
        scheduledTime: arrival.arrival_time,
        estimatedTime: calculateTimeWithDelay(arrival.arrival_time, arrivalDelay),
        delay: arrivalDelay
      },
      duration: calculateDuration(departure.departure_time, arrival.arrival_time),
      shape: routeShape, // Points intermédiaires pour l'itinéraire
      type: 'direct' // Indiquer qu'il s'agit d'un trajet direct
    };
  });
  
  // Rechercher des itinéraires alternatifs pour les lignes spécifiques
  const alternativeRoutes = [];
  
  // Cas spécifique : Saint-Denis -> Saint-Pierre
  if (fromStopId === 'STDENIS' && toStopId === 'STPIERRE') {
    // Ajouter les itinéraires alternatifs avec les lignes S4 et O2
    // Ligne S4 (via Le Tampon)
    const s4Trips = gtfsData.trips.filter(t => t.route_id === 'S4' && t.trip_headsign.includes('Saint-Pierre'));
    
    s4Trips.forEach(trip => {
      const departureTime = gtfsData.stopTimes.find(st => st.trip_id === trip.trip_id && st.stop_id === 'STDENIS');
      const arrivalTime = gtfsData.stopTimes.find(st => st.trip_id === trip.trip_id && st.stop_id === 'STPIERRE');
      
      if (departureTime && arrivalTime) {
        const route = gtfsData.routes.find(r => r.route_id === 'S4');
        const shapeKey = 'S4-STDENIS-STPIERRE';
        
        alternativeRoutes.push({
          tripId: trip.trip_id,
          routeId: 'S4',
          routeName: route?.route_short_name,
          routeLongName: route?.route_long_name,
          headsign: trip.trip_headsign,
          departureStop: {
            stopId: 'STDENIS',
            stopName: gtfsData.stops.find(s => s.stop_id === 'STDENIS')?.stop_name,
            scheduledTime: departureTime.departure_time,
            estimatedTime: departureTime.departure_time,
            delay: 0
          },
          arrivalStop: {
            stopId: 'STPIERRE',
            stopName: gtfsData.stops.find(s => s.stop_id === 'STPIERRE')?.stop_name,
            scheduledTime: arrivalTime.arrival_time,
            estimatedTime: arrivalTime.arrival_time,
            delay: 0
          },
          duration: calculateDuration(departureTime.departure_time, arrivalTime.arrival_time),
          shape: gtfsData.shapes[shapeKey] || [],
          type: 'alternative',
          via: 'Le Tampon'
        });
      }
    });
    
    // Ligne O2 (via Saint-Benoît)
    const o2Trips = gtfsData.trips.filter(t => t.route_id === 'O2' && t.trip_headsign.includes('Saint-Pierre'));
    
    o2Trips.forEach(trip => {
      const departureTime = gtfsData.stopTimes.find(st => st.trip_id === trip.trip_id && st.stop_id === 'STDENIS');
      const arrivalTime = gtfsData.stopTimes.find(st => st.trip_id === trip.trip_id && st.stop_id === 'STPIERRE');
      
      if (departureTime && arrivalTime) {
        const route = gtfsData.routes.find(r => r.route_id === 'O2');
        const shapeKey = 'O2-STDENIS-STPIERRE';
        
        alternativeRoutes.push({
          tripId: trip.trip_id,
          routeId: 'O2',
          routeName: route?.route_short_name,
          routeLongName: route?.route_long_name,
          headsign: trip.trip_headsign,
          departureStop: {
            stopId: 'STDENIS',
            stopName: gtfsData.stops.find(s => s.stop_id === 'STDENIS')?.stop_name,
            scheduledTime: departureTime.departure_time,
            estimatedTime: departureTime.departure_time,
            delay: 0
          },
          arrivalStop: {
            stopId: 'STPIERRE',
            stopName: gtfsData.stops.find(s => s.stop_id === 'STPIERRE')?.stop_name,
            scheduledTime: arrivalTime.arrival_time,
            estimatedTime: arrivalTime.arrival_time,
            delay: 0
          },
          duration: calculateDuration(departureTime.departure_time, arrivalTime.arrival_time),
          shape: gtfsData.shapes[shapeKey] || [],
          type: 'alternative',
          via: 'Saint-Benoît'
        });
      }
    });
  }
  
  // Cas spécifique : Saint-Pierre -> Saint-Denis
  if (fromStopId === 'STPIERRE' && toStopId === 'STDENIS') {
    // Ajouter les itinéraires alternatifs avec les lignes S4 et O2
    // Ligne S4 (via Le Tampon)
    const s4Trips = gtfsData.trips.filter(t => t.route_id === 'S4' && t.trip_headsign.includes('Saint-Denis'));
    
    s4Trips.forEach(trip => {
      const departureTime = gtfsData.stopTimes.find(st => st.trip_id === trip.trip_id && st.stop_id === 'STPIERRE');
      const arrivalTime = gtfsData.stopTimes.find(st => st.trip_id === trip.trip_id && st.stop_id === 'STDENIS');
      
      if (departureTime && arrivalTime) {
        const route = gtfsData.routes.find(r => r.route_id === 'S4');
        const shapeKey = 'S4-STPIERRE-STDENIS';
        
        alternativeRoutes.push({
          tripId: trip.trip_id,
          routeId: 'S4',
          routeName: route?.route_short_name,
          routeLongName: route?.route_long_name,
          headsign: trip.trip_headsign,
          departureStop: {
            stopId: 'STPIERRE',
            stopName: gtfsData.stops.find(s => s.stop_id === 'STPIERRE')?.stop_name,
            scheduledTime: departureTime.departure_time,
            estimatedTime: departureTime.departure_time,
            delay: 0
          },
          arrivalStop: {
            stopId: 'STDENIS',
            stopName: gtfsData.stops.find(s => s.stop_id === 'STDENIS')?.stop_name,
            scheduledTime: arrivalTime.arrival_time,
            estimatedTime: arrivalTime.arrival_time,
            delay: 0
          },
          duration: calculateDuration(departureTime.departure_time, arrivalTime.arrival_time),
          shape: gtfsData.shapes[shapeKey] || [],
          type: 'alternative',
          via: 'Le Tampon'
        });
      }
    });
    
    // Ligne O2 (via Saint-Benoît)
    const o2Trips = gtfsData.trips.filter(t => t.route_id === 'O2' && t.trip_headsign.includes('Saint-Denis'));
    
    o2Trips.forEach(trip => {
      const departureTime = gtfsData.stopTimes.find(st => st.trip_id === trip.trip_id && st.stop_id === 'STPIERRE');
      const arrivalTime = gtfsData.stopTimes.find(st => st.trip_id === trip.trip_id && st.stop_id === 'STDENIS');
      
      if (departureTime && arrivalTime) {
        const route = gtfsData.routes.find(r => r.route_id === 'O2');
        const shapeKey = 'O2-STPIERRE-STDENIS';
        
        alternativeRoutes.push({
          tripId: trip.trip_id,
          routeId: 'O2',
          routeName: route?.route_short_name,
          routeLongName: route?.route_long_name,
          headsign: trip.trip_headsign,
          departureStop: {
            stopId: 'STPIERRE',
            stopName: gtfsData.stops.find(s => s.stop_id === 'STPIERRE')?.stop_name,
            scheduledTime: departureTime.departure_time,
            estimatedTime: departureTime.departure_time,
            delay: 0
          },
          arrivalStop: {
            stopId: 'STDENIS',
            stopName: gtfsData.stops.find(s => s.stop_id === 'STDENIS')?.stop_name,
            scheduledTime: arrivalTime.arrival_time,
            estimatedTime: arrivalTime.arrival_time,
            delay: 0
          },
          duration: calculateDuration(departureTime.departure_time, arrivalTime.arrival_time),
          shape: gtfsData.shapes[shapeKey] || [],
          type: 'alternative',
          via: 'Saint-Benoît'
        });
      }
    });
  }
  
  // Combiner les itinéraires directs et alternatifs
  const allRoutes = [...directRoutes, ...alternativeRoutes];
  
  // Trier par heure de départ
  allRoutes.sort((a, b) => a.departureStop.scheduledTime.localeCompare(b.departureStop.scheduledTime));
  
  return allRoutes;
};

/**
 * Obtient les positions des véhicules en temps réel
 */
export const getVehiclePositions = () => {
  if (!realtimeData.vehiclePositions) {
    return [];
  }
  
  return realtimeData.vehiclePositions.map(vp => {
    const trip = gtfsData.trips.find(t => t.trip_id === vp.vehicle.trip.trip_id);
    const route = trip ? gtfsData.routes.find(r => r.route_id === trip.route_id) : null;
    
    return {
      vehicleId: vp.vehicle.id,
      tripId: vp.vehicle.trip.trip_id,
      routeId: route?.route_id,
      routeName: route?.route_short_name,
      position: {
        lat: vp.vehicle.position.latitude,
        lng: vp.vehicle.position.longitude,
        bearing: vp.vehicle.position.bearing
      },
      timestamp: vp.vehicle.timestamp,
      headsign: trip?.trip_headsign
    };
  });
};

/**
 * Obtient les alertes actives
 */
export const getAlerts = () => {
  if (!realtimeData.alerts) {
    return [];
  }
  
  return realtimeData.alerts.map(alert => {
    // Extraire les IDs des routes concernées
    const routeIds = alert.informedEntity
      .filter(entity => entity.route_id)
      .map(entity => entity.route_id);
    
    // Trouver les noms des routes
    const routes = routeIds.map(routeId => {
      const route = gtfsData.routes.find(r => r.route_id === routeId);
      return route ? {
        routeId,
        routeName: route.route_short_name,
        routeLongName: route.route_long_name
      } : { routeId };
    });
    
    return {
      id: alert.id,
      effect: alert.effect,
      routes,
      header: alert.headerText.translation[0].text,
      description: alert.descriptionText.translation[0].text
    };
  });
};

/**
 * Analyse une question en langage naturel et retourne les informations pertinentes
 */
export const analyzeTransportQuery = async (query) => {
  // Assurer que les données sont chargées
  if (!gtfsData.loaded) {
    await loadGtfsData();
  }
  
  // Rafraîchir les données temps réel
  await loadRealtimeData();
  
  const normalizedQuery = query.toLowerCase();
  
  // Recherche de patterns dans la question
  
  // Vérifier si la requête est vide ou trop courte
  if (!normalizedQuery || normalizedQuery.length < 3) {
    return {
      type: 'unknown',
      message: "Je n'ai pas compris votre question. Vous pouvez me demander les horaires d'un arrêt, un itinéraire entre deux arrêts, des informations sur une ligne, les alertes en cours, ou la position des bus en temps réel."
    };
  }
  
  // Traitement des exemples de questions prédéfinis
  if (normalizedQuery === "comment aller de saint-denis à saint-pierre ?" || 
      normalizedQuery === "comment aller de saint-denis à saint-pierre") {
    const fromStops = findStopsByName("Saint-Denis");
    const toStops = findStopsByName("Saint-Pierre");
    
    if (fromStops.length > 0 && toStops.length > 0) {
      const routes = findRoute(fromStops[0].stop_id, toStops[0].stop_id);
      
      // Regrouper les itinéraires par type (direct vs alternatif)
      const directRoutes = routes.filter(route => route && route.type === 'direct') || [];
      const alternativeRoutes = routes.filter(route => route && route.type === 'alternative') || [];
      
      // Organiser les itinéraires par ligne
      const routesByLine = {};
      routes.forEach(route => {
        if (!route || !route.routeId) return;
        
        if (!routesByLine[route.routeId]) {
          routesByLine[route.routeId] = [];
        }
        routesByLine[route.routeId].push(route);
      });
      
      return {
        type: 'route',
        fromStop: fromStops[0],
        toStop: toStops[0],
        routes,
        directRoutes,
        alternativeRoutes,
        routesByLine,
        hasAlternatives: alternativeRoutes.length > 0
      };
    }
  }
  
  // Traitement spécifique pour Saint-Pierre à Saint-Denis
  if (normalizedQuery === "comment aller de saint-pierre à saint-denis ?" || 
      normalizedQuery === "comment aller de saint-pierre à saint-denis") {
    const fromStops = findStopsByName("Saint-Pierre");
    const toStops = findStopsByName("Saint-Denis");
    
    if (fromStops.length > 0 && toStops.length > 0) {
      const routes = findRoute(fromStops[0].stop_id, toStops[0].stop_id);
      
      // Regrouper les itinéraires par type (direct vs alternatif)
      const directRoutes = routes.filter(route => route && route.type === 'direct') || [];
      const alternativeRoutes = routes.filter(route => route && route.type === 'alternative') || [];
      
      // Organiser les itinéraires par ligne
      const routesByLine = {};
      routes.forEach(route => {
        if (!route || !route.routeId) return;
        
        if (!routesByLine[route.routeId]) {
          routesByLine[route.routeId] = [];
        }
        routesByLine[route.routeId].push(route);
      });
      
      return {
        type: 'route',
        fromStop: fromStops[0],
        toStop: toStops[0],
        routes,
        directRoutes,
        alternativeRoutes,
        routesByLine,
        hasAlternatives: alternativeRoutes.length > 0
      };
    }
  }
  
  // Pattern 1: Horaires d'un arrêt spécifique
  const stopPattern = /horaires? (?:de |du |à |pour )?(.+?)(?:\?|$)/i;
  const stopMatch = normalizedQuery.match(stopPattern);
  
  if (stopMatch) {
    const stopName = stopMatch[1].trim();
    const stops = findStopsByName(stopName);
    
    if (stops.length > 0) {
      const departures = findNextDepartures(stops[0].stop_id);
      return {
        type: 'departures',
        stop: stops[0],
        departures
      };
    }
  }
  
  // Pattern 2: Itinéraire entre deux arrêts
  // Expressions régulières plus flexibles pour capturer différentes formulations
  const routePatterns = [
    /(?:comment|itinéraire|aller) (?:de |du |depuis )?(.+?) (?:à|vers|jusqu'à|pour) (.+?)(?:\?|$)/i,
    /(?:de |depuis )(.+?) (?:à|vers|jusqu'à|pour) (.+?)(?:\?|$)/i,
    /(.+?) (?:à|vers|jusqu'à|pour) (.+?)(?:\?|$)/i
  ];
  
  let routeMatch = null;
  for (const pattern of routePatterns) {
    routeMatch = normalizedQuery.match(pattern);
    if (routeMatch) break;
  }
  
  if (routeMatch) {
    try {
      const fromStopName = routeMatch[1]?.trim() || '';
      const toStopName = routeMatch[2]?.trim() || '';
      
      if (!fromStopName || !toStopName) {
        return {
          type: 'unknown',
          message: "Je n'ai pas pu identifier clairement les arrêts de départ et d'arrivée. Pourriez-vous reformuler votre question ?"
        };
      }
      
      const fromStops = findStopsByName(fromStopName);
      const toStops = findStopsByName(toStopName);
      
      if (!fromStops || fromStops.length === 0) {
        return {
          type: 'unknown',
          message: `Je ne trouve pas d'arrêt correspondant à "${fromStopName}". Pourriez-vous vérifier le nom de l'arrêt de départ ?`
        };
      }
      
      if (!toStops || toStops.length === 0) {
        return {
          type: 'unknown',
          message: `Je ne trouve pas d'arrêt correspondant à "${toStopName}". Pourriez-vous vérifier le nom de l'arrêt d'arrivée ?`
        };
      }
      
      const routes = findRoute(fromStops[0].stop_id, toStops[0].stop_id);
      
      if (!routes || routes.length === 0) {
        return {
          type: 'unknown',
          message: `Je n'ai pas trouvé d'itinéraire entre ${fromStops[0].stop_name} et ${toStops[0].stop_name}. Il est possible qu'il n'y ait pas de ligne directe entre ces deux arrêts.`
        };
      }
      
      // Regrouper les itinéraires par type (direct vs alternatif)
      const directRoutes = routes.filter(route => route && route.type === 'direct') || [];
      const alternativeRoutes = routes.filter(route => route && route.type === 'alternative') || [];
      
      // Organiser les itinéraires par ligne
      const routesByLine = {};
      routes.forEach(route => {
        if (!route || !route.routeId) return;
        
        if (!routesByLine[route.routeId]) {
          routesByLine[route.routeId] = [];
        }
        routesByLine[route.routeId].push(route);
      });
      
      return {
        type: 'route',
        fromStop: fromStops[0],
        toStop: toStops[0],
        routes,
        directRoutes,
        alternativeRoutes,
        routesByLine,
        hasAlternatives: alternativeRoutes.length > 0
      };
    } catch (error) {
      console.error('Erreur lors de la recherche d\'itinéraire:', error);
      return {
        type: 'unknown',
        message: "Une erreur s'est produite lors de la recherche d'itinéraire. Veuillez réessayer avec une formulation différente."
      };
    }
  }
  
  // Pattern 3: Informations sur une ligne spécifique
  const linePatterns = [
    /(?:ligne|bus|car) (.+?)(?:\?|$)/i,
    /informations? (?:sur )?(?:la )?(?:ligne|bus|car)? (.+?)(?:\?|$)/i,
    /infos? (?:sur )?(?:la )?(?:ligne|bus|car)? (.+?)(?:\?|$)/i
  ];
  
  let lineMatch = null;
  for (const pattern of linePatterns) {
    lineMatch = normalizedQuery.match(pattern);
    if (lineMatch) break;
  }
  
  if (lineMatch) {
    const lineName = lineMatch[1].trim();
    const routes = findRoutesByName(lineName);
    
    if (routes.length > 0) {
      // Trouver les véhicules en temps réel pour cette ligne
      const vehicles = getVehiclePositions().filter(v => v.routeId === routes[0].route_id);
      
      // Trouver les alertes pour cette ligne
      const alerts = getAlerts().filter(a => 
        a.routes.some(r => r.routeId === routes[0].route_id)
      );
      
      return {
        type: 'line',
        route: routes[0],
        vehicles,
        alerts
      };
    }
  }
  
  // Pattern 4: Alertes générales
  if (normalizedQuery.includes('alerte') || normalizedQuery.includes('perturbation') || 
      normalizedQuery.includes('retard') || normalizedQuery.includes('alertes en cours')) {
    const alerts = getAlerts();
    return {
      type: 'alerts',
      alerts
    };
  }
  
  // Pattern 5: Position des bus en temps réel
  if (normalizedQuery.includes('position') || normalizedQuery.includes('où') || 
      normalizedQuery.includes('localisation') || normalizedQuery.includes('position des bus')) {
    const vehicles = getVehiclePositions();
    return {
      type: 'vehicles',
      vehicles
    };
  }
  
  // Si aucun pattern n'est détecté, retourner une réponse générique
  return {
    type: 'unknown',
    message: "Je n'ai pas compris votre question. Vous pouvez me demander les horaires d'un arrêt, un itinéraire entre deux arrêts, des informations sur une ligne, les alertes en cours, ou la position des bus en temps réel."
  };
};

// Fonctions utilitaires

/**
 * Calcule une nouvelle heure en ajoutant un délai (en secondes)
 */
function calculateTimeWithDelay(timeString, delaySeconds) {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds);
  date.setSeconds(date.getSeconds() + delaySeconds);
  
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
}

/**
 * Calcule la durée entre deux heures au format HH:MM:SS
 */
function calculateDuration(startTime, endTime) {
  const [startHours, startMinutes, startSeconds] = startTime.split(':').map(Number);
  const [endHours, endMinutes, endSeconds] = endTime.split(':').map(Number);
  
  const startDate = new Date();
  startDate.setHours(startHours, startMinutes, startSeconds);
  
  const endDate = new Date();
  endDate.setHours(endHours, endMinutes, endSeconds);
  
  // Si l'heure de fin est avant l'heure de début, ajouter un jour
  if (endDate < startDate) {
    endDate.setDate(endDate.getDate() + 1);
  }
  
  const durationMs = endDate - startDate;
  const durationMinutes = Math.floor(durationMs / 60000);
  
  return durationMinutes;
}

export default {
  loadGtfsData,
  loadRealtimeData,
  findStopsByName,
  findRoutesByName,
  findNextDepartures,
  findRoute,
  getVehiclePositions,
  getAlerts,
  analyzeTransportQuery
};
