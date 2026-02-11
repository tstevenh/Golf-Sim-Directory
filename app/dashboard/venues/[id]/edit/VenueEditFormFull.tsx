"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Venue } from "@/lib/supabase";
import { Save, X } from "lucide-react";

interface VenueEditFormProps {
  venue: Venue;
}

export function VenueEditForm({ venue }: VenueEditFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state - ALL FIELDS
  const [formData, setFormData] = useState({
    // Basic
    name: venue.name,
    brandName: venue.brandName || "",
    venueType: venue.venueType,
    shortDescription: venue.shortDescription || "",
    about: venue.about || "",

    // Location
    address: venue.address,
    city: venue.city,
    state: venue.state,
    zipCode: venue.zipCode,

    // Contact
    phone: venue.phone || "",
    email: venue.email || "",
    website: venue.website || "",
    bookingUrl: venue.bookingUrl || "",
    googleMapsUrl: venue.googleMapsUrl || "",

    // Tech
    launchMonitorType: venue.launchMonitorType,
    ballTracking: venue.ballTracking || false,
    clubTracking: venue.clubTracking || false,
    puttingMode: venue.puttingMode || "",
    leftyFriendly: venue.leftyFriendly,

    // Facility
    bayCount: venue.bayCount?.toString() || "",
    hasPrivateRooms: venue.hasPrivateRooms,
    privateRoomsCount: venue.privateRoomsCount?.toString() || "",
    maxGroupSizePerBay: venue.maxGroupSizePerBay?.toString() || "",

    // Pricing
    pricingModel: venue.pricingModel,
    priceRangeMin: venue.priceRangeMin?.toString() || "",
    priceRangeMax: venue.priceRangeMax?.toString() || "",

    // Amenities
    parking: venue.parking,
    wifi: venue.wifi || false,
    kidFriendly: venue.kidFriendly || false,
    coachingAvailable: venue.coachingAvailable,
    walkInsAllowed: venue.walkInsAllowed !== false,

    // Hours
    hours: venue.hours || "",

    // Media
    heroImage: venue.heroImage || "",

    // SEO
    metaTitle: venue.metaTitle || "",
    metaDescription: venue.metaDescription || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSaving(true);

    try {
      const res = await fetch(`/api/venues/${venue.id}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          brandName: formData.brandName || null,
          venueType: formData.venueType,
          shortDescription: formData.shortDescription || null,
          about: formData.about || null,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          phone: formData.phone || null,
          email: formData.email || null,
          website: formData.website || null,
          bookingUrl: formData.bookingUrl || null,
          googleMapsUrl: formData.googleMapsUrl || null,
          launchMonitorType: formData.launchMonitorType,
          ballTracking: formData.ballTracking,
          clubTracking: formData.clubTracking,
          puttingMode: formData.puttingMode || null,
          leftyFriendly: formData.leftyFriendly,
          bayCount: formData.bayCount ? parseInt(formData.bayCount) : null,
          hasPrivateRooms: formData.hasPrivateRooms,
          privateRoomsCount: formData.privateRoomsCount ? parseInt(formData.privateRoomsCount) : null,
          maxGroupSizePerBay: formData.maxGroupSizePerBay ? parseInt(formData.maxGroupSizePerBay) : null,
          pricingModel: formData.pricingModel,
          priceRangeMin: formData.priceRangeMin ? parseInt(formData.priceRangeMin) : null,
          priceRangeMax: formData.priceRangeMax ? parseInt(formData.priceRangeMax) : null,
          parking: formData.parking,
          wifi: formData.wifi,
          kidFriendly: formData.kidFriendly,
          coachingAvailable: formData.coachingAvailable,
          walkInsAllowed: formData.walkInsAllowed,
          hours: formData.hours || null,
          heroImage: formData.heroImage || null,
          metaTitle: formData.metaTitle || null,
          metaDescription: formData.metaDescription || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || "Failed to update venue");
      }
    } catch (err) {
      console.error("Error updating venue:", err);
      setError("Failed to update venue. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-masters-green/20 border border-masters-green text-masters-green">
          ✓ Venue updated successfully!
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 text-red-400">
          {error}
        </div>
      )}

      {/* 1. Basic Information */}
      <div className="border border-default bg-charcoal p-6">
        <h2 className="text-cream mb-6 text-xl font-semibold">Basic Information</h2>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-cream text-sm font-medium mb-2">
                Venue Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-cream text-sm font-medium mb-2">
                Brand Name
              </label>
              <input
                type="text"
                name="brandName"
                value={formData.brandName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-cream text-sm font-medium mb-2">
              Venue Type *
            </label>
            <select
              name="venueType"
              value={formData.venueType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            >
              <option value="sim_bar">Simulator Bar</option>
              <option value="training_studio">Training Studio</option>
              <option value="private_rental">Private Rental</option>
              <option value="retail_fitting_center">Retail / Fitting Center</option>
              <option value="country_club">Country Club</option>
              <option value="multi_sport_sim">Multi-Sport Simulator</option>
              <option value="hotel_resort">Hotel / Resort</option>
              <option value="indoor_golf_center">Indoor Golf Center</option>
              <option value="entertainment_venue">Entertainment Venue</option>
              <option value="golf_performance_center">Golf Performance Center</option>
              <option value="bar">Bar with Simulators</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-cream text-sm font-medium mb-2">
              Short Description (max 500 chars)
            </label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              maxLength={500}
              rows={2}
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-cream text-sm font-medium mb-2">
              About
            </label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Location */}
      <div className="border border-default bg-charcoal p-6">
        <h2 className="text-cream mb-6 text-xl font-semibold">Location</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-cream text-sm font-medium mb-2">
              Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-cream text-sm font-medium mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-cream text-sm font-medium mb-2">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                maxLength={2}
                className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-cream text-sm font-medium mb-2">
                ZIP Code *
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Contact Information */}
      <div className="border border-default bg-charcoal p-6">
        <h2 className="text-cream mb-6 text-xl font-semibold">Contact Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-cream text-sm font-medium mb-2">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-cream text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-cream text-sm font-medium mb-2">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://"
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-cream text-sm font-medium mb-2">
              Booking URL
            </label>
            <input
              type="url"
              name="bookingUrl"
              value={formData.bookingUrl}
              onChange={handleChange}
              placeholder="https://"
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-cream text-sm font-medium mb-2">
              Google Maps URL
            </label>
            <input
              type="url"
              name="googleMapsUrl"
              value={formData.googleMapsUrl}
              onChange={handleChange}
              placeholder="https://maps.google.com/..."
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Technology */}
      <div className="border border-default bg-charcoal p-6">
        <h2 className="text-cream mb-6 text-xl font-semibold">Technology</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-cream text-sm font-medium mb-2">
              Launch Monitor Type
            </label>
            <select
              name="launchMonitorType"
              value={formData.launchMonitorType}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            >
              <option value="unknown">Unknown</option>
              <option value="radar">Radar</option>
              <option value="photometric_camera">Photometric Camera</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-cream text-sm font-medium mb-2">
                Putting Mode
              </label>
              <input
                type="text"
                name="puttingMode"
                value={formData.puttingMode}
                onChange={handleChange}
                placeholder="e.g., real_putting_surface, auto_putt"
                className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="ballTracking"
                checked={formData.ballTracking}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <span className="text-cream">Ball Tracking</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="clubTracking"
                checked={formData.clubTracking}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <span className="text-cream">Club Tracking</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="leftyFriendly"
                checked={formData.leftyFriendly}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <span className="text-cream">Lefty Friendly</span>
            </label>
          </div>
        </div>
      </div>

      {/* 5. Facility Details */}
      <div className="border border-default bg-charcoal p-6">
        <h2 className="text-cream mb-6 text-xl font-semibold">Facility Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-cream text-sm font-medium mb-2">
              Number of Bays
            </label>
            <input
              type="number"
              name="bayCount"
              value={formData.bayCount}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-cream text-sm font-medium mb-2">
              Max Group Size Per Bay
            </label>
            <input
              type="number"
              name="maxGroupSizePerBay"
              value={formData.maxGroupSizePerBay}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="hasPrivateRooms"
                checked={formData.hasPrivateRooms}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <span className="text-cream">Has Private Rooms</span>
            </label>
          </div>

          {formData.hasPrivateRooms && (
            <div>
              <label className="block text-cream text-sm font-medium mb-2">
                Number of Private Rooms
              </label>
              <input
                type="number"
                name="privateRoomsCount"
                value={formData.privateRoomsCount}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-cream text-sm font-medium mb-2">
              Hours
            </label>
            <input
              type="text"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              placeholder="Mon-Fri: 9am-10pm, Sat-Sun: 8am-11pm"
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 6. Pricing */}
      <div className="border border-default bg-charcoal p-6">
        <h2 className="text-cream mb-6 text-xl font-semibold">Pricing</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-cream text-sm font-medium mb-2">
              Pricing Model
            </label>
            <select
              name="pricingModel"
              value={formData.pricingModel}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            >
              <option value="unknown">Unknown</option>
              <option value="per_bay_hour">Per Bay / Hour</option>
              <option value="per_person_hour">Per Person / Hour</option>
              <option value="package">Package</option>
              <option value="membership_only">Membership Only</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-cream text-sm font-medium mb-2">
                Min Price ($/hour)
              </label>
              <input
                type="number"
                name="priceRangeMin"
                value={formData.priceRangeMin}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-cream text-sm font-medium mb-2">
                Max Price ($/hour)
              </label>
              <input
                type="number"
                name="priceRangeMax"
                value={formData.priceRangeMax}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 7. Amenities */}
      <div className="border border-default bg-charcoal p-6">
        <h2 className="text-cream mb-6 text-xl font-semibold">Amenities</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-cream text-sm font-medium mb-2">
              Parking
            </label>
            <select
              name="parking"
              value={formData.parking}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            >
              <option value="unknown">Unknown</option>
              <option value="free_lot">Free Lot</option>
              <option value="paid_lot">Paid Lot</option>
              <option value="street">Street</option>
              <option value="garage">Garage</option>
              <option value="valet">Valet</option>
              <option value="none">None</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="wifi"
                checked={formData.wifi}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <span className="text-cream">WiFi Available</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="kidFriendly"
                checked={formData.kidFriendly}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <span className="text-cream">Kid Friendly</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="coachingAvailable"
                checked={formData.coachingAvailable}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <span className="text-cream">Coaching Available</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="walkInsAllowed"
                checked={formData.walkInsAllowed}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <span className="text-cream">Walk-ins Allowed</span>
            </label>
          </div>
        </div>
      </div>

      {/* 8. Media */}
      <div className="border border-default bg-charcoal p-6">
        <h2 className="text-cream mb-6 text-xl font-semibold">Media</h2>
        <div>
          <label className="block text-cream text-sm font-medium mb-2">
            Hero Image URL
          </label>
          <input
            type="url"
            name="heroImage"
            value={formData.heroImage}
            onChange={handleChange}
            placeholder="https://"
            className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
          />
        </div>
      </div>

      {/* 9. SEO */}
      <div className="border border-default bg-charcoal p-6">
        <h2 className="text-cream mb-6 text-xl font-semibold">SEO (Optional)</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-cream text-sm font-medium mb-2">
              Meta Title
            </label>
            <input
              type="text"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              maxLength={60}
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-cream text-sm font-medium mb-2">
              Meta Description
            </label>
            <textarea
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              maxLength={160}
              rows={2}
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 bg-masters-green text-deep-black font-medium hover:bg-masters-green/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 border border-default text-cream hover:border-masters-green transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>

      <p className="text-xs text-muted">
        * Required fields. Note: Ratings cannot be edited and are managed by admin.
      </p>
    </form>
  );
}
