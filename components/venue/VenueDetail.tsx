"use client";
/* eslint-disable @next/next/no-img-element */

import { Venue, SessionUser } from "@/types";
import { getStateSlug } from "@/lib/states";
import { getVenueHref } from "@/lib/venue-url";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { ClaimVenueModal } from "@/components/venue/ClaimVenueModal";
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
  HelpCircle,
  List,
  Cpu,
  Calendar,
  Award,
  Map,
  Navigation,
  ExternalLink,
  Mail,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { VenueCard, VenueGrid } from "./VenueCard";
import { VenueBestByLinks } from "./VenueBestByLinks";

interface VenueDetailProps {
  venue: Venue;
  isFavorited: boolean;
  user?: SessionUser;
  nearbyScope?: "city" | "state";
  nearbyVenues?: {
    id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    heroImage: string | null;
    venueType: string;
    simulatorSystems?: string[] | null;
    launchMonitorType?: string | null;
    priceRangeMin?: number | null;
    priceRangeMax?: number | null;
    ratingOverall: number | null;
    featured?: boolean;
    tags?: string[] | null;
  }[];
}

const LAUNCH_MONITOR_LABELS: Record<string, string> = {
  radar: "Radar Technology",
  photometric_camera: "Camera-Based",
  hybrid: "Hybrid System",
  unknown: "Standard Launch Monitor",
};

const VENUE_TYPE_LABELS: Record<string, string> = {
  sim_bar: "Simulator Bar",
  training_studio: "Training Studio",
  private_rental: "Private Rental",
  retail_fitting_center: "Retail / Fitting Center",
  country_club: "Country Club",
  multi_sport_sim: "Multi-Sport Simulator",
  hotel_resort: "Hotel / Resort",
  indoor_golf_center: "Indoor Golf Center",
  entertainment_venue: "Entertainment Venue",
  golf_performance_center: "Golf Performance Center",
  bar: "Bar with Simulators",
  other: "Indoor Golf Venue",
};

const PRICING_MODEL_LABELS: Record<string, string> = {
  per_bay_hour: "Per Bay / Hour",
  per_person_hour: "Per Person / Hour",
  package: "Package Pricing",
  membership_only: "Members Only",
  mixed: "Mixed Pricing",
  unknown: "Contact for Pricing",
};

// Format tag to human readable
function formatTag(tag: unknown): string {
  const value = String(tag ?? "");
  return value
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function toStateSlug(state: string | null | undefined): string {
  return state ? getStateSlug(state) : "unknown";
}

function toCitySlug(city: string | null | undefined): string {
  return city ? city.toLowerCase().replace(/\s+/g, "-") : "unknown";
}

export function VenueDetail({
  venue,
  isFavorited: initialFavorited,
  user,
  nearbyScope = "city",
  nearbyVenues = [],
}: VenueDetailProps) {
  const [currentUser, setCurrentUser] = useState<SessionUser | undefined>(user);
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const venuePath = getVenueHref(venue.state, venue.city, venue.slug);
  const loginUrl = `/login?callbackUrl=${encodeURIComponent(venuePath)}`;

  const fetchFavoriteState = useCallback(async () => {
    const res = await fetch(`/api/venues/${venue.id}/favorite`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error("Failed to fetch favorite state");
    }
    return (await res.json()) as {
      authenticated?: boolean;
      favorited?: boolean;
      user?: SessionUser | null;
    };
  }, [venue.id]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateFavoriteState() {
      try {
        const data = await fetchFavoriteState();
        if (cancelled) return;
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(undefined);
        }
        setIsFavorited(Boolean(data.favorited));
      } catch {
        // Keep server-rendered defaults if hydration check fails.
      }
    }

    hydrateFavoriteState();
    return () => {
      cancelled = true;
    };
  }, [fetchFavoriteState]);

  const toggleFavorite = async () => {
    if (!currentUser) {
      try {
        const data = await fetchFavoriteState();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          setIsFavorited(Boolean(data.favorited));
        } else {
          window.location.href = loginUrl;
          return;
        }
      } catch {
        window.location.href = loginUrl;
        return;
      }
    }

    try {
      const res = await fetch(`/api/venues/${venue.id}/favorite`, {
        method: "POST",
      });
      if (res.ok) {
        const data = (await res.json()) as { favorited?: boolean };
        if (typeof data.favorited === "boolean") {
          setIsFavorited(data.favorited);
        } else {
          setIsFavorited(!isFavorited);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleClaim = async () => {
    if (!currentUser) {
      try {
        const data = await fetchFavoriteState();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          setIsFavorited(Boolean(data.favorited));
        } else {
          window.location.href = loginUrl;
          return;
        }
      } catch {
        window.location.href = loginUrl;
        return;
      }
    }
    setShowClaimModal(true);
  };

  const handleClaimSuccess = () => {
    setClaimSuccess(true);
  };

  // Parse JSON fields
  const foodAndDrink = venue.foodAndDrink as {
    food?: boolean;
    alcohol?: boolean;
    notes?: string;
  } | null;

  const whyGolfersLikeIt = venue.whyGolfersLikeIt as string[] | null;

  const comprehensiveData = venue.comprehensiveData as {
    simulatorSoftware?: string[];
    amenitiesList?: string[];
    faq?: { question: string; answer: string }[];
    googleRating?: number;
  } | null;

  const simulatorSystems = venue.simulatorSystems as
    | { brand?: string; model?: string; notes?: string }[]
    | null;

  // OpenStreetMap embed URL
  const mapUrl = venue.latitude && venue.longitude
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${venue.longitude - 0.01}%2C${venue.latitude - 0.01}%2C${venue.longitude + 0.01}%2C${venue.latitude + 0.01}&layer=mapnik&marker=${venue.latitude}%2C${venue.longitude}`
    : null;

  // Google Maps directions URL
  const directionsUrl = venue.latitude && venue.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`
    : venue.googleMapsUrl;

  return (
    <div className="py-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            {/* Venue Type Badge */}
            {venue.venueType && (
              <span className="inline-block px-3 py-1 bg-masters-green/10 text-masters-green text-xs font-mono uppercase tracking-wider mb-3">
                {VENUE_TYPE_LABELS[venue.venueType] || formatTag(venue.venueType)}
              </span>
            )}

            {/* Venue Name - Better mobile wrapping */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-cream mb-3 break-words">
              {venue.name}
            </h1>

            {/* Verified Badge */}
            {venue.claimed && (
              <div className="mb-4">
                <VerifiedBadge size="lg" />
              </div>
            )}

            {/* Location - Better mobile layout */}
            <div className="flex items-start gap-2 text-muted flex-wrap">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="text-sm sm:text-base break-words">
                {venue.address}
                {venue.city && `, ${venue.city}`}
                {venue.state && `, ${venue.state}`}
                {venue.zipCode && ` ${venue.zipCode}`}
              </span>
            </div>
          </div>

          {/* Action Buttons - Desktop: right side, Mobile: full width */}
          <div className="w-full sm:w-auto flex gap-2 flex-shrink-0">
            <button
              onClick={toggleFavorite}
              className={`flex items-center gap-2 px-4 py-2 border transition-colors ${
                isFavorited
                  ? "bg-sunday-red/10 border-sunday-red text-sunday-red"
                  : "border-default text-muted hover:border-masters-green hover:text-cream"
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
              {isFavorited ? "Saved" : "Save"}
            </button>

            <Link
              href={`${venuePath}/report`}
              className="flex items-center gap-2 px-4 py-2 border border-default text-muted hover:border-masters-green hover:text-cream transition-colors"
            >
              <Flag className="w-5 h-5" />
              Report
            </Link>
          </div>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap gap-2">
          {/* Only show verified badge if actually verified */}
          {venue.verificationLevel === "verified" && (
            <span className="px-3 py-1 bg-masters-green text-deep-black text-sm font-medium flex items-center gap-1">
              <Check className="w-3 h-3" /> Verified Listing
            </span>
          )}

          {venue.featured && (
            <span className="px-3 py-1 bg-muted-gold/20 text-muted-gold text-sm flex items-center gap-1">
              <Star className="w-3 h-3" /> Featured
            </span>
          )}

          {/* Vibe Tags */}
          {venue.vibeTags?.map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 border border-default text-cream-subtle text-sm"
            >
              {formatTag(tag)}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
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

            {/* Quick Actions - Mobile Only */}
            <div className="lg:hidden flex flex-wrap gap-3">
              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-masters-green text-deep-black font-medium"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </a>
              )}
              {venue.bookingUrl ? (
                <a
                  href={venue.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 border border-masters-green text-masters-green"
                >
                  <Calendar className="w-4 h-4" />
                  Book Now
                </a>
              ) : venue.website ? (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 border border-masters-green text-masters-green"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Website
                </a>
              ) : null}
            </div>

            {/* Quick Info - Mobile Only (appears after hero image) */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Hours */}
              {venue.hours && (
                <div className="border border-default p-4 bg-charcoal">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-masters-green" />
                    <h3 className="text-cream font-medium text-sm">Hours</h3>
                  </div>
                  <p className="text-xs text-muted">
                    {venue.hours.split("|")[0]?.split(":")[1] || "See details"}
                  </p>
                </div>
              )}

              {/* Price Range */}
              {(venue.priceRangeMin || venue.priceRangeMax) && (
                <div className="border border-default p-4 bg-charcoal">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-masters-green" />
                    <h3 className="text-cream font-medium text-sm">Pricing</h3>
                  </div>
                  <p className="text-xs text-muted">
                    {venue.priceRangeMin && venue.priceRangeMax
                      ? `$${venue.priceRangeMin}-$${venue.priceRangeMax}/hr`
                      : venue.priceRangeMin
                      ? `From $${venue.priceRangeMin}/hr`
                      : `Up to $${venue.priceRangeMax}/hr`}
                  </p>
                </div>
              )}

              {/* Contact */}
              {(venue.phone || venue.website) && (
                <div className="border border-default p-4 bg-charcoal sm:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-masters-green" />
                    <h3 className="text-cream font-medium text-sm">Contact</h3>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {venue.phone && (
                      <a href={`tel:${venue.phone}`} className="text-muted hover:text-masters-green">
                        {venue.phone}
                      </a>
                    )}
                    {venue.website && (
                      <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-masters-green">
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* About Section */}
            {venue.about && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-5 h-5 text-masters-green" />
                  <h2 className="text-xl font-semibold text-cream">About</h2>
                </div>
                <p className="text-muted leading-relaxed whitespace-pre-line">
                  {venue.about}
                </p>
              </section>
            )}

            {/* Target Audience - Who It's For */}
            {venue.whoItsFor && venue.whoItsFor.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-masters-green" />
                  <h2 className="text-xl font-semibold text-cream">Perfect For</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {venue.whoItsFor.map((audience: string) => (
                    <span
                      key={audience}
                      className="px-4 py-2 bg-charcoal border border-default text-cream"
                    >
                      {formatTag(audience)}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Why Golfers Like It */}
            {whyGolfersLikeIt && whyGolfersLikeIt.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-5 h-5 text-masters-green" />
                  <h2 className="text-xl font-semibold text-cream">Why Golfers Like It</h2>
                </div>
                <ul className="space-y-3">
                  {whyGolfersLikeIt.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-masters-green mt-0.5 flex-shrink-0" />
                      <span className="text-muted">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Technology Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Monitor className="w-5 h-5 text-masters-green" />
                <h2 className="text-xl font-semibold text-cream">Technology</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Simulator Systems */}
                {simulatorSystems && simulatorSystems.length > 0 && (
                  <div className="p-4 border border-default bg-charcoal">
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="w-4 h-4 text-masters-green" />
                      <span className="text-cream font-medium">Simulator Hardware</span>
                    </div>
                    <div className="space-y-1">
                      {simulatorSystems.map((system, i) => (
                        <p key={i} className="text-muted text-sm">
                          {system.brand}
                          {system.model && ` ${system.model}`}
                          {system.notes && (
                            <span className="block text-muted/70 text-xs mt-0.5">{system.notes}</span>
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Simulator Software */}
                {comprehensiveData?.simulatorSoftware &&
                  Array.isArray(comprehensiveData.simulatorSoftware) &&
                  comprehensiveData.simulatorSoftware.length > 0 && (
                    <div className="p-4 border border-default bg-charcoal">
                      <div className="flex items-center gap-2 mb-2">
                        <Cpu className="w-4 h-4 text-masters-green" />
                        <span className="text-cream font-medium">Software</span>
                      </div>
                      <p className="text-muted text-sm">
                        {comprehensiveData.simulatorSoftware.join(", ")}
                      </p>
                    </div>
                  )}

                {/* Launch Monitor Type */}
                {venue.launchMonitorType && venue.launchMonitorType !== "unknown" && (
                  <div className="p-4 border border-default bg-charcoal">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-masters-green" />
                      <span className="text-cream font-medium">Launch Monitor</span>
                    </div>
                    <p className="text-muted text-sm">
                      {LAUNCH_MONITOR_LABELS[venue.launchMonitorType] ||
                        formatTag(venue.launchMonitorType)}
                    </p>
                  </div>
                )}

                {/* Ball Tracking */}
                {venue.ballTracking && (
                  <div className="p-4 border border-default bg-charcoal">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-masters-green" />
                      <span className="text-cream font-medium">Ball Tracking</span>
                    </div>
                    <p className="text-muted text-sm">Full ball flight tracking enabled</p>
                  </div>
                )}

                {/* Club Tracking */}
                {venue.clubTracking && (
                  <div className="p-4 border border-default bg-charcoal">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-masters-green" />
                      <span className="text-cream font-medium">Club Tracking</span>
                    </div>
                    <p className="text-muted text-sm">Club path and face angle data</p>
                  </div>
                )}

                {/* Putting Mode */}
                {venue.puttingMode && venue.puttingMode !== "unknown" && (
                  <div className="p-4 border border-default bg-charcoal">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-masters-green" />
                      <span className="text-cream font-medium">Putting</span>
                    </div>
                    <p className="text-muted text-sm capitalize">
                      {formatTag(venue.puttingMode)}
                    </p>
                  </div>
                )}

                {/* Lefty Friendly */}
                {venue.leftyFriendly && (
                  <div className="p-4 border border-default bg-charcoal">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-masters-green" />
                      <span className="text-cream font-medium">Left-Handed Friendly</span>
                    </div>
                    <p className="text-muted text-sm">Accommodates left-handed golfers</p>
                  </div>
                )}
              </div>
            </section>

            {/* Features / Tags */}
            {venue.tags && venue.tags.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <List className="w-5 h-5 text-masters-green" />
                  <h2 className="text-xl font-semibold text-cream">Features</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {venue.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-slate text-cream-subtle text-sm"
                    >
                      {formatTag(tag)}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Amenities List from comprehensiveData */}
            {comprehensiveData?.amenitiesList &&
              Array.isArray(comprehensiveData.amenitiesList) &&
              comprehensiveData.amenitiesList.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <List className="w-5 h-5 text-masters-green" />
                    <h2 className="text-xl font-semibold text-cream">Amenities</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {comprehensiveData.amenitiesList.map((amenity: string) => (
                      <span
                        key={amenity}
                        className="px-3 py-1 bg-charcoal border border-default text-cream-subtle text-sm"
                      >
                        {formatTag(amenity)}
                      </span>
                    ))}
                  </div>
                </section>
              )}

            {/* FAQ Section with Schema */}
            {(() => {
              // Build FAQ items: venue-specific first, then defaults
              const venueFaqs = comprehensiveData?.faq && Array.isArray(comprehensiveData.faq)
                ? comprehensiveData.faq
                : [];
              
              const defaultFaqs = [
                ...(venue.priceRangeMin || venue.priceRangeMax ? [{
                  question: `How much does it cost to play at ${venue.name}?`,
                  answer: `Pricing at ${venue.name} ${venue.priceRangeMin && venue.priceRangeMax 
                    ? `ranges from $${venue.priceRangeMin} to $${venue.priceRangeMax} per hour` 
                    : venue.priceRangeMin ? `starts at $${venue.priceRangeMin} per hour` 
                    : `goes up to $${venue.priceRangeMax} per hour`}. ${
                    venue.pricingModel === "per_bay_hour" ? "Rates are per bay per hour." 
                    : venue.pricingModel === "per_person_hour" ? "Rates are per person per hour." 
                    : "Contact the venue for detailed pricing."
                  }`,
                }] : []),
                ...(!venue.walkInsAllowed ? [{
                  question: `Do I need a reservation at ${venue.name}?`,
                  answer: `Yes, ${venue.name} requires reservations. ${venue.bookingUrl ? "You can book online through their website." : "Contact them directly to schedule your session."}`,
                }] : [{
                  question: `Does ${venue.name} accept walk-ins?`,
                  answer: `Yes, ${venue.name} welcomes walk-ins, though booking ahead is recommended for peak hours and weekends to ensure availability.`,
                }]),
                {
                  question: `What technology does ${venue.name} use?`,
                  answer: `${venue.name} features ${
                    simulatorSystems && simulatorSystems.length > 0
                      ? simulatorSystems.map(s => `${s.brand}${s.model ? ` ${s.model}` : ""}`).join(", ")
                      : venue.launchMonitorType && venue.launchMonitorType !== "unknown"
                        ? `${LAUNCH_MONITOR_LABELS[venue.launchMonitorType] || formatTag(venue.launchMonitorType)} technology`
                        : "professional golf simulator technology"
                  }. ${venue.ballTracking ? "Full ball flight tracking is available." : ""} ${venue.clubTracking ? "Club path and face data are tracked." : ""}`.trim(),
                },
                ...(venue.bayCount ? [{
                  question: `How many simulator bays does ${venue.name} have?`,
                  answer: `${venue.name} has ${venue.bayCount} simulator bays${venue.privateRoomsCount ? `, including ${venue.privateRoomsCount} private rooms` : ""}. ${venue.maxGroupSizePerBay ? `Each bay accommodates up to ${venue.maxGroupSizePerBay} people.` : ""}`,
                }] : []),
              ];

              // Combine venue FAQs with defaults (avoid duplicates)
              const allFaqs = venueFaqs.length > 0 
                ? [...venueFaqs, ...defaultFaqs.slice(0, 2)]
                : defaultFaqs;

              if (allFaqs.length === 0) return null;

              return (
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <HelpCircle className="w-5 h-5 text-masters-green" />
                    <h2 className="text-xl font-semibold text-cream">Frequently Asked Questions</h2>
                  </div>
                  <div className="space-y-4">
                    {allFaqs.map((item, i) => (
                      <div key={i} className="p-4 border border-default bg-charcoal rounded-lg">
                        <h3 className="text-cream font-medium mb-2 flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-masters-green/20 text-masters-green text-xs flex items-center justify-center font-mono">
                            Q
                          </span>
                          {item.question}
                        </h3>
                        <p className="text-muted text-sm pl-9">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                  {/* FAQPage Schema */}
                  <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                      __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        mainEntity: allFaqs.map((item) => ({
                          "@type": "Question",
                          name: item.question,
                          acceptedAnswer: {
                            "@type": "Answer",
                            text: item.answer,
                          },
                        })),
                      }),
                    }}
                  />
                </section>
              );
            })()}

            {/* Map Section */}
            {mapUrl && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Map className="w-5 h-5 text-masters-green" />
                  <h2 className="text-xl font-semibold text-cream">Location</h2>
                </div>
                {/* Map container with theme-colored border/overlay */}
                <div className="relative border-2 border-masters-green/30 rounded-lg overflow-hidden">
                  {/* Theme overlay on top */}
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_0_2px_rgba(0,105,74,0.3)] z-10" />
                  <iframe
                    src={mapUrl}
                    width="100%"
                    height="300"
                    style={{ border: 0, filter: "grayscale(20%) contrast(1.1)" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map of ${venue.name}`}
                  />
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  {directionsUrl && (
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-masters-green hover:text-cream transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      Get Directions
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {venue.googleMapsUrl && (
                    <a
                      href={venue.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-masters-green hover:text-cream transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      View on Google Maps
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* Accessibility */}
            {venue.accessibility && venue.accessibility.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Accessibility className="w-5 h-5 text-masters-green" />
                  <h2 className="text-xl font-semibold text-cream">Accessibility</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {venue.accessibility.map((item: string) => (
                    <span
                      key={item}
                      className="px-3 py-1 border border-default text-cream-subtle text-sm"
                    >
                      {formatTag(item)}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Claim Venue CTA - Only show if not claimed */}
            {!venue.claimed && !claimSuccess && (
              <div className="border border-masters-green p-6 bg-masters-green/5">
                <h3 className="mb-2 text-cream flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-masters-green" />
                  Own this venue?
                </h3>
                <p className="text-sm text-muted mb-4">
                  Claim your listing to update details, add photos, and manage your venue.
                </p>
                <button
                  onClick={handleClaim}
                  className="w-full btn-primary justify-center"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Claim This Venue</span>
                </button>
              </div>
            )}


            {/* Book a Bay CTA */}
            <div className="border border-masters-green p-6 bg-masters-green/5">
              <h3 className="mb-4 text-cream">Book a Bay</h3>
              {venue.bookingUrl ? (
                <a
                  href={venue.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center"
                >
                  <Calendar className="w-4 h-4" />
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
                  <Globe className="w-4 h-4" />
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

              {/* Quick Directions Button */}
              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 w-full py-3 px-4 border border-default text-muted hover:border-masters-green hover:text-cream transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Directions</span>
                </a>
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
                {venue.email && (
                  <a
                    href={`mailto:${venue.email}`}
                    className="flex items-center gap-3 text-muted hover:text-masters-green transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    {venue.email}
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
                {venue.googleMapsUrl && (
                  <a
                    href={venue.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-muted hover:text-masters-green transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                    Google Maps
                  </a>
                )}
              </div>
            </div>

            {/* Best By Links */}
            <VenueBestByLinks venue={venue} />

            {/* Pricing */}
            {(venue.priceRangeMin || venue.priceRangeMax) && (
              <div className="border border-default p-6 bg-charcoal">
                <h3 className="mb-4 text-cream flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-masters-green" />
                  Pricing
                </h3>
                <div className="flex items-center gap-2 text-cream">
                  <span className="font-mono font-bold text-2xl">
                    {venue.priceRangeMin ? `$${venue.priceRangeMin}` : ""}
                    {venue.priceRangeMax &&
                    venue.priceRangeMax !== venue.priceRangeMin
                      ? `-$${venue.priceRangeMax}`
                      : venue.priceRangeMax === venue.priceRangeMin ? "" : "+"}
                  </span>
                  <span className="text-muted">/hour</span>
                </div>
                {venue.pricingModel && venue.pricingModel !== "unknown" && (
                  <p className="text-sm text-muted mt-2">
                    {PRICING_MODEL_LABELS[venue.pricingModel] ||
                      formatTag(venue.pricingModel)}
                  </p>
                )}
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
                {venue.kidFriendly && (
                  <div className="flex items-center gap-2">
                    <Baby className="w-4 h-4 text-masters-green" />
                    Kid Friendly
                  </div>
                )}
                {venue.coachingAvailable && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-masters-green" />
                    Coaching Available
                  </div>
                )}
                {venue.wifi && (
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-masters-green" />
                    Free WiFi
                  </div>
                )}
                {venue.parking && venue.parking !== "unknown" && (
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-masters-green" />
                    {formatTag(venue.parking)}
                  </div>
                )}
                {foodAndDrink?.food && (
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-masters-green" />
                    Food Available
                  </div>
                )}
                {foodAndDrink?.alcohol && (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-masters-green" />
                    Full Bar
                  </div>
                )}
                {venue.walkInsAllowed ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-masters-green" />
                    Walk-ins Welcome
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-sunday-red" />
                    Reservations Required
                  </div>
                )}
              </div>

              {/* Food & Drink Notes */}
              {foodAndDrink?.notes && (
                <div className="mt-4 p-3 bg-slate/50 border border-default">
                  <p className="text-sm text-muted">{foodAndDrink.notes}</p>
                </div>
              )}
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
                            hours === "00:00-00:00" || hours === "Closed"
                              ? "text-sunday-red"
                              : "text-cream"
                          }
                        >
                          {hours === "00:00-00:00" || hours === "Closed"
                            ? "Closed"
                            : hours}
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

        {/* Browse More Links */}
        <section className="mt-12 pt-12 border-t border-default">
          <div className="flex items-center gap-3 mb-6">
            <ArrowRight className="w-5 h-5 text-masters-green" />
            <h2 className="text-2xl font-semibold text-cream">Explore More</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/venue/us/${toStateSlug(venue.state)}/${toCitySlug(venue.city)}`}
              className="px-4 py-2.5 border border-default rounded-full text-cream-subtle text-sm hover:border-masters-green hover:text-cream hover:bg-masters-green/5 transition-all"
            >
              All venues in {venue.city}
            </Link>
            <Link
              href={`/venue/us/${toStateSlug(venue.state)}`}
              className="px-4 py-2.5 border border-default rounded-full text-cream-subtle text-sm hover:border-masters-green hover:text-cream hover:bg-masters-green/5 transition-all"
            >
              All venues in {venue.state}
            </Link>
            {venue.vibeTags && venue.vibeTags.length > 0 && (
              <Link
                href={`/venue/us/${toStateSlug(venue.state)}/${toCitySlug(venue.city)}/best/vibe/${String(venue.vibeTags[0] || "").replace(/_/g, "-")}`}
                className="px-4 py-2.5 border border-default rounded-full text-cream-subtle text-sm hover:border-masters-green hover:text-cream hover:bg-masters-green/5 transition-all"
              >
                {formatTag(String(venue.vibeTags[0] || ""))} venues in {venue.city}
              </Link>
            )}
            {venue.launchMonitorType && venue.launchMonitorType !== "unknown" && (
              <Link
                href={`/best/launch-monitor/${String(venue.launchMonitorType).replace(/_/g, "-")}`}
                className="px-4 py-2.5 border border-default rounded-full text-cream-subtle text-sm hover:border-masters-green hover:text-cream hover:bg-masters-green/5 transition-all"
              >
                {LAUNCH_MONITOR_LABELS[String(venue.launchMonitorType)] || formatTag(String(venue.launchMonitorType))} venues
              </Link>
            )}
            <Link
              href="/best"
              className="px-4 py-2.5 border border-default rounded-full text-cream-subtle text-sm hover:border-masters-green hover:text-cream hover:bg-masters-green/5 transition-all"
            >
              Browse all categories
            </Link>
          </div>
        </section>

        {/* Nearby Venues Section */}
        {(nearbyVenues.length > 0 || nearbyScope === "state") && (
          <section className="mt-12 pt-12 border-t border-default">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-5 h-5 text-masters-green" />
              <h2 className="text-2xl font-semibold text-cream">
                Nearby Golf Simulators {nearbyScope === "city" ? `in ${venue.city}` : `in ${venue.state}`}
              </h2>
            </div>
            {nearbyScope === "state" && (
              <p className="text-muted text-sm mb-6">
                {venue.city} currently has only one active venue. Know a great golf simulator nearby?{" "}
                <Link href="/submit" className="text-masters-green hover:text-cream hover:underline underline-offset-4">
                  Submit your place.
                </Link>
              </p>
            )}
            {nearbyVenues.length > 0 ? (
              <VenueGrid columns={4}>
                {nearbyVenues.slice(0, 4).map((nearby) => (
                  <VenueCard
                    key={nearby.id}
                    id={nearby.id}
                    slug={nearby.slug}
                    name={nearby.name}
                    city={nearby.city}
                    state={nearby.state}
                    heroImage={nearby.heroImage}
                    venueType={nearby.venueType}
                    simulatorSystems={nearby.simulatorSystems as string[] | null}
                    launchMonitorType={nearby.launchMonitorType}
                    priceRangeMin={nearby.priceRangeMin}
                    priceRangeMax={nearby.priceRangeMax}
                    ratingOverall={nearby.ratingOverall}
                    featured={nearby.featured}
                    tags={nearby.tags as string[] | null}
                    href={getVenueHref(nearby.state, nearby.city, nearby.slug)}
                  />
                ))}
              </VenueGrid>
            ) : (
              <p className="text-muted text-sm">No other active venues found in {venue.state} yet.</p>
            )}
          </section>
        )}

        {/* CTA Section */}
        <section className="mt-12">
          <div className="border border-default bg-charcoal p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
              Own a Golf Simulator Venue?
            </h2>
            <p className="text-muted max-w-2xl mx-auto mb-6">
              Claim your listing to update details, respond to reviews, and attract more golfers to your venue. It&apos;s free and takes just a few minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/claim"
                className="btn-primary"
              >
                <span>Claim Your Listing</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/submit"
                className="btn-outline"
              >
                <span>Submit New Venue</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Claim Venue Modal */}
      <ClaimVenueModal
        venueId={venue.id}
        venueName={venue.name}
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        onSuccess={handleClaimSuccess}
      />
    </div>
  );
}
