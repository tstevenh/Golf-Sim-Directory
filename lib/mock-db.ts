// Mock database for development without a real database connection
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Venue, User, Favorite, UserRole, VenueType, LaunchMonitorType, PricingModel, ParkingType, VenueStatus, VerificationLevel } from "@prisma/client";

// Sample venues data
const mockVenues: Venue[] = [
  {
    id: "1",
    slug: "five-iron-golf-downtown-chicago",
    name: "Five Iron Golf - Downtown Chicago",
    brandName: "Five Iron Golf",
    venueType: VenueType.sim_bar,
    address: "320 N Clark St",
    city: "Chicago",
    state: "Illinois",
    zipCode: "60654",
    country: "US",
    latitude: 41.8875,
    longitude: -87.6308,
    phone: "3125550100",
    website: "https://fiveirongolf.com",
    bookingUrl: "https://fiveirongolf.com/book",
    googleMapsUrl: null,
    shortDescription: "Premium indoor golf simulator bar in downtown Chicago with Trackman technology.",
    about: "Five Iron Golf Chicago offers state-of-the-art Trackman simulators in a vibrant downtown location.",
    tags: ["date_night", "corporate_events", "serious_practice"],
    vibeTags: ["premium", "social", "competitive"],
    simulatorSystems: [{ brand: "Trackman", model: "4" }],
    hardwareBrands: ["trackman"],
    softwareSlugs: ["e6", "trackman-virtual"],
    launchMonitorType: LaunchMonitorType.radar,
    ballTracking: true,
    clubTracking: true,
    puttingMode: "real_putting_surface",
    leftyFriendly: true,
    bayCount: 8,
    hasPrivateRooms: true,
    privateRoomsCount: 2,
    maxGroupSizePerBay: 6,
    pricingModel: PricingModel.per_bay_hour,
    priceRangeMin: 55,
    priceRangeMax: 85,
    currency: "USD",
    foodAndDrink: { food: true, alcohol: true },
    parking: ParkingType.garage,
    accessibility: [],
    wifi: true,
    kidFriendly: true,
    coachingAvailable: true,
    hours: "mon:11:00-23:00|tue:11:00-23:00|wed:11:00-23:00|thu:11:00-00:00|fri:11:00-00:00|sat:09:00-00:00|sun:09:00-22:00",
    walkInsAllowed: true,
    heroImage: null,
    ratingTechQuality: 4.8,
    ratingFacilityComfort: 4.5,
    ratingValueForMoney: 4.0,
    ratingOverall: 4.4,
    whyGolfersLikeIt: ["Accurate Trackman data", "Great downtown location", "Excellent bar and food menu"],
    email: "info@fiveirongolf.com",
    whoItsFor: ["serious_practice", "groups", "date_night"],
    status: VenueStatus.active,
    claimed: false,
    claimedById: null,
    claimedAt: null,
    featured: true,
    featuredUntil: null,
    verificationLevel: VerificationLevel.verified,
    lastVerifiedAt: null,
    dataSource: "manual",
    metaTitle: null,
    metaDescription: null,
    comprehensiveData: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    slug: "golftec-schaumburg",
    name: "GolfTec - Schaumburg",
    brandName: "GolfTec",
    venueType: VenueType.training_studio,
    address: "1650 E Golf Rd",
    city: "Schaumburg",
    state: "Illinois",
    zipCode: "60173",
    country: "US",
    latitude: 42.0483,
    longitude: -88.0374,
    phone: "8475550200",
    website: "https://www.golftec.com",
    bookingUrl: null,
    googleMapsUrl: null,
    shortDescription: "Professional golf instruction and practice facility with video analysis.",
    about: "GolfTec Schaumburg offers professional golf lessons using advanced video analysis.",
    tags: ["serious_practice", "coaching_available"],
    vibeTags: ["training_focused", "professional"],
    simulatorSystems: [{ brand: "GCQuad", model: "GCQuad" }],
    hardwareBrands: ["gc-quad"],
    softwareSlugs: ["fsx"],
    launchMonitorType: LaunchMonitorType.photometric_camera,
    ballTracking: true,
    clubTracking: true,
    puttingMode: null,
    leftyFriendly: true,
    bayCount: 6,
    hasPrivateRooms: false,
    privateRoomsCount: null,
    maxGroupSizePerBay: null,
    pricingModel: PricingModel.per_person_hour,
    priceRangeMin: 45,
    priceRangeMax: 75,
    currency: "USD",
    foodAndDrink: null,
    parking: ParkingType.free_lot,
    accessibility: [],
    wifi: true,
    kidFriendly: true,
    coachingAvailable: true,
    hours: "mon:09:00-21:00|tue:09:00-21:00|wed:09:00-21:00|thu:09:00-21:00|fri:09:00-20:00|sat:08:00-18:00|sun:09:00-17:00",
    walkInsAllowed: true,
    heroImage: null,
    ratingTechQuality: 4.9,
    ratingFacilityComfort: 4.2,
    ratingValueForMoney: 4.5,
    ratingOverall: 4.5,
    whyGolfersLikeIt: ["Excellent coaching", "Detailed swing analysis"],
    email: "schaumburg@golftec.com",
    whoItsFor: ["serious_practice", "beginners"],
    status: VenueStatus.active,
    claimed: true,
    claimedById: null,
    claimedAt: null,
    featured: false,
    featuredUntil: null,
    verificationLevel: VerificationLevel.verified,
    lastVerifiedAt: null,
    dataSource: "manual",
    metaTitle: null,
    metaDescription: null,
    comprehensiveData: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    slug: "topgolf-chicago",
    name: "Topgolf - Chicago",
    brandName: "Topgolf",
    venueType: VenueType.sim_bar,
    address: "699 W Thorndale Ave",
    city: "Chicago",
    state: "Illinois",
    zipCode: "60660",
    country: "US",
    latitude: 41.9933,
    longitude: -87.6467,
    phone: "3125550300",
    website: "https://topgolf.com",
    bookingUrl: "https://topgolf.com/book",
    googleMapsUrl: null,
    shortDescription: "The ultimate entertainment destination with climate-controlled hitting bays.",
    about: "Topgolf Chicago combines golf, entertainment, and dining in a high-energy environment.",
    tags: ["date_night", "groups", "kid_friendly"],
    vibeTags: ["casual", "rowdy", "social"],
    simulatorSystems: [{ brand: "Toptracer", model: "Range" }],
    hardwareBrands: ["toptracer"],
    softwareSlugs: [],
    launchMonitorType: LaunchMonitorType.radar,
    ballTracking: true,
    clubTracking: false,
    puttingMode: null,
    leftyFriendly: true,
    bayCount: 100,
    hasPrivateRooms: true,
    privateRoomsCount: null,
    maxGroupSizePerBay: 6,
    pricingModel: PricingModel.per_bay_hour,
    priceRangeMin: 35,
    priceRangeMax: 65,
    currency: "USD",
    foodAndDrink: { food: true, alcohol: true },
    parking: ParkingType.free_lot,
    accessibility: [],
    wifi: true,
    kidFriendly: true,
    coachingAvailable: false,
    hours: "mon:10:00-23:00|tue:10:00-23:00|wed:10:00-23:00|thu:10:00-00:00|fri:10:00-00:00|sat:09:00-00:00|sun:09:00-23:00",
    walkInsAllowed: true,
    heroImage: null,
    ratingTechQuality: 4.0,
    ratingFacilityComfort: 4.8,
    ratingValueForMoney: 4.2,
    ratingOverall: 4.3,
    whyGolfersLikeIt: ["Great atmosphere", "Fun games", "Good food"],
    email: "chicago@topgolf.com",
    whoItsFor: ["groups", "entertainment", "kids"],
    status: VenueStatus.active,
    claimed: false,
    claimedById: null,
    claimedAt: null,
    featured: true,
    featuredUntil: null,
    verificationLevel: VerificationLevel.verified,
    lastVerifiedAt: null,
    dataSource: "manual",
    metaTitle: null,
    metaDescription: null,
    comprehensiveData: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock DB interface
export const mockDb = {
  venue: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findMany: async ({ where, orderBy, take, skip, select, distinct }: any = {}) => {
      void orderBy;
      void skip;
      void select;
      let results = [...mockVenues];
      
      if (where?.status) {
        results = results.filter(v => v.status === where.status);
      }
      if (where?.city?.equals) {
        const cityQuery = where.city.equals.toLowerCase();
        results = results.filter(v => v.city.toLowerCase() === cityQuery);
      }
      if (where?.state?.equals) {
        const stateQuery = where.state.equals.toLowerCase();
        results = results.filter(v => v.state.toLowerCase() === stateQuery);
      }
      if (where?.country) {
        results = results.filter(v => v.country === where.country);
      }
      if (where?.city?.not?.equals) {
        const cityQuery = where.city.not.equals.toLowerCase();
        results = results.filter(v => v.city.toLowerCase() !== cityQuery);
      }
      if (where?.id?.in) {
        const ids = new Set(where.id.in);
        results = results.filter(v => ids.has(v.id));
      }
      if (where?.hardwareBrands?.has) {
        results = results.filter(v => (v.hardwareBrands || []).includes(where.hardwareBrands.has));
      }
      if (where?.softwareSlugs?.has) {
        results = results.filter(v => (v.softwareSlugs || []).includes(where.softwareSlugs.has));
      }
      if (where?.featured === true) {
        results = results.filter(v => v.featured);
      }
      if (where?.slug) {
        results = results.filter(v => v.slug === where.slug);
      }
      
      if (distinct) {
        const seen = new Set();
        results = results.filter(v => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const key = distinct.map((d: string) => (v as any)[d]).join("-");
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }
      
      if (take) {
        results = results.slice(0, take);
      }
      
      return results;
    },
    findUnique: async ({ where }: { where: { slug?: string; id?: string } }) => {
      if (where.slug) {
        return mockVenues.find(v => v.slug === where.slug) || null;
      }
      if (where.id) {
        return mockVenues.find(v => v.id === where.id) || null;
      }
      return null;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    count: async ({ where }: any = {}) => {
      let results = [...mockVenues];
      if (where?.status) {
        results = results.filter(v => v.status === where.status);
      }
      return results.length;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    groupBy: async ({ by, where, orderBy }: any) => {
      let results = [...mockVenues];
      if (where?.status) {
        results = results.filter(v => v.status === where.status);
      }
      
      const groups = new Map();
      results.forEach(v => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const key = by.map((field: string) => (v as any)[field]).join("-");
        if (!groups.has(key)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const group: any = { _count: { id: 0 } };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          by.forEach((field: string) => group[field] = (v as any)[field]);
          groups.set(key, group);
        }
        groups.get(key)._count.id++;
      });
      
      // eslint-disable-next-line prefer-const
      let resultArray = Array.from(groups.values());
      
      // Sort by count desc if orderBy is specified
      if (orderBy?._count?.id === "desc") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resultArray.sort((a: any, b: any) => b._count.id - a._count.id);
      }
      
      return resultArray;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update: async ({ where, data }: any) => {
      const venue = mockVenues.find(v => v.id === where.id);
      return { ...venue, ...data };
    },
  },
  favorite: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findMany: async ({ where, include, orderBy }: any = {}) => {
      void where;
      void include;
      void orderBy;
      return [];
    },
    findUnique: async ({ where }: { where: { userId_venueId: { userId: string; venueId: string } } }) => {
      void where;
      return null;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create: async ({ data }: any) => ({ id: "new", ...data }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete: async ({ where }: any) => ({ id: where.id }),
  },
  user: {
    findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
      void where;
      return null;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update: async ({ where, data }: any) => ({ id: where.id, ...data }),
  },
  submission: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create: async ({ data }: any) => ({ id: "new", ...data }),
  },
  correctionReport: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create: async ({ data }: any) => ({ id: "new", ...data }),
  },
};
