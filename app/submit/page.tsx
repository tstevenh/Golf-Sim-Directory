"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle, Building2, MapPin, DollarSign, Info } from "lucide-react";

export default function SubmitVenuePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    website: "",
    email: "",
    venueType: "",
    simulatorSystem: "",
    priceRangeMin: "",
    priceRangeMax: "",
    about: "",
    submitterEmail: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
      
      <div className="relative z-10 max-w-3xl mx-auto px-4">
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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-masters-green" />
                <h2 className="text-cream">Basic Information</h2>
              </div>
              
              <div className="space-y-4">
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
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                    />
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
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-default" />

            {/* Contact */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-masters-green" />
                <h2 className="text-cream">Contact Information</h2>
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
              </div>
            </section>

            <div className="border-t border-default" />

            {/* Venue Details */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-masters-green" />
                <h2 className="text-cream">Venue Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Venue Type
                  </label>
                  <select
                    value={formData.venueType}
                    onChange={(e) => setFormData({ ...formData, venueType: e.target.value })}
                    className="w-full px-4 py-3 bg-charcoal border border-default text-cream focus:outline-none focus:border-masters-green transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select type...</option>
                    <option value="sim_bar">Simulator Bar</option>
                    <option value="training_studio">Training Studio</option>
                    <option value="private_rental">Private Rental</option>
                    <option value="retail_fitting_center">Retail/Fitting Center</option>
                    <option value="country_club">Country Club</option>
                    <option value="multi_sport_sim">Multi-Sport Simulator</option>
                    <option value="hotel_resort">Hotel/Resort</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream mb-2">
                    Simulator System
                  </label>
                  <select
                    value={formData.simulatorSystem}
                    onChange={(e) => setFormData({ ...formData, simulatorSystem: e.target.value })}
                    className="w-full px-4 py-3 bg-charcoal border border-default text-cream focus:outline-none focus:border-masters-green transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select system...</option>
                    <option value="Trackman">Trackman</option>
                    <option value="Golfzon">Golfzon</option>
                    <option value="GCQuad">GCQuad / Foresight</option>
                    <option value="Uneekor">Uneekor</option>
                    <option value="SkyTrak">SkyTrak</option>
                    <option value="Mevo+">Mevo+</option>
                    <option value="AboutGolf">AboutGolf</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </section>

            <div className="border-t border-default" />

            {/* Pricing */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-masters-green" />
                <h2 className="text-cream">Pricing</h2>
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
            </section>

            <div className="border-t border-default" />

            {/* Description */}
            <section>
              <label className="block text-sm font-medium text-cream mb-2">
                About the Venue
              </label>
              <textarea
                rows={4}
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                className="w-full px-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors resize-none"
                placeholder="Describe the venue, simulators, atmosphere, etc."
              />
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
