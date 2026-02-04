"use client";

import { Venue, SessionUser } from "@/types";
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  DollarSign,
  Users,
  Star,
  Heart,
  Flag,
  Check,
  Monitor,
  ArrowRight,
  Wifi,
  Car,
  Baby,
  GraduationCap,
  Utensils,
  Accessibility,
  Info,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface VenueDetailProps {
  venue: Venue;
  isFavorited: boolean;
  user?: SessionUser;
}

const LAUNCH_MONITOR_LABELS: Record<string, string> = {
  radar: "Radar Technology",
  photometric_camera: "Camera-Based",
  hybrid: "Hybrid System",
  unknown: "Standard Launch Monitor",
};

const PARKING_LABELS: Record<string, string> = {
  free_lot: "Free Parking Lot",
  paid_lot: "Paid Parking Lot",
  street: "Street Parking",
  garage: "Parking Garage",
  valet: "Valet Parking",
  unknown: "Parking Available",
};

export function VenueDetail({
  venue,
  isFavorited: initialFavorited,
  user,
}: VenueDetailProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);

  const toggleFavorite = async () => {
    if (!user) {
      window.location.href = "/login?redirect=/venue/" + venue.slug;
      return;
    }

    try {
      const res = await fetch(`/api/venues/${venue.id}/favorite`, {
        method: "POST",
      });
      if (res.ok) {
        setIsFavorited(!isFavorited);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const getSimulatorDisplay = () => {
    if (!venue.simulatorSystems) return null;
    try {
      if (Array.isArray(venue.simulatorSystems)) {
        return venue.simulatorSystems.join(", ");
      }
      return null;
    } catch {
      return null;
    }
  };

  const getFoodAndDrink = () => {
    if (!venue.foodAndDrink) return null;
    try {
      return venue.foodAndDrink as {
        food?: boolean;
        alcohol?: boolean;
        notes?: string;
      };
    } catch {
      return null;
    }
  };

  const getWhyGolfersLikeIt = () => {
    if (!venue.whyGolfersLikeIt) return null;
    try {
      return venue.whyGolfersLikeIt as string[];
    } catch {
      return null;
    }
  };

  const foodAndDrink = getFoodAndDrink();
  const whyGolfersLikeIt = getWhyGolfersLikeIt();

  return (
    <div className="py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="mb-2 text-cream">{venue.name}</h1>
            <div className="flex items-center gap-2 text-muted">
              <MapPin className="w-4 h-4" />
              <span>
                {venue.address}, {venue.city}, {venue.state} {venue.zipCode}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleFavorite}
              className={`flex items-center gap-2 px-4 py-2 border transition-colors ${
                isFavorited
                  ? "bg-sunday-red/10 border-sunday-red text-sunday-red"
                  : "border-default text-muted hover:border-masters-green hover:text-cream"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`}
              />
              {isFavorited ? "Saved" : "Save"}
            </button>

            <Link
              href={`/venue/us/${venue.state.toLowerCase()}/${venue.city.toLowerCase().replace(/\s+/g, "-")}/${venue.slug}/report`}
              className="flex items-center gap-2 px-4 py-2 border border-default text-muted hover:border-masters-green hover:text-cream transition-colors"
            >
              <Flag className="w-5 h-5" />
              Report
            </Link>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {venue.claimed && (
            <span className="px-3 py-1 bg-masters-green-subtle text-masters-green text-sm">
              <Check className="w-3 h-3 inline mr-1" /> Verified Listing
            </span>
          )}
          {venue.featured && (
            <span className="px-3 py-1 bg-muted-gold/20 text-muted-gold text-sm">
              <Star className="w-3 h-3 inline mr-1" /> Featured
            </span>
          )}
          {venue.venueType && (
            <span className="px-3 py-1 border border-default text-cream-subtle text-sm capitalize">
              {venue.venueType.replace(/_/g, " ")}
            </span>
          )}
          {venue.vibeTags?.map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 border border-default text-cream-subtle text-sm capitalize"
            >
              {tag.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="aspect-video bg-slate overflow-hidden">
              {venue.heroImage ? (
                <img
                  src={venue.heroImage}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <MapPin className="w-20 h-20 text-muted" />
                </div>
              )}
            </div>

            {/* About */}
            {venue.about && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-px bg-masters-green" />
                  <h2 className="text-cream">About</h2>
                </div>
                <p className="text-muted leading-relaxed whitespace-pre-line">
                  {venue.about}
                </p>
              </section>
            )}

            {/* Tags */}
            {venue.tags && venue.tags.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-px bg-masters-green" />
                  <h2 className="text-cream">Features</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {venue.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-slate text-cream-subtle text-sm capitalize"
                    >
                      {tag.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Simulator Technology */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-masters-green" />
                <h2 className="text-cream">Technology</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Simulator Systems */}
                {getSimulatorDisplay() && (
                  <div className="p-4 border border-default bg-charcoal">
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="w-4 h-4 text-masters-green" />
                      <span className="text-cream font-medium">
                        Simulator Systems
                      </span>
                    </div>
                    <p className="text-muted text-sm">
                      {getSimulatorDisplay()}
                    </p>
                  </div>
                )}

                {/* Launch Monitor Type */}
                {venue.launchMonitorType && (
                  <div className="p-4 border border-default bg-charcoal">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-masters-green" />
                      <span className="text-cream font-medium">
                        Launch Monitor
                      </span>
                    </div>
                    <p className="text-muted text-sm">
                      {LAUNCH_MONITOR_LABELS[venue.launchMonitorType] ||
                        venue.launchMonitorType}
                    </p>
                  </div>
                )}

                {/* Ball Tracking */}
                {venue.ballTracking && (
                  <div className="p-4 border border-default bg-charcoal">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-masters-green" />
                      <span className="text-cream font-medium">
                        Ball Tracking
                      </span>
                    </div>
                    <p className="text-muted text-sm">
                      Full ball flight tracking enabled
                    </p>
                  </div>
                )}

                {/* Club Tracking */}
                {venue.clubTracking && (
                  <div className="p-4 border border-default bg-charcoal">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-masters-green" />
                      <span className="text-cream font-medium">
                        Club Tracking
                      </span>
                    </div>
                    <p className="text-muted text-sm">
                      Club path and face angle data
                    </p>
                  </div>
                )}

                {/* Putting Mode */}
                {venue.puttingMode && (
                  <div className="p-4 border border-default bg-charcoal">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-masters-green" />
                      <span className="text-cream font-medium">Putting</span>
                    </div>
                    <p className="text-muted text-sm capitalize">
                      {venue.puttingMode.replace(/_/g, " ")}
                    </p>
                  </div>
                )}

                {/* Lefty Friendly */}
                {venue.leftyFriendly && (
                  <div className="p-4 border border-default bg-charcoal">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-masters-green" />
                      <span className="text-cream font-medium">
                        Left-Handed Friendly
                      </span>
                    </div>
                    <p className="text-muted text-sm">
                      Accommodates left-handed golfers
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Why Golfers Like It */}
            {whyGolfersLikeIt && whyGolfersLikeIt.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-px bg-masters-green" />
                  <h2 className="text-cream">Why Golfers Like It</h2>
                </div>
                <ul className="space-y-2">
                  {whyGolfersLikeIt.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-masters-green mt-1 flex-shrink-0" />
                      <span className="text-muted">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Amenities Grid */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-masters-green" />
                <h2 className="text-cream">Amenities</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {venue.coachingAvailable && (
                  <div className="flex items-center gap-2 text-muted">
                    <GraduationCap className="w-4 h-4 text-masters-green" />{" "}
                    Coaching Available
                  </div>
                )}
                {venue.kidFriendly && (
                  <div className="flex items-center gap-2 text-muted">
                    <Baby className="w-4 h-4 text-masters-green" /> Kid Friendly
                  </div>
                )}
                {venue.wifi && (
                  <div className="flex items-center gap-2 text-muted">
                    <Wifi className="w-4 h-4 text-masters-green" /> Free WiFi
                  </div>
                )}
                {venue.hasPrivateRooms && (
                  <div className="flex items-center gap-2 text-muted">
                    <Check className="w-4 h-4 text-masters-green" /> Private
                    Rooms
                  </div>
                )}
                {venue.walkInsAllowed ? (
                  <div className="flex items-center gap-2 text-muted">
                    <Check className="w-4 h-4 text-masters-green" /> Walk-ins
                    Welcome
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted">
                    <Info className="w-4 h-4 text-sunday-red" /> Reservations
                    Required
                  </div>
                )}
                {foodAndDrink?.food && (
                  <div className="flex items-center gap-2 text-muted">
                    <Utensils className="w-4 h-4 text-masters-green" /> Food
                    Available
                  </div>
                )}
                {foodAndDrink?.alcohol && (
                  <div className="flex items-center gap-2 text-muted">
                    <Check className="w-4 h-4 text-masters-green" /> Full Bar
                  </div>
                )}
                {venue.parking && venue.parking !== "unknown" && (
                  <div className="flex items-center gap-2 text-muted">
                    <Car className="w-4 h-4 text-masters-green" />
                    {PARKING_LABELS[venue.parking] || venue.parking}
                  </div>
                )}
                {venue.accessibility && venue.accessibility.length > 0 && (
                  <div className="flex items-center gap-2 text-muted">
                    <Accessibility className="w-4 h-4 text-masters-green" />
                    Accessible
                  </div>
                )}
              </div>

              {/* Food & Drink Notes */}
              {foodAndDrink?.notes && (
                <div className="mt-4 p-4 bg-slate/50 border border-default">
                  <p className="text-sm text-muted">
                    <span className="text-cream font-medium">
                      Food & Drink:
                    </span>{" "}
                    {foodAndDrink.notes}
                  </p>
                </div>
              )}
            </section>

            {/* Accessibility Details */}
            {venue.accessibility && venue.accessibility.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-px bg-masters-green" />
                  <h2 className="text-cream">Accessibility</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {venue.accessibility.map((item: string) => (
                    <span
                      key={item}
                      className="px-3 py-1 border border-default text-cream-subtle text-sm capitalize"
                    >
                      {item.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking CTA */}
            <div className="border border-masters-green p-6 bg-masters-green/5">
              <h3 className="mb-4 text-cream">Book a Bay</h3>
              {venue.bookingUrl ? (
                <a
                  href={venue.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center"
                >
                  <span>Book Online</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              ) : venue.website ? (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center"
                >
                  <span>Visit Website</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              ) : (
                <button
                  disabled
                  className="w-full py-3 px-4 bg-slate text-muted font-medium cursor-not-allowed"
                >
                  No Booking Link
                </button>
              )}
            </div>

            {/* Contact Info */}
            <div className="border border-default p-6 bg-charcoal">
              <h3 className="mb-4 text-cream">Contact</h3>
              <div className="space-y-3">
                {venue.phone && (
                  <a
                    href={`tel:${venue.phone}`}
                    className="flex items-center gap-3 text-muted hover:text-masters-green transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    {venue.phone}
                  </a>
                )}
                {venue.website && (
                  <a
                    href={venue.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-muted hover:text-masters-green transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                    Website
                  </a>
                )}
                {venue.email && (
                  <a
                    href={`mailto:${venue.email}`}
                    className="flex items-center gap-3 text-muted hover:text-masters-green transition-colors"
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-masters-green">
                      @
                    </span>
                    Email
                  </a>
                )}
              </div>
            </div>

            {/* Pricing */}
            {(venue.priceRangeMin || venue.priceRangeMax) && (
              <div className="border border-default p-6 bg-charcoal">
                <h3 className="mb-4 text-cream flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-masters-green" />
                  Pricing
                </h3>
                <div className="flex items-center gap-2 text-cream">
                  <span className="font-mono font-bold text-2xl">
                    ${venue.priceRangeMin || "?"}
                    {venue.priceRangeMax &&
                    venue.priceRangeMax !== venue.priceRangeMin
                      ? `-$${venue.priceRangeMax}`
                      : ""}
                  </span>
                  <span className="text-muted">/hour</span>
                </div>
                <p className="text-sm text-muted mt-2 capitalize">
                  {venue.pricingModel?.replace(/_/g, " ")}
                </p>
              </div>
            )}

            {/* Facility Info */}
            <div className="border border-default p-6 bg-charcoal">
              <h3 className="mb-4 text-cream flex items-center gap-2">
                <Users className="w-5 h-5 text-masters-green" />
                Facility
              </h3>
              <div className="space-y-3 text-muted">
                {venue.bayCount && (
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-masters-green" />
                    {venue.bayCount} simulator bays
                  </div>
                )}
                {venue.privateRoomsCount && (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-masters-green" />
                    {venue.privateRoomsCount} private rooms
                  </div>
                )}
                {venue.maxGroupSizePerBay && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-masters-green" />
                    Up to {venue.maxGroupSizePerBay} per bay
                  </div>
                )}
              </div>
            </div>

            {/* Hours */}
            {venue.hours && (
              <div className="border border-default p-6 bg-charcoal">
                <h3 className="mb-4 text-cream flex items-center gap-2">
                  <Clock className="w-5 h-5 text-masters-green" />
                  Hours
                </h3>
                <div className="space-y-2 text-sm">
                  {venue.hours.split("|").map((day: string) => {
                    const [dayName, hours] = day.split(":");
                    return (
                      <div
                        key={dayName}
                        className="flex justify-between text-muted"
                      >
                        <span className="capitalize">{dayName}</span>
                        <span
                          className={
                            hours === "00:00-00:00"
                              ? "text-sunday-red"
                              : "text-cream"
                          }
                        >
                          {hours === "00:00-00:00" ? "Closed" : hours}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ratings */}
            {venue.ratingOverall && (
              <div className="border border-default p-6 bg-charcoal">
                <h3 className="mb-4 text-cream flex items-center gap-2">
                  <Star className="w-5 h-5 text-masters-green" />
                  Ratings
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted text-sm">Overall</span>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-masters-green text-masters-green" />
                      <span className="text-cream font-mono">
                        {venue.ratingOverall.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  {venue.ratingTechQuality && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted text-sm">Technology</span>
                      <span className="text-cream-subtle font-mono">
                        {venue.ratingTechQuality.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {venue.ratingFacilityComfort && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted text-sm">Comfort</span>
                      <span className="text-cream-subtle font-mono">
                        {venue.ratingFacilityComfort.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {venue.ratingValueForMoney && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted text-sm">Value</span>
                      <span className="text-cream-subtle font-mono">
                        {venue.ratingValueForMoney.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
