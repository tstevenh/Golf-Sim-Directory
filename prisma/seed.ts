import {
  PrismaClient,
  VenueType,
  LaunchMonitorType,
  PricingModel,
  VenueStatus,
  ParkingType,
  VerificationLevel,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with comprehensive data...");

  // Sample venues data with ALL fields populated
  const venues = [
    {
      // Core Info
      name: "X-Golf Chicago",
      slug: "x-golf-chicago",
      brandName: "X-Golf",
      venueType: VenueType.sim_bar,

      // Address
      address: "123 Golf Lane, Suite 100",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "US",
      latitude: 41.8781,
      longitude: -87.6298,
      googleMapsUrl:
        "https://maps.google.com/?q=X-Golf+Chicago+123+Golf+Lane+Chicago+IL",

      // Contact
      phone: "(312) 555-0123",
      email: "info@xgolfchicago.com",
      website: "https://xgolfchicago.com",
      bookingUrl: "https://xgolfchicago.com/book",

      // SEO Content
      shortDescription:
        "Premium indoor golf simulator bar in downtown Chicago with food, drinks, and leagues.",
      about:
        "X-Golf Chicago offers state-of-the-art golf simulators in a vibrant bar atmosphere. Perfect for casual rounds, league play, or corporate events. Our facility features 8 high-definition simulators with over 50 world-class courses. Full bar and restaurant on-site with craft cocktails and pub fare. We host weekly leagues, corporate events, and private parties. Whether you're a scratch golfer or just starting out, our friendly staff and welcoming atmosphere make every visit enjoyable.",

      // Categorization
      tags: ["bar", "food", "drinks", "leagues", "corporate-events", "parties"],
      vibeTags: ["casual", "social", "modern", "lively"],
      whoItsFor: ["casual-golfers", "groups", "corporate", "league-players"],

      // Tech Info
      simulatorSystems: ["X-Golf", "X-Golf Pro"],
      launchMonitorType: LaunchMonitorType.hybrid,
      ballTracking: true,
      clubTracking: true,
      puttingMode: "auto_putt",
      leftyFriendly: true,

      // Facility
      bayCount: 8,
      hasPrivateRooms: true,
      privateRoomsCount: 2,
      maxGroupSizePerBay: 6,

      // Pricing
      pricingModel: PricingModel.per_bay_hour,
      priceRangeMin: 45,
      priceRangeMax: 75,
      currency: "USD",

      // Amenities
      foodAndDrink: {
        food: true,
        alcohol: true,
        notes: "Full kitchen with burgers, wings, and apps. Craft beer and cocktails.",
      },
      parking: ParkingType.paid_lot,
      accessibility: ["wheelchair_accessible", "elevator"],
      wifi: true,
      kidFriendly: true,
      coachingAvailable: true,

      // Hours
      hours:
        "mon:10:00-23:00|tue:10:00-23:00|wed:10:00-23:00|thu:10:00-23:00|fri:10:00-24:00|sat:09:00-24:00|sun:09:00-22:00",
      walkInsAllowed: true,

      // Media
      heroImage:
        "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200",

      // Ratings
      ratingTechQuality: 4.8,
      ratingFacilityComfort: 4.6,
      ratingValueForMoney: 4.5,
      ratingOverall: 4.7,

      // Why golfers like it
      whyGolfersLikeIt: [
        "Great simulator technology",
        "Fun atmosphere",
        "Good food and drinks",
        "Friendly staff",
      ],

      // Status & Ownership
      status: VenueStatus.active,
      claimed: false,
      featured: true,

      // Verification
      verificationLevel: VerificationLevel.verified,
      dataSource: "manual",

      // SEO
      metaTitle: "X-Golf Chicago - Premium Indoor Golf Simulator Bar",
      metaDescription:
        "Book a bay at X-Golf Chicago. 8 high-definition simulators, full bar & restaurant, leagues, and events. Perfect for golfers of all skill levels.",
    },
    {
      // Core Info
      name: "Five Iron Golf",
      slug: "five-iron-golf-chicago",
      brandName: "Five Iron Golf",
      venueType: VenueType.sim_bar,

      // Address
      address: "456 Swing Street",
      city: "Chicago",
      state: "IL",
      zipCode: "60611",
      country: "US",
      latitude: 41.8902,
      longitude: -87.6235,
      googleMapsUrl:
        "https://maps.google.com/?q=Five+Iron+Golf+Chicago+456+Swing+Street",

      // Contact
      phone: "(312) 555-0456",
      email: "chicago@fiveirongolf.com",
      website: "https://fiveirongolf.com/chicago",
      bookingUrl: "https://fiveirongolf.com/chicago/book",

      // SEO Content
      shortDescription:
        "Upscale golf simulator lounge with TrackMan technology, lessons, and premium bar.",
      about:
        "Five Iron Golf brings a sophisticated approach to indoor golf. Featuring TrackMan and Foresight simulators, professional instruction, and a craft cocktail bar. Our 12 state-of-the-art bays offer the most accurate ball tracking technology available. Perfect for serious golfers looking to improve their game or groups wanting a premium experience. Our certified instructors offer lessons for all skill levels, and our club fitting services use the latest technology to find your perfect setup.",

      // Categorization
      tags: ["bar", "food", "lessons", "club-fitting", "leagues", "premium"],
      vibeTags: ["upscale", "modern", "professional", "sophisticated"],
      whoItsFor: [
        "serious-golfers",
        "professionals",
        "groups",
        "league-players",
      ],

      // Tech Info
      simulatorSystems: ["TrackMan", "Foresight GCQuad"],
      launchMonitorType: LaunchMonitorType.radar,
      ballTracking: true,
      clubTracking: true,
      puttingMode: "real_putting_surface",
      leftyFriendly: true,

      // Facility
      bayCount: 12,
      hasPrivateRooms: true,
      privateRoomsCount: 3,
      maxGroupSizePerBay: 8,

      // Pricing
      pricingModel: PricingModel.per_bay_hour,
      priceRangeMin: 55,
      priceRangeMax: 95,
      currency: "USD",

      // Amenities
      foodAndDrink: {
        food: true,
        alcohol: true,
        notes: "Premium dining with craft cocktails, wine list, and chef-inspired menu",
      },
      parking: ParkingType.valet,
      accessibility: ["wheelchair_accessible", "elevator"],
      wifi: true,
      kidFriendly: false,
      coachingAvailable: true,

      // Hours
      hours:
        "mon:07:00-23:00|tue:07:00-23:00|wed:07:00-23:00|thu:07:00-23:00|fri:07:00-24:00|sat:08:00-24:00|sun:08:00-22:00",
      walkInsAllowed: true,

      // Media
      heroImage:
        "https://images.unsplash.com/photo-1593111774644-6c8bd630c7b0?w=1200",

      // Ratings
      ratingTechQuality: 4.9,
      ratingFacilityComfort: 4.8,
      ratingValueForMoney: 4.6,
      ratingOverall: 4.9,

      // Why golfers like it
      whyGolfersLikeIt: [
        "Best simulator technology",
        "Professional instruction",
        "Upscale atmosphere",
        "Excellent club fitting",
      ],

      // Status & Ownership
      status: VenueStatus.active,
      claimed: true,
      featured: true,

      // Verification
      verificationLevel: VerificationLevel.verified,
      dataSource: "owner_submitted",

      // SEO
      metaTitle: "Five Iron Golf Chicago - TrackMan Simulators & Lessons",
      metaDescription:
        "Experience Chicago's premier indoor golf facility. TrackMan simulators, professional instruction, club fitting, and upscale lounge. Book your bay today.",
    },
    {
      // Core Info
      name: "Topgolf Chicago",
      slug: "topgolf-chicago",
      brandName: "Topgolf",
      venueType: VenueType.multi_sport_sim,

      // Address
      address: "789 Range Road",
      city: "Chicago",
      state: "IL",
      zipCode: "60622",
      country: "US",
      latitude: 41.9034,
      longitude: -87.6672,
      googleMapsUrl:
        "https://maps.google.com/?q=Topgolf+Chicago+789+Range+Road",

      // Contact
      phone: "(312) 555-0789",
      email: "chicago@topgolf.com",
      website: "https://topgolf.com/us/chicago",
      bookingUrl: "https://topgolf.com/us/chicago/reserve",

      // SEO Content
      shortDescription:
        "The ultimate golf entertainment destination with games, food, and drinks for all skill levels.",
      about:
        "Topgolf Chicago combines competitive golf games with great food and drinks. Microchipped balls track your shots to targets on the range, scoring points for accuracy and distance. Perfect for families, parties, and corporate events. Our climate-controlled hitting bays keep you comfortable year-round. Full-service restaurant and bar with an extensive menu. No golf experience required - our games are fun for everyone!",

      // Categorization
      tags: [
        "bar",
        "restaurant",
        "family-friendly",
        "events",
        "games",
        "entertainment",
      ],
      vibeTags: ["fun", "energetic", "social", "family", "lively"],
      whoItsFor: [
        "families",
        "groups",
        "corporate",
        "beginners",
        "date-night",
      ],

      // Tech Info
      simulatorSystems: ["Topgolf Swing Suite", "Full Swing"],
      launchMonitorType: LaunchMonitorType.hybrid,
      ballTracking: true,
      clubTracking: false,
      puttingMode: "gimme_circle",
      leftyFriendly: true,

      // Facility
      bayCount: 6,
      hasPrivateRooms: false,
      maxGroupSizePerBay: 6,

      // Pricing
      pricingModel: PricingModel.per_bay_hour,
      priceRangeMin: 35,
      priceRangeMax: 65,
      currency: "USD",

      // Amenities
      foodAndDrink: {
        food: true,
        alcohol: true,
        notes: "Full-service restaurant with burgers, tacos, shareables. Full bar.",
      },
      parking: ParkingType.free_lot,
      accessibility: ["wheelchair_accessible"],
      wifi: true,
      kidFriendly: true,
      coachingAvailable: true,

      // Hours
      hours:
        "mon:09:00-23:00|tue:09:00-23:00|wed:09:00-23:00|thu:09:00-23:00|fri:09:00-24:00|sat:08:00-24:00|sun:08:00-23:00",
      walkInsAllowed: true,

      // Media
      heroImage:
        "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200",

      // Ratings
      ratingTechQuality: 4.5,
      ratingFacilityComfort: 4.7,
      ratingValueForMoney: 4.6,
      ratingOverall: 4.6,

      // Why golfers like it
      whyGolfersLikeIt: [
        "Fun games for everyone",
        "Great for groups",
        "Good food and drinks",
        "No experience needed",
      ],

      // Status & Ownership
      status: VenueStatus.active,
      claimed: true,
      featured: true,

      // Verification
      verificationLevel: VerificationLevel.verified,
      dataSource: "owner_submitted",

      // SEO
      metaTitle: "Topgolf Chicago - Golf Entertainment & Games",
      metaDescription:
        "Visit Topgolf Chicago for golf games, great food, and drinks. Perfect for families, groups, and parties. Book your bay online today!",
    },
    {
      // Core Info
      name: "GolfTec Chicago Loop",
      slug: "golftec-chicago-loop",
      brandName: "GolfTec",
      venueType: VenueType.training_studio,

      // Address
      address: "321 Lesson Avenue, Floor 2",
      city: "Chicago",
      state: "IL",
      zipCode: "60603",
      country: "US",
      latitude: 41.8825,
      longitude: -87.6278,
      googleMapsUrl:
        "https://maps.google.com/?q=GolfTec+Chicago+321+Lesson+Avenue",

      // Contact
      phone: "(312) 555-0321",
      email: "loop@golftec.com",
      website: "https://golftec.com/chicago-loop",
      bookingUrl: "https://golftec.com/chicago-loop/book",

      // SEO Content
      shortDescription:
        "Professional golf instruction with video analysis and club fitting services.",
      about:
        "GolfTec offers comprehensive golf instruction using video analysis and launch monitor technology. Our certified coaches help improve your swing with data-driven lessons. With 4 private hitting bays and state-of-the-art motion measurement technology, we provide personalized instruction tailored to your goals. Club fitting services help you find the perfect equipment for your game.",

      // Categorization
      tags: [
        "lessons",
        "club-fitting",
        "video-analysis",
        "training",
        "coaching",
      ],
      vibeTags: ["professional", "focused", "instructional", "serious"],
      whoItsFor: ["serious-golfers", "beginners", "improvers"],

      // Tech Info
      simulatorSystems: ["GolfTec Pro", "SkyTrak"],
      launchMonitorType: LaunchMonitorType.photometric_camera,
      ballTracking: true,
      clubTracking: true,
      puttingMode: "real_putting_surface",
      leftyFriendly: true,

      // Facility
      bayCount: 4,
      hasPrivateRooms: true,
      privateRoomsCount: 4,
      maxGroupSizePerBay: 2,

      // Pricing
      pricingModel: PricingModel.membership_only,
      priceRangeMin: 150,
      priceRangeMax: 400,
      currency: "USD",

      // Amenities
      parking: ParkingType.street,
      accessibility: ["wheelchair_accessible", "elevator"],
      wifi: true,
      kidFriendly: true,
      coachingAvailable: true,

      // Hours
      hours:
        "mon:06:00-22:00|tue:06:00-22:00|wed:06:00-22:00|thu:06:00-22:00|fri:06:00-22:00|sat:07:00-20:00|sun:07:00-20:00",
      walkInsAllowed: false,

      // Media
      heroImage:
        "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=1200",

      // Ratings
      ratingTechQuality: 4.7,
      ratingFacilityComfort: 4.5,
      ratingValueForMoney: 4.4,
      ratingOverall: 4.8,

      // Why golfers like it
      whyGolfersLikeIt: [
        "Expert coaching",
        "Video analysis",
        "Data-driven improvement",
        "Professional club fitting",
      ],

      // Status & Ownership
      status: VenueStatus.active,
      claimed: true,
      featured: false,

      // Verification
      verificationLevel: VerificationLevel.verified,
      dataSource: "owner_submitted",

      // SEO
      metaTitle: "GolfTec Chicago - Professional Golf Lessons & Fitting",
      metaDescription:
        "Improve your game with GolfTec's professional instruction. Video analysis, launch monitor technology, and expert club fitting in downtown Chicago.",
    },
    {
      // Core Info
      name: "Indoor Golf NYC",
      slug: "indoor-golf-nyc",
      brandName: null,
      venueType: VenueType.sim_bar,

      // Address
      address: "555 Manhattan Boulevard",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "US",
      latitude: 40.7505,
      longitude: -73.9934,

      // Contact
      phone: "(212) 555-0199",
      email: "info@indoorgolfnyc.com",
      website: "https://indoorgolfnyc.com",
      bookingUrl: "https://indoorgolfnyc.com/reserve",

      // SEO Content
      shortDescription:
        "Manhattan's premier indoor golf destination with professional-grade simulators.",
      about:
        "Located in the heart of NYC, Indoor Golf NYC offers premium golf simulation with Foresight GCQuad and TrackMan technology. Perfect for business meetings or after-work rounds. Our sophisticated lounge atmosphere features craft cocktails and light fare. 6 private bays with the most accurate launch monitors available.",

      // Categorization
      tags: ["bar", "food", "events", "corporate", "after-work"],
      vibeTags: ["urban", "sophisticated", "business", "upscale"],
      whoItsFor: ["professionals", "corporate", "serious-golfers"],

      // Tech Info
      simulatorSystems: ["Foresight GCQuad", "TrackMan 4"],
      launchMonitorType: LaunchMonitorType.photometric_camera,
      ballTracking: true,
      clubTracking: true,
      puttingMode: "auto_putt",
      leftyFriendly: true,

      // Facility
      bayCount: 6,
      hasPrivateRooms: true,
      privateRoomsCount: 2,
      maxGroupSizePerBay: 4,

      // Pricing
      pricingModel: PricingModel.per_bay_hour,
      priceRangeMin: 65,
      priceRangeMax: 120,
      currency: "USD",

      // Amenities
      foodAndDrink: {
        food: true,
        alcohol: true,
        notes: "Premium bar with craft cocktails and small plates",
      },
      parking: ParkingType.garage,
      accessibility: ["wheelchair_accessible", "elevator"],
      wifi: true,
      kidFriendly: false,
      coachingAvailable: true,

      // Hours
      hours:
        "mon:11:00-23:00|tue:11:00-23:00|wed:11:00-23:00|thu:11:00-24:00|fri:11:00-24:00|sat:10:00-24:00|sun:10:00-22:00",
      walkInsAllowed: true,

      // Media
      heroImage:
        "https://images.unsplash.com/photo-1592919505780-30395071d481?w=1200",

      // Ratings
      ratingTechQuality: 4.8,
      ratingFacilityComfort: 4.6,
      ratingValueForMoney: 4.2,
      ratingOverall: 4.5,

      // Why golfers like it
      whyGolfersLikeIt: [
        "Premium technology",
        "Great location",
        "Sophisticated atmosphere",
        "Business-friendly",
      ],

      // Status & Ownership
      status: VenueStatus.active,
      claimed: false,
      featured: true,

      // Verification
      verificationLevel: VerificationLevel.partially_verified,
      dataSource: "manual",

      // SEO
      metaTitle: "Indoor Golf NYC - Manhattan Golf Simulators",
      metaDescription:
        "Premium indoor golf in Manhattan. Foresight and TrackMan simulators, craft cocktails, perfect for business meetings or after-work rounds.",
    },
    {
      // Core Info
      name: "Sim Golf LA",
      slug: "sim-golf-la",
      brandName: null,
      venueType: VenueType.sim_bar,

      // Address
      address: "888 Sunset Strip",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90028",
      country: "US",
      latitude: 34.0928,
      longitude: -118.3287,

      // Contact
      phone: "(323) 555-0777",
      email: "info@simgolfla.com",
      website: "https://simgolfla.com",
      bookingUrl: "https://simgolfla.com/book",

      // SEO Content
      shortDescription:
        "Hollywood-style indoor golf with craft cocktails and celebrity sightings.",
      about:
        "Sim Golf LA brings the glamour of Hollywood to indoor golf. Great vibes, great drinks, and great golf. A favorite spot for entertainment industry folks. 10 bays with AboutGolf and Full Swing simulators. Regular celebrity sightings and industry events make this a unique LA experience.",

      // Categorization
      tags: ["bar", "food", "leagues", "events", "celebrity"],
      vibeTags: ["laid-back", "social", "trendy", "hollywood"],
      whoItsFor: ["casual-golfers", "groups", "entertainment-industry"],

      // Tech Info
      simulatorSystems: ["AboutGolf", "Full Swing"],
      launchMonitorType: LaunchMonitorType.hybrid,
      ballTracking: true,
      clubTracking: false,
      puttingMode: "auto_putt",
      leftyFriendly: true,

      // Facility
      bayCount: 10,
      hasPrivateRooms: true,
      privateRoomsCount: 1,
      maxGroupSizePerBay: 8,

      // Pricing
      pricingModel: PricingModel.per_bay_hour,
      priceRangeMin: 50,
      priceRangeMax: 85,
      currency: "USD",

      // Amenities
      foodAndDrink: {
        food: true,
        alcohol: true,
        notes: "California cuisine with craft cocktails and local beers",
      },
      parking: ParkingType.valet,
      accessibility: ["wheelchair_accessible"],
      wifi: true,
      kidFriendly: true,
      coachingAvailable: false,

      // Hours
      hours:
        "mon:12:00-23:00|tue:12:00-23:00|wed:12:00-23:00|thu:12:00-24:00|fri:12:00-24:00|sat:11:00-24:00|sun:11:00-23:00",
      walkInsAllowed: true,

      // Media
      heroImage:
        "https://images.unsplash.com/photo-1542766299-d9c5fa6a696d?w=1200",

      // Ratings
      ratingTechQuality: 4.3,
      ratingFacilityComfort: 4.5,
      ratingValueForMoney: 4.4,
      ratingOverall: 4.4,

      // Why golfers like it
      whyGolfersLikeIt: [
        "Hollywood atmosphere",
        "Celebrity sightings",
        "Great vibes",
        "Good for groups",
      ],

      // Status & Ownership
      status: VenueStatus.active,
      claimed: false,
      featured: false,

      // Verification
      verificationLevel: VerificationLevel.partially_verified,
      dataSource: "manual",

      // SEO
      metaTitle: "Sim Golf LA - Hollywood Indoor Golf",
      metaDescription:
        "Experience LA's most glamorous indoor golf. Craft cocktails, celebrity sightings, and great simulators on the Sunset Strip.",
    },
    {
      // Core Info
      name: "PGA Tour Superstore",
      slug: "pga-tour-superstore-dallas",
      brandName: "PGA Tour Superstore",
      venueType: VenueType.retail_fitting_center,

      // Address
      address: "777 Golf Plaza, Suite A",
      city: "Dallas",
      state: "TX",
      zipCode: "75240",
      country: "US",
      latitude: 32.9242,
      longitude: -96.8196,

      // Contact
      phone: "(972) 555-0333",
      email: "dallas@pgatoursuperstore.com",
      website: "https://pgatoursuperstore.com/dallas",
      bookingUrl: "https://pgatoursuperstore.com/dallas/bay-rental",

      // SEO Content
      shortDescription:
        "Full-service golf retail with simulator bays, club fitting, and lessons.",
      about:
        "PGA Tour Superstore offers everything a golfer needs - equipment, apparel, and simulator bays for practice or fitting. 8 simulator bays with Foresight and TrackMan technology. Professional club fitting and lessons available. Try before you buy with our extensive demo program.",

      // Categorization
      tags: ["retail", "club-fitting", "lessons", "equipment", "practice"],
      vibeTags: ["professional", "retail", "comprehensive", "practical"],
      whoItsFor: [
        "equipment-buyers",
        "serious-golfers",
        "club-fit-seekers",
        "practicers",
      ],

      // Tech Info
      simulatorSystems: ["Foresight", "TrackMan"],
      launchMonitorType: LaunchMonitorType.radar,
      ballTracking: true,
      clubTracking: true,
      puttingMode: "real_putting_surface",
      leftyFriendly: true,

      // Facility
      bayCount: 8,
      hasPrivateRooms: false,
      maxGroupSizePerBay: 4,

      // Pricing
      pricingModel: PricingModel.per_bay_hour,
      priceRangeMin: 40,
      priceRangeMax: 70,
      currency: "USD",

      // Amenities
      parking: ParkingType.free_lot,
      accessibility: ["wheelchair_accessible"],
      wifi: true,
      kidFriendly: true,
      coachingAvailable: true,

      // Hours
      hours:
        "mon:09:00-21:00|tue:09:00-21:00|wed:09:00-21:00|thu:09:00-21:00|fri:09:00-21:00|sat:09:00-21:00|sun:10:00-19:00",
      walkInsAllowed: true,

      // Media
      heroImage:
        "https://images.unsplash.com/photo-1562204320-31975b3c043f?w=1200",

      // Ratings
      ratingTechQuality: 4.7,
      ratingFacilityComfort: 4.5,
      ratingValueForMoney: 4.8,
      ratingOverall: 4.6,

      // Why golfers like it
      whyGolfersLikeIt: [
        "Great for club fitting",
        "Try before you buy",
        "Professional staff",
        "Good practice facility",
      ],

      // Status & Ownership
      status: VenueStatus.active,
      claimed: true,
      featured: false,

      // Verification
      verificationLevel: VerificationLevel.verified,
      dataSource: "owner_submitted",

      // SEO
      metaTitle: "PGA Tour Superstore Dallas - Golf Retail & Simulators",
      metaDescription:
        "Full-service golf retail with simulator bays, professional club fitting, and lessons. Try equipment before you buy.",
    },
    {
      // Core Info
      name: "Drive Shack Miami",
      slug: "drive-shack-miami",
      brandName: "Drive Shack",
      venueType: VenueType.multi_sport_sim,

      // Address
      address: "999 Beach Drive",
      city: "Miami",
      state: "FL",
      zipCode: "33131",
      country: "US",
      latitude: 25.7617,
      longitude: -80.1918,

      // Contact
      phone: "(305) 555-0888",
      email: "miami@driveshack.com",
      website: "https://driveshack.com/miami",
      bookingUrl: "https://driveshack.com/miami/book",

      // SEO Content
      shortDescription:
        "Golf entertainment complex with bays, games, and Miami nightlife vibes.",
      about:
        "Drive Shack Miami combines golf games with beach vibes. Multiple hitting bays, full restaurant and bar, and arcade games. The perfect Miami golf experience. Play competitive games, enjoy tropical drinks, and soak up the Miami atmosphere. Great for groups, parties, and corporate events.",

      // Categorization
      tags: ["bar", "restaurant", "games", "events", "nightlife", "arcade"],
      vibeTags: ["energetic", "party", "social", "tropical", "fun"],
      whoItsFor: ["groups", "partiers", "corporate", "date-night", "tourists"],

      // Tech Info
      simulatorSystems: ["Full Swing", "TrackMan"],
      launchMonitorType: LaunchMonitorType.radar,
      ballTracking: true,
      clubTracking: false,
      puttingMode: "gimme_circle",
      leftyFriendly: true,

      // Facility
      bayCount: 4,
      hasPrivateRooms: false,
      maxGroupSizePerBay: 8,

      // Pricing
      pricingModel: PricingModel.per_bay_hour,
      priceRangeMin: 40,
      priceRangeMax: 70,
      currency: "USD",

      // Amenities
      foodAndDrink: {
        food: true,
        alcohol: true,
        notes: "Full restaurant with tropical cocktails and Florida-inspired menu",
      },
      parking: ParkingType.paid_lot,
      accessibility: ["wheelchair_accessible"],
      wifi: true,
      kidFriendly: true,
      coachingAvailable: false,

      // Hours
      hours:
        "mon:11:00-24:00|tue:11:00-24:00|wed:11:00-24:00|thu:11:00-24:00|fri:11:00-02:00|sat:10:00-02:00|sun:10:00-23:00",
      walkInsAllowed: true,

      // Media
      heroImage:
        "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200",

      // Ratings
      ratingTechQuality: 4.4,
      ratingFacilityComfort: 4.5,
      ratingValueForMoney: 4.3,
      ratingOverall: 4.3,

      // Why golfers like it
      whyGolfersLikeIt: [
        "Miami vibes",
        "Fun atmosphere",
        "Great for parties",
        "Tropical drinks",
      ],

      // Status & Ownership
      status: VenueStatus.active,
      claimed: true,
      featured: true,

      // Verification
      verificationLevel: VerificationLevel.verified,
      dataSource: "owner_submitted",

      // SEO
      metaTitle: "Drive Shack Miami - Golf Games & Entertainment",
      metaDescription:
        "Miami's ultimate golf entertainment destination. Games, tropical drinks, restaurant, and arcade. Perfect for groups and parties!",
    },
    {
      // Core Info
      name: "Topgolf Austin",
      slug: "topgolf-austin",
      brandName: "Topgolf",
      venueType: VenueType.multi_sport_sim,

      // Address
      address: "1236 E Riverside Drive",
      city: "Austin",
      state: "TX",
      zipCode: "78741",
      country: "US",
      latitude: 30.2465,
      longitude: -97.7335,

      // Contact
      phone: "(512) 555-0345",
      email: "austin@topgolf.com",
      website: "https://topgolf.com/us/austin",
      bookingUrl: "https://topgolf.com/us/austin/reserve",

      // SEO Content
      shortDescription:
        "Austin's hottest golf entertainment venue with games, food, and live music.",
      about:
        "Topgolf Austin brings the signature golf entertainment experience to the Live Music Capital. With climate-controlled hitting bays, a full-service restaurant and bar, and space for up to 6 players per bay, it's perfect for groups. Play points-based games, enjoy local Austin brews, and experience the city's unique vibe. Live music on weekends!",

      // Categorization
      tags: [
        "bar",
        "restaurant",
        "live-music",
        "family-friendly",
        "events",
        "games",
      ],
      vibeTags: ["energetic", "musical", "social", "austin-vibe", "fun"],
      whoItsFor: [
        "families",
        "groups",
        "music-lovers",
        "corporate",
        "tourists",
      ],

      // Tech Info
      simulatorSystems: ["Topgolf", "Toptracer"],
      launchMonitorType: LaunchMonitorType.hybrid,
      ballTracking: true,
      clubTracking: false,
      puttingMode: "gimme_circle",
      leftyFriendly: true,

      // Facility
      bayCount: 8,
      hasPrivateRooms: false,
      maxGroupSizePerBay: 6,

      // Pricing
      pricingModel: PricingModel.per_bay_hour,
      priceRangeMin: 35,
      priceRangeMax: 65,
      currency: "USD",

      // Amenities
      foodAndDrink: {
        food: true,
        alcohol: true,
        notes: "Full kitchen with local Austin specialties and craft beer selection",
      },
      parking: ParkingType.free_lot,
      accessibility: ["wheelchair_accessible"],
      wifi: true,
      kidFriendly: true,
      coachingAvailable: true,

      // Hours
      hours:
        "mon:09:00-23:00|tue:09:00-23:00|wed:09:00-23:00|thu:09:00-24:00|fri:09:00-02:00|sat:08:00-02:00|sun:08:00-23:00",
      walkInsAllowed: true,

      // Media
      heroImage:
        "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200",

      // Ratings
      ratingTechQuality: 4.5,
      ratingFacilityComfort: 4.6,
      ratingValueForMoney: 4.5,
      ratingOverall: 4.5,

      // Why golfers like it
      whyGolfersLikeIt: [
        "Austin atmosphere",
        "Live music",
        "Local craft beer",
        "Fun for everyone",
      ],

      // Status & Ownership
      status: VenueStatus.active,
      claimed: true,
      featured: true,

      // Verification
      verificationLevel: VerificationLevel.verified,
      dataSource: "owner_submitted",

      // SEO
      metaTitle: "Topgolf Austin - Golf Games, Food & Live Music",
      metaDescription:
        "Austin's premier golf entertainment venue. Play games, enjoy local food and drinks, and catch live music. Perfect for groups and parties!",
    },
  ];

  for (const venueData of venues) {
    const venue = await prisma.venue.upsert({
      where: { slug: venueData.slug },
      update: venueData,
      create: venueData,
    });
    console.log(`✅ Venue: ${venue.name}`);
  }

  // Create test users
  const testUsers = [
    {
      email: "test@golfsimmap.com",
      password:
        "$2a$12$K0ByB.6YI2/OYrB4fQOYLe6QdRg6XnYlYqYqYqYqYqYqYqYqYqYqYq",
      name: "Test User",
      role: "golfer" as const,
    },
    {
      email: "owner@golfsimmap.com",
      password:
        "$2a$12$K0ByB.6YI2/OYrB4fQOYLe6QdRg6XnYlYqYqYqYqYqYqYqYqYqYqYq",
      name: "Business Owner",
      role: "business_owner" as const,
      businessName: "Five Iron Golf",
    },
  ];

  for (const userData of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    console.log(`✅ User: ${user.email}`);
  }

  console.log("\n✨ Seeding completed!");
  console.log(`📊 Added ${venues.length} venues across ${new Set(venues.map(v => v.city)).size} cities`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
