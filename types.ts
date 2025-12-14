
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
  priceRange: string; // Added price
  category: 'Breakfast' | 'Lunch' | 'Dinner'; // Added category
  coordinates: Coordinates;
}

export interface Hotel {
  name: string;
  category: 'Budget' | 'Luxury';
  rating: string;
  priceEstimate: string;
  description: string;
  amenities: string[]; 
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
  hotels: Hotel[];
  topAttractions: Attraction[];
  photographySpots: PhotoSpot[];
  culinaryDelights: Dish[];
  travelTips: string[];
}

export interface SuggestedDestination {
  name: string;
  price: string;
  rating: string;
  reason: string;
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
  tabHotels: string;
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

  hotelsHeader: string;
  bookRoom: string;
  budgetStays: string;
  luxuryStays: string;
  priceFilterLabel: string;

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
