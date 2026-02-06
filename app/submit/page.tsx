"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowRight, 
  CheckCircle, 
  Building2, 
  MapPin, 
  DollarSign, 
  Info,
  Monitor,
  Users,
  Clock,
  Car,
  Accessibility,
  Wifi,
  Baby,
  GraduationCap,
  Utensils,
  Image as ImageIcon,
  Tag,
  Loader2
} from "lucide-react";

// US States with abbreviations
const usStates = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
];

// All venue types from schema
const venueTypes = [
  { value: "", label: "Select venue type..." },
  { value: "sim_bar", label: "Simulator Bar" },
  { value: "training_studio", label: "Training Studio" },
  { value: "private_rental", label: "Private Rental" },
  { value: "retail_fitting_center", label: "Retail/Fitting Center" },
  { value: "country_club", label: "Country Club" },
  { value: "multi_sport_sim", label: "Multi-Sport Simulator" },
  { value: "hotel_resort", label: "Hotel/Resort" },
  { value: "indoor_golf_center", label: "Indoor Golf Center" },
  { value: "entertainment_venue", label: "Entertainment Venue" },
  { value: "golf_performance_center", label: "Golf Performance Center" },
  { value: "bar", label: "Bar" },
  { value: "other", label: "Other" },
];

// Launch monitor types
const launchMonitorTypes = [
  { value: "", label: "Select type..." },
  { value: "radar", label: "Radar-based" },
  { value: "photometric_camera", label: "Photometric/Camera" },
  { value: "hybrid", label: "Hybrid" },
  { value: "unknown", label: "Unknown/Other" },
];

// Simulator brands
const simulatorBrands = [
  { value: "", label: "Select brand..." },
  { value: "Trackman", label: "TrackMan" },
  { value: "Foresight", label: "Foresight" },
  { value: "GCQuad", label: "GCQuad" },
  { value: "Uneekor", label: "Uneekor" },
  { value: "SkyTrak", label: "SkyTrak" },
  { value: "FlightScope", label: "FlightScope" },
  { value: "Garmin", label: "Garmin" },
  { value: "Full Swing", label: "Full Swing" },
  { value: "Golfzon", label: "Golfzon" },
  { value: "AboutGolf", label: "AboutGolf" },
  { value: "HD Golf", label: "HD Golf" },
  { value: "TruGolf", label: "TruGolf" },
  { value: "OptiShot", label: "OptiShot" },
  { value: "Other", label: "Other" },
];

// Pricing models
const pricingModels = [
  { value: "", label: "Select pricing model..." },
  { value: "per_bay_hour", label: "Per Bay/Hour" },
  { value: "per_person_hour", label: "Per Person/Hour" },
  { value: "package", label: "Package Deals" },
  { value: "membership_only", label: "Membership Only" },
  { value: "mixed", label: "Mixed Pricing" },
];

// Parking types
const parkingTypes = [
  { value: "", label: "Select parking..." },
  { value: "free_lot", label: "Free Lot" },
  { value: "paid_lot", label: "Paid Lot" },
  { value: "street", label: "Street Parking" },
  { value: "garage", label: "Parking Garage" },
  { value: "valet", label: "Valet" },
  { value: "none", label: "No Parking" },
];

// Vibe tags
const vibeOptions = [
  "upscale", "casual", "sports-bar", "boutique", "lounge", 
  "entertainment", "family"
];

// Who it's for options
const whoItsForOptions = [
  "beginners", "corporate-groups", "serious-golfers", "date-night",
  "large-groups", "families", "league-players"
];

// Accessibility options
const accessibilityOptions = [
  "wheelchair_accessible", "elevator", "ground_floor", "accessible_parking"
];

// Days of week
const daysOfWeek = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

interface FormData {
  // Basic Info
  name: string;
  brandName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Contact
  phone: string;
  email: string;
  website: string;
  bookingUrl: string;
  
  // Description
  about: string;
  
  // Venue Details
  venueType: string;
  
  // Tech
  simulatorBrand: string;
  simulatorModel: string;
  launchMonitorType: string;
  ballTracking: boolean;
  clubTracking: boolean;
  puttingMode: string;
  leftyFriendly: boolean;
  
  // Facility
  bayCount: string;
  hasPrivateRooms: boolean;
  privateRoomsCount: string;
  maxGroupSizePerBay: string;
  
  // Pricing
  pricingModel: string;
  priceRangeMin: string;
  priceRangeMax: string;
  
  // Amenities
  hasFood: boolean;
  hasAlcohol: boolean;
  parking: string;
  wifi: boolean;
  kidFriendly: boolean;
  coachingAvailable: boolean;
  
  // Categories
  vibeTags: string[];
  whoItsFor: string[];
  accessibility: string[];
  
  // Hours
  hours: Record<string, { open: string; close: string; closed: boolean }>;
  walkInsAllowed: boolean;
  
  // Media
  heroImage: string;
  
  // Submitter
  submitterEmail: string;
}

const initialHours = daysOfWeek.reduce((acc, day) => ({
  ...acc,
  [day]: { open: "09:00", close: "22:00", closed: false }
}), {});

const initialFormData: FormData = {
  name: "",
  brandName: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  phone: "",
  email: "",
  website: "",
  bookingUrl: "",
  about: "",
  venueType: "",
  simulatorBrand: "",
  simulatorModel: "",
  launchMonitorType: "",
  ballTracking: false,
  clubTracking: false,
  puttingMode: "",
  leftyFriendly: false,
  bayCount: "",
  hasPrivateRooms: false,
  privateRoomsCount: "",
  maxGroupSizePerBay: "",
  pricingModel: "",
  priceRangeMin: "",
  priceRangeMax: "",
  hasFood: false,
  hasAlcohol: false,
  parking: "",
  wifi: false,
  kidFriendly: false,
  coachingAvailable: false,
  vibeTags: [],
  whoItsFor: [],
  accessibility: [],
  hours: initialHours,
  walkInsAllowed: true,
  heroImage: "",
  submitterEmail: "",
};

export default function SubmitVenuePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [customCity, setCustomCity] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Build simulator systems JSON
      const simulatorSystems = formData.simulatorBrand ? [{
        brand: formData.simulatorBrand,
        model: formData.simulatorModel || undefined,
      }] : [];

      // Build food and drink JSON
      const foodAndDrink = {
        food: formData.hasFood,
        alcohol: formData.hasAlcohol,
        notes: "",
      };

      // Build hours string
      const hoursString = Object.entries(formData.hours)
        .filter(([, value]) => !value.closed)
        .map(([day, value]) => `${day}:${value.open}-${value.close}`)
        .join("|");

      const submissionData = {
        ...formData,
        simulatorSystems,
        foodAndDrink,
        hours: hoursString,
        bayCount: formData.bayCount ? parseInt(formData.bayCount) : null,
        privateRoomsCount: formData.privateRoomsCount ? parseInt(formData.privateRoomsCount) : null,
        maxGroupSizePerBay: formData.maxGroupSizePerBay ? parseInt(formData.maxGroupSizePerBay) : null,
        priceRangeMin: formData.priceRangeMin ? parseInt(formData.priceRangeMin) : null,
        priceRangeMax: formData.priceRangeMax ? parseInt(formData.priceRangeMax) : null,
      };

      const res = await fetch("/api/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting venue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cities when state changes
  useEffect(() => {
    if (formData.state) {
      setLoadingCities(true);
      setCustomCity(false);
      fetch(`/api/venues/cities?state=${formData.state}`)
        .then((res) => res.json())
        .then((data) => {
          setAvailableCities(data.cities || []);
          setLoadingCities(false);
        })
        .catch(() => {
          setAvailableCities([]);
          setLoadingCities(false);
        });
    } else {
      setAvailableCities([]);
      setCustomCity(false);
    }
  }, [formData.state]);

  const toggleArrayValue = (field: keyof FormData, value: string) => {
    const current = formData[field] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: updated });
  };

  const updateHours = (day: string, field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      hours: {
        ...formData.hours,
        [day]: { ...formData.hours[day], [field]: value }
      }
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-black py-12 px-4">
        <div className="absolute inset-0 scorecard-grid opacity-20" />
        
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="border border-masters-green p-8 bg-charcoal">
            <CheckCircle className="w-16 h-16 text-masters-green mx-auto mb-4" />
            <h1 className="text-cream mb-2">Thank You!</h1>
            <p className="text-muted">
              Your venue submission has been received and will be reviewed shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black py-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Add Venue</span>
          </div>
          <h1 className="text-cream mb-2">Submit a Venue</h1>
          <p className="text-muted max-w-xl">
            Add a new golf simulator venue to our directory. All submissions are reviewed before publishing.
          </p>
        </div>

        {/* Form Card */}
        <div className="border border-default bg-charcoal p-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Basic Info */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-masters-green" />
                <h2 className="text-xl font-semibold text-cream">Basic Information</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      Venue Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                      placeholder="e.g., Eagle Club Indoor Golf"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      Brand Name (if different)
                    </label>
                    <input
                      type="text"
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                      placeholder="e.g., Topgolf"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      State *
                    </label>
                    <select
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value, city: "" })}
                      className="w-full px-4 py-3 bg-charcoal border border-default text-cream focus:outline-none focus:border-masters-green transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Select state...</option>
                      {usStates.map((state) => (
                        <option key={state.code} value={state.code}>{state.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      City *
                    </label>
                    {customCity ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                          placeholder="Enter city name"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCustomCity(false);
                            setFormData({ ...formData, city: "" });
                          }}
                          className="text-xs text-masters-green hover:text-cream transition-colors"
                        >
                          ← Back to city list
                        </button>
                      </div>
                    ) : (
                      <>
                        <select
                          required
                          disabled={!formData.state || loadingCities}
                          value={formData.city}
                          onChange={(e) => {
                            if (e.target.value === "__custom__") {
                              setCustomCity(true);
                              setFormData({ ...formData, city: "" });
                            } else {
                              setFormData({ ...formData, city: e.target.value });
                            }
                          }}
                          className="w-full px-4 py-3 bg-charcoal border border-default text-cream focus:outline-none focus:border-masters-green transition-colors appearance-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="">
                            {loadingCities ? "Loading cities..." : formData.state ? "Select city..." : "Select state first"}
                          </option>
                          {availableCities.map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                          <option value="__custom__">+ Add a new city</option>
                        </select>
                        {loadingCities && (
                          <div className="flex items-center gap-2 mt-2">
                            <Loader2 className="w-4 h-4 animate-spin text-masters-green" />
                            <span className="text-xs text-muted">Loading cities...</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                      placeholder="e.g., 12345"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-default" />

            {/* Contact */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-masters-green" />
                <h2 className="text-xl font-semibold text-cream">Contact Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                    placeholder="info@venue.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Booking URL (if different)
                  </label>
                  <input
                    type="url"
                    value={formData.bookingUrl}
                    onChange={(e) => setFormData({ ...formData, bookingUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-default" />

            {/* Description */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Info className="w-5 h-5 text-masters-green" />
                <h2 className="text-xl font-semibold text-cream">Description</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Full Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors resize-none"
                    placeholder="Detailed description of the venue, atmosphere, offerings..."
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-default" />

            {/* Venue Type */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-masters-green" />
                <h2 className="text-xl font-semibold text-cream">Venue Type</h2>
              </div>
              
              <div>
                <select
                  value={formData.venueType}
                  onChange={(e) => setFormData({ ...formData, venueType: e.target.value })}
                  className="w-full px-4 py-3 bg-charcoal border border-default text-cream focus:outline-none focus:border-masters-green transition-colors appearance-none cursor-pointer"
                >
                  {venueTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </section>

            <div className="border-t border-default" />

            {/* Technology */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Monitor className="w-5 h-5 text-masters-green" />
                <h2 className="text-xl font-semibold text-cream">Technology & Equipment</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      Simulator Brand
                    </label>
                    <select
                      value={formData.simulatorBrand}
                      onChange={(e) => setFormData({ ...formData, simulatorBrand: e.target.value })}
                      className="w-full px-4 py-3 bg-charcoal border border-default text-cream focus:outline-none focus:border-masters-green transition-colors appearance-none cursor-pointer"
                    >
                      {simulatorBrands.map((brand) => (
                        <option key={brand.value} value={brand.value}>{brand.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      Model (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.simulatorModel}
                      onChange={(e) => setFormData({ ...formData, simulatorModel: e.target.value })}
                      className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                      placeholder="e.g., iO, SIG8"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Launch Monitor Type
                  </label>
                  <select
                    value={formData.launchMonitorType}
                    onChange={(e) => setFormData({ ...formData, launchMonitorType: e.target.value })}
                    className="w-full px-4 py-3 bg-charcoal border border-default text-cream focus:outline-none focus:border-masters-green transition-colors appearance-none cursor-pointer"
                  >
                    {launchMonitorTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.ballTracking}
                      onChange={(e) => setFormData({ ...formData, ballTracking: e.target.checked })}
                      className="w-4 h-4 accent-masters-green"
                    />
                    <span className="text-sm text-cream">Ball Tracking</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.clubTracking}
                      onChange={(e) => setFormData({ ...formData, clubTracking: e.target.checked })}
                      className="w-4 h-4 accent-masters-green"
                    />
                    <span className="text-sm text-cream">Club Tracking</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.leftyFriendly}
                      onChange={(e) => setFormData({ ...formData, leftyFriendly: e.target.checked })}
                      className="w-4 h-4 accent-masters-green"
                    />
                    <span className="text-sm text-cream">Lefty Friendly</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Putting Mode
                  </label>
                  <select
                    value={formData.puttingMode}
                    onChange={(e) => setFormData({ ...formData, puttingMode: e.target.value })}
                    className="w-full px-4 py-3 bg-charcoal border border-default text-cream focus:outline-none focus:border-masters-green transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select putting mode...</option>
                    <option value="auto_putt">Auto Putt</option>
                    <option value="gimme_circle">Gimme Circle</option>
                    <option value="real_putting_surface">Real Putting Surface</option>
                  </select>
                </div>
              </div>
            </section>

            <div className="border-t border-default" />

            {/* Facility */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-masters-green" />
                <h2 className="text-xl font-semibold text-cream">Facility Details</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      Number of Bays
                    </label>
                    <input
                      type="number"
                      value={formData.bayCount}
                      onChange={(e) => setFormData({ ...formData, bayCount: e.target.value })}
                      className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                      placeholder="e.g., 8"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      Max Group Size/Bay
                    </label>
                    <input
                      type="number"
                      value={formData.maxGroupSizePerBay}
                      onChange={(e) => setFormData({ ...formData, maxGroupSizePerBay: e.target.value })}
                      className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                      placeholder="e.g., 6"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      Private Rooms
                    </label>
                    <input
                      type="number"
                      value={formData.privateRoomsCount}
                      onChange={(e) => setFormData({ ...formData, privateRoomsCount: e.target.value })}
                      className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                      placeholder="e.g., 2"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasPrivateRooms}
                    onChange={(e) => setFormData({ ...formData, hasPrivateRooms: e.target.checked })}
                    className="w-4 h-4 accent-masters-green"
                  />
                  <span className="text-sm text-cream">Has Private Rooms Available</span>
                </label>
              </div>
            </section>

            <div className="border-t border-default" />

            {/* Pricing */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="w-5 h-5 text-masters-green" />
                <h2 className="text-xl font-semibold text-cream">Pricing</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Pricing Model
                  </label>
                  <select
                    value={formData.pricingModel}
                    onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value })}
                    className="w-full px-4 py-3 bg-charcoal border border-default text-cream focus:outline-none focus:border-masters-green transition-colors appearance-none cursor-pointer"
                  >
                    {pricingModels.map((model) => (
                      <option key={model.value} value={model.value}>{model.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      Price Range (Min $/hr)
                    </label>
                    <input
                      type="number"
                      value={formData.priceRangeMin}
                      onChange={(e) => setFormData({ ...formData, priceRangeMin: e.target.value })}
                      className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                      placeholder="e.g., 40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      Price Range (Max $/hr)
                    </label>
                    <input
                      type="number"
                      value={formData.priceRangeMax}
                      onChange={(e) => setFormData({ ...formData, priceRangeMax: e.target.value })}
                      className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                      placeholder="e.g., 80"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-default" />

            {/* Amenities */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Utensils className="w-5 h-5 text-masters-green" />
                <h2 className="text-xl font-semibold text-cream">Amenities</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasFood}
                      onChange={(e) => setFormData({ ...formData, hasFood: e.target.checked })}
                      className="w-4 h-4 accent-masters-green"
                    />
                    <span className="text-sm text-cream">Food Service</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasAlcohol}
                      onChange={(e) => setFormData({ ...formData, hasAlcohol: e.target.checked })}
                      className="w-4 h-4 accent-masters-green"
                    />
                    <span className="text-sm text-cream">Alcohol/Bar</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.wifi}
                      onChange={(e) => setFormData({ ...formData, wifi: e.target.checked })}
                      className="w-4 h-4 accent-masters-green"
                    />
                    <Wifi className="w-4 h-4 text-muted" />
                    <span className="text-sm text-cream">WiFi</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.kidFriendly}
                      onChange={(e) => setFormData({ ...formData, kidFriendly: e.target.checked })}
                      className="w-4 h-4 accent-masters-green"
                    />
                    <Baby className="w-4 h-4 text-muted" />
                    <span className="text-sm text-cream">Kid Friendly</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.coachingAvailable}
                      onChange={(e) => setFormData({ ...formData, coachingAvailable: e.target.checked })}
                      className="w-4 h-4 accent-masters-green"
                    />
                    <GraduationCap className="w-4 h-4 text-muted" />
                    <span className="text-sm text-cream">Coaching Available</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    <Car className="w-4 h-4 inline mr-1" />
                    Parking
                  </label>
                  <select
                    value={formData.parking}
                    onChange={(e) => setFormData({ ...formData, parking: e.target.value })}
                    className="w-full px-4 py-3 bg-charcoal border border-default text-cream focus:outline-none focus:border-masters-green transition-colors appearance-none cursor-pointer"
                  >
                    {parkingTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <div className="border-t border-default" />

            {/* Categories */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Tag className="w-5 h-5 text-masters-green" />
                <h2 className="text-xl font-semibold text-cream">Categories & Tags</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-cream mb-3">
                    Vibe/Atmosphere
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {vibeOptions.map((vibe) => (
                      <button
                        key={vibe}
                        type="button"
                        onClick={() => toggleArrayValue("vibeTags", vibe)}
                        className={`px-3 py-1.5 text-sm border rounded transition-colors ${
                          formData.vibeTags.includes(vibe)
                            ? "bg-masters-green text-deep-black border-masters-green"
                            : "border-default text-cream hover:border-masters-green"
                        }`}
                      >
                        {vibe.replace("-", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cream mb-3">
                    <Users className="w-4 h-4 inline mr-1" />
                    Who It&apos;s For
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {whoItsForOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleArrayValue("whoItsFor", option)}
                        className={`px-3 py-1.5 text-sm border rounded transition-colors ${
                          formData.whoItsFor.includes(option)
                            ? "bg-masters-green text-deep-black border-masters-green"
                            : "border-default text-cream hover:border-masters-green"
                        }`}
                      >
                        {option.replace("-", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cream mb-3">
                    <Accessibility className="w-4 h-4 inline mr-1" />
                    Accessibility Features
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {accessibilityOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleArrayValue("accessibility", option)}
                        className={`px-3 py-1.5 text-sm border rounded transition-colors ${
                          formData.accessibility.includes(option)
                            ? "bg-masters-green text-deep-black border-masters-green"
                            : "border-default text-cream hover:border-masters-green"
                        }`}
                      >
                        {option.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-default" />

            {/* Hours */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-masters-green" />
                <h2 className="text-xl font-semibold text-cream">Hours of Operation</h2>
              </div>
              
              <div className="space-y-3">
                {daysOfWeek.map((day) => (
                  <div key={day} className="flex items-center gap-4">
                    <span className="w-16 text-sm text-cream capitalize">{day}</span>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.hours[day].closed}
                        onChange={(e) => updateHours(day, "closed", e.target.checked)}
                        className="w-4 h-4 accent-masters-green"
                      />
                      <span className="text-sm text-muted">Closed</span>
                    </label>
                    {!formData.hours[day].closed && (
                      <>
                        <input
                          type="time"
                          value={formData.hours[day].open}
                          onChange={(e) => updateHours(day, "open", e.target.value)}
                          className="px-2 py-1 bg-transparent border border-default text-cream text-sm"
                        />
                        <span className="text-muted">to</span>
                        <input
                          type="time"
                          value={formData.hours[day].close}
                          onChange={(e) => updateHours(day, "close", e.target.value)}
                          className="px-2 py-1 bg-transparent border border-default text-cream text-sm"
                        />
                      </>
                    )}
                  </div>
                ))}

                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.walkInsAllowed}
                    onChange={(e) => setFormData({ ...formData, walkInsAllowed: e.target.checked })}
                    className="w-4 h-4 accent-masters-green"
                  />
                  <span className="text-sm text-cream">Walk-ins Allowed</span>
                </label>
              </div>
            </section>

            <div className="border-t border-default" />

            {/* Media */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <ImageIcon className="w-5 h-5 text-masters-green" />
                <h2 className="text-xl font-semibold text-cream">Media</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  Hero Image URL
                </label>
                <input
                  type="url"
                  value={formData.heroImage}
                  onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                  className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </section>

            <div className="border-t border-default" />

            {/* Submitter Email */}
            <section>
              <label className="block text-sm font-medium text-cream mb-2">
                Your Email (optional, for follow-up)
              </label>
              <input
                type="email"
                value={formData.submitterEmail}
                onChange={(e) => setFormData({ ...formData, submitterEmail: e.target.value })}
                className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                placeholder="you@example.com"
              />
            </section>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : (
                <>
                  <span>Submit Venue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to home */}
        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-muted hover:text-cream transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
