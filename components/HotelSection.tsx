
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Bed, Star, ChevronRight, DollarSign, SlidersHorizontal, ZoomIn, X, ChevronLeft, ImageIcon, MessageSquare, User, Send, ThumbsUp, Wifi, Waves, Dumbbell, Coffee, CircleParking, Tv, Car, Bus, Clock, BarChart3, Globe, ChevronDown } from './Icons';
import { DestinationData, TranslationLabels, Hotel, Review, Coordinates } from '../types';
import { getHotelReviews } from '../services/geminiService';

interface HotelSectionProps {
  data: DestinationData;
  labels: TranslationLabels;
}

// Extension to Hotel interface for internal use
interface ParsedHotel extends Hotel {
  parsedPrice: number;
}

const EXCHANGE_RATES: Record<string, number> = {
  'INR': 1,
  'USD': 0.012,
  'EUR': 0.011,
  'GBP': 0.0095,
  'JPY': 1.8
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  'INR': '₹',
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥'
};

const CURRENCIES = [
  { code: 'INR', name: 'INR' },
  { code: 'USD', name: 'USD' },
  { code: 'EUR', name: 'EUR' },
  { code: 'GBP', name: 'GBP' },
  { code: 'JPY', name: 'JPY' },
];

const HotelSection: React.FC<HotelSectionProps> = ({ data, labels }) => {
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeModalTab, setActiveModalTab] = useState<'gallery' | 'reviews'>('gallery');
  
  // Currency State
  const [currency, setCurrency] = useState('INR');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);
  
  // Booking Confirmation State
  const [bookingConfirmation, setBookingConfirmation] = useState<{ hotelName: string; url: string } | null>(null);
  
  // Real database of reviews fetched from API
  const [reviews, setReviews] = useState<Record<string, Review[]>>({});
  const [loadingReviews, setLoadingReviews] = useState<Record<string, boolean>>({});
  
  // Real-time pricing simulation
  const [realTimePrices, setRealTimePrices] = useState<Record<string, string>>({});
  const [loadingPrices, setLoadingPrices] = useState(true);

  // Review Form State
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  // Haptic Feedback Helper
  const triggerHaptic = (pattern: number | number[] = 10) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setShowCurrencyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Simulate fetching real-time prices
  useEffect(() => {
    setLoadingPrices(true);
    setRealTimePrices({}); // Reset

    const timer = setTimeout(() => {
      const newPrices: Record<string, string> = {};
      
      data.hotels.forEach(h => {
        // Extract numeric value and currency
        let value = 0;
        let currency = '$';
        
        const inrMatch = h.priceEstimate.match(/₹\s?([\d,]+)/);
        const dollarMatch = h.priceEstimate.match(/\$\s?([\d,]+)/);
        const euroMatch = h.priceEstimate.match(/€\s?([\d,]+)/);
        
        if (inrMatch) {
            value = parseInt(inrMatch[1].replace(/,/g, ''), 10);
            currency = '₹';
        } else if (dollarMatch) {
            value = parseInt(dollarMatch[1].replace(/,/g, ''), 10);
            currency = '$';
        } else if (euroMatch) {
            value = parseInt(euroMatch[1].replace(/,/g, ''), 10);
            currency = '€';
        } else {
             const match = h.priceEstimate.match(/(\d[\d,]*)/);
             value = match ? parseInt(match[0].replace(/,/g, ''), 10) : 0;
        }

        // Apply dynamic pricing variation (+/- 15%)
        const variation = 1 + (Math.random() * 0.3 - 0.15); 
        const newValue = Math.round(value * variation);
        
        newPrices[h.name] = `${currency} ${newValue.toLocaleString()}`;
      });

      setRealTimePrices(newPrices);
      setLoadingPrices(false);
    }, 1500); // 1.5s delay for effect

    return () => clearTimeout(timer);
  }, [data.hotels]);

  const getBookingUrl = (hotelName: string, destination: string) => {
    const query = encodeURIComponent(`${hotelName} ${destination}`);
    return `https://www.booking.com/searchresults.html?ss=${query}`;
  };

  const handleBookClick = (e: React.MouseEvent, hotelName: string, destination: string) => {
    e.preventDefault();
    triggerHaptic(15);
    const url = getBookingUrl(hotelName, destination);
    setBookingConfirmation({ hotelName, url });
  };

  const confirmBooking = () => {
    if (bookingConfirmation) {
      triggerHaptic(20);
      window.open(bookingConfirmation.url, '_blank', 'noopener,noreferrer');
      setBookingConfirmation(null);
    }
  };

  const cancelBooking = () => {
    triggerHaptic(10);
    setBookingConfirmation(null);
  };

  const openUber = (coords: Coordinates, name: string) => {
    triggerHaptic(15);
    // Uber Universal Link with Dropoff Lat/Lng
    const url = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${coords.lat}&dropoff[longitude]=${coords.lng}&dropoff[nickname]=${encodeURIComponent(name)}`;
    window.open(url, '_blank');
  };

  const openTransitRoute = (coords: Coordinates) => {
    triggerHaptic(15);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&travelmode=transit`;
    window.open(url, '_blank');
  };

  const getAmenityIcon = (amenity: string) => {
    const a = amenity.toLowerCase();
    if (a.includes('wifi') || a.includes('internet')) return <Wifi size={14} />;
    if (a.includes('pool') || a.includes('swim')) return <Waves size={14} />;
    if (a.includes('gym') || a.includes('fitness') || a.includes('workout')) return <Dumbbell size={14} />;
    if (a.includes('break') || a.includes('coffee') || a.includes('restaur') || a.includes('dining')) return <Coffee size={14} />;
    if (a.includes('park') || a.includes('garage')) return <CircleParking size={14} />;
    if (a.includes('tv') || a.includes('cable')) return <Tv size={14} />;
    return <Star size={14} />; // Default
  };

  const hotelData = useMemo(() => {
    return data.hotels.map(h => {
      // Use real-time price if available, otherwise static
      const effectivePriceStr = realTimePrices[h.name] || h.priceEstimate;

      // Clean string
      const cleanStr = effectivePriceStr.replace(/,/g, '');
      let rawValue = 0;
      let rawCode = 'INR';

      // Detect original currency
      if (cleanStr.includes('₹')) {
         rawCode = 'INR';
         rawValue = parseInt(cleanStr.match(/(\d+)/)?.[0] || '0', 10);
      } else if (cleanStr.includes('$')) {
         rawCode = 'USD';
         rawValue = parseInt(cleanStr.match(/(\d+)/)?.[0] || '0', 10);
      } else if (cleanStr.includes('€')) {
         rawCode = 'EUR';
         rawValue = parseInt(cleanStr.match(/(\d+)/)?.[0] || '0', 10);
      } else if (cleanStr.includes('£')) {
         rawCode = 'GBP';
         rawValue = parseInt(cleanStr.match(/(\d+)/)?.[0] || '0', 10);
      } else {
         // Fallback
         rawValue = parseInt(cleanStr.match(/(\d+