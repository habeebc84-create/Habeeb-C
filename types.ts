export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TravelRoute {
  mode: string;
  category: 'Budget' | 'Premium';
  duration: string;
  costEstimate: string;
  details: string;
}

export interface Attraction {
  name: string;
  description: string;
  type: string;
  bestTime: string;
  coordinates: Coordinates;
}

export interface PhotoSpot {
  name: string;
  description: string;
  bestAngle: string;
  coordinates: Coordinates;
}

export interface Dish {
  name: string;
  description: string;
  bestPlaceToTry: string;
  coordinates: Coordinates;
}

export interface Hotel {
  name: string;
  category: 'Budget' | 'Luxury';
  rating: string;
  priceEstimate: string;
  description: string;
}

export interface DestinationData {
  destinationName: string;
  tagline: string;
  description: string;
  history: string;
  bestTimeToVisit: string;
  currency: string;
  coordinates: Coordinates;
  originCoordinates: Coordinates;
  routes: TravelRoute[];
  hotels: Hotel[]; // Added hotels
  topAttractions: Attraction[];
  photographySpots: PhotoSpot[];
  culinaryDelights: Dish[];
  travelTips: string[];
}

export interface TranslationLabels {
  heroTitle: string;
  heroSubtitle: string;
  fromPlaceholder: string;
  toPlaceholder: string;
  exploreButton: string;
  locating: string;
  
  tabOverview: string;
  tabJourney: string;
  tabHotels: string; // Added
  tabMap: string;
  tabAttractions: string;
  tabFood: string;

  overviewHeader: string;
  bestTime: string;
  currency: string;
  historyHeader: string;
  
  routesHeader: string;
  from: string;
  viewMap: string;
  travelTipTitle: string;
  travelTipText: string;

  hotelsHeader: string; // Added
  bookRoom: string; // Added
  budgetStays: string; // Added
  luxuryStays: string; // Added
  priceFilterLabel: string; // Added

  mapHeader: string;
  mapSubtext: string;

  attractionsHeader: string;
  allAttractions: string;
  cameraSpots: string;
  proTip: string;

  cuisineHeader: string;
  tryAt: string;
  tipsHeader: string;

  // Settings & Fonts
  settingsHeader: string;
  languageLabel: string;
  typographyLabel: string;
  fontStandard: string;
  fontModern: string;
  fontClassic: string;
  fontEditorial: string;
}