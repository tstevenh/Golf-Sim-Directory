"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface SearchFormProps {
  initialQuery: string;
  initialCity: string;
  initialState: string;
  initialVenueType: string;
  initialLaunchMonitorType: string;
  initialHardware: string;
  initialMinPrice?: number;
  initialMaxPrice?: number;
  initialKidFriendly: boolean;
  initialCoaching: boolean;
  initialFood: boolean;
  initialAlcohol: boolean;
  initialWifi: boolean;
  initialPrivateRooms: boolean;
  availableStates: Array<{ code: string; name: string }>;
  availableCities: Array<{ city: string; state: string }>;
}

const venueTypes = [
  { value: "", label: "Any Type" },
  { value: "sim_bar", label: "Simulator Bar" },
  { value: "training_studio", label: "Training Studio" },
  { value: "private_rental", label: "Private Rental" },
  { value: "retail_fitting_center", label: "Retail/Fitting" },
  { value: "country_club", label: "Country Club" },
  { value: "multi_sport_sim", label: "Multi-Sport" },
  { value: "hotel_resort", label: "Hotel/Resort" },
];

const launchMonitorTypes = [
  { value: "", label: "Any System" },
  { value: "radar", label: "Radar" },
  { value: "photometric_camera", label: "Camera" },
  { value: "hybrid", label: "Hybrid" },
];

const hardwareBrands = [
  "Trackman",
  "Foresight",
  "Uneekor",
  "GCQuad",
  "Full Swing",
  "AboutGolf",
  "SkyTrak",
  "FlightScope",
  "Golfzon",
];

export function SearchForm({
  initialQuery,
  initialCity,
  initialState,
  initialVenueType,
  initialLaunchMonitorType,
  initialHardware,
  initialMinPrice,
  initialMaxPrice,
  initialKidFriendly,
  initialCoaching,
  initialFood,
  initialAlcohol,
  initialWifi,
  initialPrivateRooms,
  availableStates,
  availableCities,
}: SearchFormProps) {
  const router = useRouter();
  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [showFilters, setShowFilters] = useState(false);

  // Filter cities based on selected state
  const filteredCities = useMemo(() => {
    if (!selectedState) return availableCities;
    return availableCities.filter((c) => c.state === selectedState);
  }, [selectedState, availableCities]);

  // Reset city when state changes
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    setSelectedCity(""); // Reset city when state changes
  };

  return (
    <div className="space-y-4">
      {/* COMPACT SEARCH BAR */}
      <form method="get" className="border border-default bg-charcoal p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-4">
            <input
              name="q"
              defaultValue={initialQuery}
              placeholder="Search by name or ZIP"
              className="w-full px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none text-sm"
              autoComplete="off"
            />
          </div>

          {/* State Dropdown */}
          <div className="md:col-span-3">
            <select
              name="state"
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none text-sm"
            >
              <option value="">All States</option>
              {availableStates.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div className="md:col-span-3">
            <select
              name="city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedState}
              className="w-full px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none disabled:opacity-50 text-sm"
            >
              <option value="">
                {selectedState ? "All Cities" : "Select state first"}
              </option>
              {filteredCities.map((cityObj) => (
                <option key={`${cityObj.state}-${cityObj.city}`} value={cityObj.city}>
                  {cityObj.city}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button + Filters Toggle */}
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="flex-1 px-3 py-2 bg-masters-green text-deep-black font-medium hover:bg-masters-green/90 transition-colors text-sm">
              <Search className="w-4 h-4 mx-auto" />
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 border transition-colors text-sm ${
                showFilters
                  ? "border-masters-green text-masters-green"
                  : "border-default text-muted hover:border-masters-green hover:text-cream"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hidden fields to preserve other filters when searching */}
        {initialVenueType && <input type="hidden" name="venueType" value={initialVenueType} />}
        {initialLaunchMonitorType && <input type="hidden" name="launchMonitorType" value={initialLaunchMonitorType} />}
        {initialHardware && <input type="hidden" name="hardware" value={initialHardware} />}
        {initialMinPrice && <input type="hidden" name="minPrice" value={initialMinPrice} />}
        {initialMaxPrice && <input type="hidden" name="maxPrice" value={initialMaxPrice} />}
        {initialKidFriendly && <input type="hidden" name="kidFriendly" value="true" />}
        {initialCoaching && <input type="hidden" name="coaching" value="true" />}
        {initialFood && <input type="hidden" name="food" value="true" />}
        {initialAlcohol && <input type="hidden" name="alcohol" value="true" />}
        {initialWifi && <input type="hidden" name="wifi" value="true" />}
        {initialPrivateRooms && <input type="hidden" name="privateRooms" value="true" />}
      </form>

      {/* COLLAPSIBLE FILTERS */}
      {showFilters && (
        <form method="get" className="border border-default bg-charcoal p-4">
          {/* Preserve search query */}
          {initialQuery && <input type="hidden" name="q" value={initialQuery} />}
          {selectedState && <input type="hidden" name="state" value={selectedState} />}
          {selectedCity && <input type="hidden" name="city" value={selectedCity} />}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-masters-green" />
              <h3 className="text-cream text-sm font-medium">Advanced Filters</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="text-muted hover:text-cream transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <select
              name="venueType"
              defaultValue={initialVenueType}
              className="px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none text-sm"
            >
              {venueTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              name="launchMonitorType"
              defaultValue={initialLaunchMonitorType}
              className="px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none text-sm"
            >
              {launchMonitorTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              name="hardware"
              defaultValue={initialHardware}
              className="px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none text-sm"
            >
              <option value="">Any Hardware</option>
              {hardwareBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input
              name="minPrice"
              type="number"
              defaultValue={initialMinPrice?.toString()}
              placeholder="Min $/hr"
              min="0"
              className="px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none text-sm"
            />
            <input
              name="maxPrice"
              type="number"
              defaultValue={initialMaxPrice?.toString()}
              placeholder="Max $/hr"
              min="0"
              className="px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer hover:text-cream transition-colors">
              <input
                type="checkbox"
                name="kidFriendly"
                defaultChecked={initialKidFriendly}
                className="rounded border-default text-masters-green focus:ring-masters-green"
              />
              Kid-Friendly
            </label>
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer hover:text-cream transition-colors">
              <input
                type="checkbox"
                name="coaching"
                defaultChecked={initialCoaching}
                className="rounded border-default text-masters-green focus:ring-masters-green"
              />
              Coaching
            </label>
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer hover:text-cream transition-colors">
              <input
                type="checkbox"
                name="food"
                defaultChecked={initialFood}
                className="rounded border-default text-masters-green focus:ring-masters-green"
              />
              Food
            </label>
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer hover:text-cream transition-colors">
              <input
                type="checkbox"
                name="alcohol"
                defaultChecked={initialAlcohol}
                className="rounded border-default text-masters-green focus:ring-masters-green"
              />
              Bar/Alcohol
            </label>
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer hover:text-cream transition-colors">
              <input
                type="checkbox"
                name="wifi"
                defaultChecked={initialWifi}
                className="rounded border-default text-masters-green focus:ring-masters-green"
              />
              WiFi
            </label>
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer hover:text-cream transition-colors">
              <input
                type="checkbox"
                name="privateRooms"
                defaultChecked={initialPrivateRooms}
                className="rounded border-default text-masters-green focus:ring-masters-green"
              />
              Private Rooms
            </label>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 bg-masters-green text-deep-black font-medium hover:bg-masters-green/90 transition-colors text-sm">
              Apply Filters
            </button>
            <button
              type="button"
              onClick={() => router.push("/search")}
              className="px-4 py-2 border border-default text-muted hover:border-masters-green hover:text-cream transition-colors text-sm"
            >
              Reset All
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
