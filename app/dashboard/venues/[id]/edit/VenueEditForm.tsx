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

  // Form state
  const [formData, setFormData] = useState({
    name: venue.name,
    brandName: venue.brandName || "",
    address: venue.address,
    city: venue.city,
    state: venue.state,
    zipCode: venue.zipCode,
    phone: venue.phone || "",
    email: venue.email || "",
    website: venue.website || "",
    bookingUrl: venue.bookingUrl || "",
    about: venue.about || "",
    hours: venue.hours || "",
    bayCount: venue.bayCount?.toString() || "",
    priceRangeMin: venue.priceRangeMin?.toString() || "",
    priceRangeMax: venue.priceRangeMax?.toString() || "",
    heroImage: venue.heroImage || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          phone: formData.phone || null,
          email: formData.email || null,
          website: formData.website || null,
          bookingUrl: formData.bookingUrl || null,
          about: formData.about || null,
          hours: formData.hours || null,
          bayCount: formData.bayCount ? parseInt(formData.bayCount) : null,
          priceRangeMin: formData.priceRangeMin ? parseInt(formData.priceRangeMin) : null,
          priceRangeMax: formData.priceRangeMax ? parseInt(formData.priceRangeMax) : null,
          heroImage: formData.heroImage || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Refresh the page data
        router.refresh();
        // Clear success message after 3 seconds
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
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-masters-green/20 border border-masters-green text-masters-green">
          ✓ Venue updated successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 text-red-400">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="border border-default bg-charcoal p-6">
        <h2 className="text-cream mb-6 text-xl font-semibold">Basic Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-cream text-sm font-medium mb-2">
              Venue Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="brandName" className="block text-cream text-sm font-medium mb-2">
              Brand Name
            </label>
            <input
              type="text"
              id="brandName"
              name="brandName"
              value={formData.brandName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="about" className="block text-cream text-sm font-medium mb-2">
              About
            </label>
            <textarea
              id="about"
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="border border-default bg-charcoal p-6">
        <h2 className="text-cream mb-6 text-xl font-semibold">Location</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-cream text-sm font-medium mb-2">
              Address *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-cream text-sm font-medium mb-2">
              City *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-cream text-sm font-medium mb-2">
              State *
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              maxLength={2}
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none uppercase"
            />
          </div>

          <div>
            <label htmlFor="zipCode" className="block text-cream text-sm font-medium mb-2">
              ZIP Code *
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="border border-default bg-charcoal p-6">
        <h2 className="text-cream mb-6 text-xl font-semibold">Contact Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-cream text-sm font-medium mb-2">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-cream text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-cream text-sm font-medium mb-2">
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://"
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="bookingUrl" className="block text-cream text-sm font-medium mb-2">
              Booking URL
            </label>
            <input
              type="url"
              id="bookingUrl"
              name="bookingUrl"
              value={formData.bookingUrl}
              onChange={handleChange}
              placeholder="https://"
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Facility Details */}
      <div className="border border-default bg-charcoal p-6">
        <h2 className="text-cream mb-6 text-xl font-semibold">Facility Details</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="bayCount" className="block text-cream text-sm font-medium mb-2">
              Number of Bays
            </label>
            <input
              type="number"
              id="bayCount"
              name="bayCount"
              value={formData.bayCount}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="hours" className="block text-cream text-sm font-medium mb-2">
              Hours
            </label>
            <input
              type="text"
              id="hours"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              placeholder="Mon-Fri: 9am-10pm"
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="border border-default bg-charcoal p-6">
        <h2 className="text-cream mb-6 text-xl font-semibold">Pricing</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="priceRangeMin" className="block text-cream text-sm font-medium mb-2">
              Min Price ($/hour)
            </label>
            <input
              type="number"
              id="priceRangeMin"
              name="priceRangeMin"
              value={formData.priceRangeMin}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="priceRangeMax" className="block text-cream text-sm font-medium mb-2">
              Max Price ($/hour)
            </label>
            <input
              type="number"
              id="priceRangeMax"
              name="priceRangeMax"
              value={formData.priceRangeMax}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="border border-default bg-charcoal p-6">
        <h2 className="text-cream mb-6 text-xl font-semibold">Media</h2>
        <div>
          <label htmlFor="heroImage" className="block text-cream text-sm font-medium mb-2">
            Hero Image URL
          </label>
          <input
            type="url"
            id="heroImage"
            name="heroImage"
            value={formData.heroImage}
            onChange={handleChange}
            placeholder="https://"
            className="w-full px-4 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
          />
          <p className="text-xs text-muted mt-1">
            Enter a URL to an image (JPG, PNG, WebP)
          </p>
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
