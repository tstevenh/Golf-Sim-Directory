# SEO Content Plan — GolfSimMap

**Date:** February 7, 2026  
**Goal:** Optimize all SEO pages with unique copy, FAQs, proper schema, internal linking, and meta optimization.

---

## Page Type Inventory

### Location Pages

| # | Page Type | Route | Status | Priority |
|---|-----------|-------|--------|----------|
| 1 | US Index | `/venue/us` | ⚠️ Needs optimization | P0 |
| 2 | State Pages | `/venue/us/[state]` | ✅ Has SeoIndexSections | P1 |
| 3 | City Pages | `/venue/us/[state]/[city]` | ⚠️ Missing SEO sections | P0 |

### Best By Pages (Global)

| # | Page Type | Route | Status | Priority |
|---|-----------|-------|--------|----------|
| 4 | Best Index | `/best` | ✅ Exists | P1 |
| 5 | General Tags | `/best/[tag]` | ✅ Exists | P1 |
| 6 | Amenities | `/best/amenities/[amenity]` | ✅ Exists | P1 |
| 7 | Hardware | `/best/hardware/[brand]` | ✅ Exists | P1 |
| 8 | Launch Monitor | `/best/launch-monitor/[type]` | ✅ Good | P2 |
| 9 | Software | `/best/software/[software]` | ✅ Exists | P1 |
| 10 | Vibe | `/best/vibe/[vibe]` | ✅ Exists | P1 |
| 11 | Who It's For | `/best/who-its-for/[segment]` | ✅ Exists | P1 |

### Best By + Location Pages (City Level)

| # | Page Type | Route | Status | Priority |
|---|-----------|-------|--------|----------|
| 12 | City + Tag | `/venue/us/[state]/[city]/best/[tag]` | ✅ Exists | P1 |
| 13 | City + Hardware | `/venue/us/[state]/[city]/best/hardware/[brand]` | ✅ Exists | P1 |
| 14 | City + Vibe | `/venue/us/[state]/[city]/best/vibe/[vibe]` | ✅ Exists | P1 |
| 15 | City + Who It's For | `/venue/us/[state]/[city]/best/who-its-for/[segment]` | ✅ Exists | P1 |
| 16 | City + Amenities | `/venue/us/[state]/[city]/best/amenities/[amenity]` | ❌ **MISSING** | P0 |
| 17 | City + Launch Monitor | `/venue/us/[state]/[city]/best/launch-monitor/[type]` | ❌ **MISSING** | P0 |
| 18 | City + Software | `/venue/us/[state]/[city]/best/software/[software]` | ❌ **MISSING** | P0 |

### Venue Pages

| # | Page Type | Route | Status | Priority |
|---|-----------|-------|--------|----------|
| 19 | Individual Venue | `/venue/us/[state]/[city]/[venueSlug]` | ⚠️ Needs schema review | P1 |

---

## SEO Requirements Checklist (Per Page)

| Requirement | Details |
|-------------|---------|
| **Unique Intro** | 100-300 words, category-based with city variables |
| **Meta Title** | Unique, keyword-optimized, <60 chars |
| **Meta Description** | Unique, compelling, 150-160 chars |
| **H1** | ONE per page, keyword-rich, matches title intent |
| **Subheads** | Proper H2/H3 hierarchy |
| **FAQs** | 3-5 per page, mix of general + location-specific |
| **Internal Links** | Dynamic only (show categories/places with venues) |
| **Schema Markup** | Per page type (see below) |
| **Canonical URL** | Set correctly in metadata |

---

## Schema Markup Plan

### Location Pages (US, State, City)
```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Golf Simulators in {Location}",
  "description": "...",
  "breadcrumb": { "@type": "BreadcrumbList", ... },
  "mainEntity": { "@type": "ItemList", ... }
}
```

### Best By Pages
```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Best {Category} Golf Simulators",
  "description": "...",
  "breadcrumb": { "@type": "BreadcrumbList", ... },
  "mainEntity": { "@type": "ItemList", ... },
  "faq": { "@type": "FAQPage", ... }
}
```

### Venue Pages
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "...",
  "address": { ... },
  "breadcrumb": { "@type": "BreadcrumbList", ... }
}
```

---

## Content Strategy

### Approach: Category-Based Unique Copy + City Variables

**Core Copy (Category-Based):** Each category (hardware, vibe, amenity, etc.) gets unique 200-300 word copy that explains:
- What this category means for golfers
- Why it matters
- What to look for

**Sprinkle (Variables):** City/state names are interpolated:
- "Find {category} golf simulators in {city}, {state}"
- "Compare {count} venues with {category} in {city}"

### FAQ Strategy: Mix of General + Location-Specific

**General FAQs (per category):**
- What is {category}?
- Why choose venues with {category}?
- How to evaluate {category}?

**Location-Specific FAQs:**
- How many {category} venues are in {city}?
- What's the price range in {city}?
- Do {city} venues offer walk-ins?

---

## Internal Linking Strategy

### Rules:
1. **Dynamic only** — Only show links to categories/locations that have venues
2. **Contextual** — Links should make sense in context
3. **Bidirectional** — Pages should link to each other

### Link Patterns:

**City Pages → Best By:**
- Link to all best-by categories that have venues in that city
- "Find Trackman venues in {city}" → `/venue/us/{state}/{city}/best/hardware/trackman`

**Best By → Cities:**
- Link to cities that have venues with that attribute
- "Trackman in Chicago" → `/venue/us/illinois/chicago/best/hardware/trackman`

**State Pages → Cities:**
- Already implemented

**Best By Global → Best By + Location:**
- "See Trackman venues in Chicago" → city-level page

**Related Links:**
- Hardware pages link to related hardware (Trackman ↔ Foresight)
- Vibe pages link to related vibes
- Who-its-for links to related segments

---

## Implementation Order

### Phase 1: Create Missing Pages (P0)
1. City + Amenities page
2. City + Launch Monitor page
3. City + Software page

### Phase 2: Optimize Location Pages (P0)
4. City page — Add SEO sections, FAQs, internal links
5. US Index page — Add SEO sections, FAQs

### Phase 3: Optimize Best By Global Pages (P1)
6. Best index page
7. Best by tag page
8. Best by hardware page
9. Best by vibe page
10. Best by who-its-for page
11. Best by amenities page
12. Best by software page

### Phase 4: Optimize Best By + Location Pages (P1)
13. City + tag page
14. City + hardware page
15. City + vibe page
16. City + who-its-for page
17. City + amenities page (new)
18. City + launch-monitor page (new)
19. City + software page (new)

### Phase 5: Venue Pages (P1)
20. Individual venue page — Review schema, add missing elements

### Phase 6: State Pages (P1)
21. State page — Already good, minor tweaks

---

## Unique Copy Library

### Hardware Categories

**TrackMan:**
TrackMan is the gold standard of golf launch monitors, trusted by PGA Tour pros and top instructors worldwide. Using dual radar technology, it captures every detail of your swing with unmatched precision—ball speed, launch angle, spin rate, and club path. Venues with TrackMan attract serious golfers who want tour-level data and feedback.

When searching for a TrackMan venue, look for facilities with trained staff who can help you interpret the data. The best TrackMan locations offer lesson packages and practice modes alongside entertainment options. Price points typically run higher than camera-based systems, but the accuracy is worth it for players focused on improvement.

**Foresight (GCQuad/GC3):**
Foresight Sports launch monitors use high-speed camera technology to deliver exceptional accuracy, especially on ball spin and impact data. The GCQuad is the go-to choice for club fitters and serious practice facilities—it's the system that actually measures the ball, not just estimates it.

Venues featuring Foresight systems typically attract golfers who care about precision over flashy graphics. Look for locations that use GCQuad for fitting sessions or GC3 for practice bays. The photometric technology works great indoors without the ceiling height requirements of radar systems.

**Uneekor (EYE XO/QED):**
Uneekor launch monitors offer an excellent balance of accuracy and value, using overhead camera systems that track both club and ball data in real-time. The EYE XO and QED have gained a strong following among simulation enthusiasts for their reliable readings and seamless software integration.

What makes Uneekor stand out is the dual-camera setup that captures your swing from above. This means consistent data regardless of lighting conditions, and it works perfectly with popular simulation software like GSPro and E6. Venues with Uneekor systems often offer more competitive pricing while still delivering quality data.

**Full Swing:**
Full Swing simulators power the Tiger Woods experience and countless entertainment venues across the country. Known for immersive graphics and accurate ball tracking, Full Swing systems excel at making indoor golf feel like the real thing.

These systems prioritize the entertainment factor—you'll find them in upscale bars, sports clubs, and dedicated simulation centers. Full Swing venues typically offer multiplayer competitions, famous course libraries, and a social atmosphere. If you're looking for a fun night out with accurate gameplay rather than intense practice, Full Swing delivers.

### Vibe Categories

**Upscale Lounge:**
Some golf simulator venues feel more like private clubs than practice facilities. Upscale lounges combine premium technology with sophisticated atmospheres—think craft cocktails, designer furniture, and attentive service. These spots are perfect for business entertainment, date nights, or when you want your golf session to feel elevated.

Expect higher price points at upscale venues, but you're paying for the complete experience. Many offer private rooms, catering options, and dedicated hosts. The clientele tends to be a mix of serious golfers and social groups who appreciate quality.

**Sports Bar:**
Golf simulator bars have exploded in popularity, combining the social atmosphere of a traditional sports bar with next-level gaming. Picture TVs showing the game, friends around a bay, cold beers, and some of the best wings in town—plus you're playing virtual Pebble Beach.

These venues thrive on group energy. Walk-in availability is usually good during off-peak hours, but weekends get packed. Many run leagues, tournaments, and special events. The vibe is casual and fun—nobody's judging your swing here.

**Tech Lab:**
For golfers obsessed with data, tech lab venues feel like paradise. These facilities prioritize the numbers—multiple camera angles, launch monitor comparisons, and staff who speak fluent TrackMan. You'll find hitting bays optimized for practice, not just entertainment.

Tech labs attract dedicated players working on their games. Expect detailed session reports, video analysis, and equipment fitting capabilities. The atmosphere is focused rather than social—think gym for golfers. Price structures often favor practice packages over hourly rentals.

**Party Atmosphere:**
Some venues were built to celebrate. Party-focused simulators crank up the music, keep the drinks flowing, and make every shanked drive hilarious. Bachelor parties, birthday groups, and corporate outings flock to these spots for good reason.

Entertainment features matter most here—multiplayer games, skill challenges, and formats that keep non-golfers engaged. The best party venues have private rooms, full bars, and food menus that go beyond nachos. Expect higher minimums on weekends and book well in advance for groups.

### Who It's For Categories

**Beginners:**
Starting your golf journey at a simulator venue makes perfect sense. Indoor practice removes weather barriers, eliminates course pace pressure, and gives you instant feedback on every swing. Many beginner-friendly venues offer lessons, rental clubs, and patient staff who've seen every type of first-timer.

Look for locations with lesson packages and low-pressure atmospheres. The best beginner venues invest in instruction—either on-site pros or virtual coaching tools. Avoid peak hours when bays fill with experienced players; weekday mornings and early afternoons give you space to learn.

**Serious Golfers:**
For players working on their games, not every simulator venue cuts it. You need accurate launch monitors, practice-focused bays, and staff who understand the difference between a good session and entertainment time. Serious golfer venues attract low-handicappers, competitive players, and anyone with specific swing goals.

Evaluate venues by their technology stack, lesson availability, and the players you see there. The best serious practice facilities offer structured packages, video analysis, and fitting services. Social distractions should be minimal—you're there to work.

**Families:**
Bringing kids to golf simulators can be amazing or frustrating depending on the venue. Family-friendly locations welcome younger players, offer age-appropriate game modes, and create an atmosphere where a topped drive just means more laughs.

Look for venues with non-golf options (some offer other sports simulations), kid-friendly food menus, and reasonable pricing for families. The best spots have staff comfortable with children and bay configurations that work for mixed age groups. Avoid venues that skew heavily toward nightlife crowds.

**Large Groups:**
Planning a golf outing for 10+ people requires venues built for scale. Large group-friendly facilities offer multiple bays, private rooms, and event coordinators who handle logistics. Corporate outings, bachelor parties, and friend groups all need different setups—the right venue knows how to flex.

When booking large groups, ask about minimum spend requirements, food and drink packages, and booking lead times. The best venues assign dedicated hosts and can handle tournament-style formats. Private space matters—you want your group together, not scattered across a floor.

### Amenity Categories

**Private Rooms:**
Privacy transforms the golf simulator experience. Whether you're working on your swing without audience pressure, hosting a business meeting, or celebrating with close friends, a private room adds real value. These spaces typically include dedicated bays, comfortable seating, and often their own food service.

Expect to pay premiums for private rooms, especially on weekends. Booking windows often open further in advance than general bays. The best private experiences include TV controls, adjustable music, and attentive service without intrusion. Group minimums usually apply.

**Full Bar:**
Adult beverages and golf simulators pair naturally. Venues with full bars offer cocktails, craft beers, and wine selections that elevate the experience beyond the typical sports bar. Some locations employ mixologists who create golf-themed drinks; others stock premium whiskey collections.

Full bar venues attract after-work crowds and social groups. Expect a more lively atmosphere, especially evenings and weekends. Many run happy hour specials or include drinks in bay packages. The best combine quality pours with quality technology—you shouldn't have to sacrifice one for the other.

**Kitchen Food:**
Hot food changes the game. Venues with real kitchens serve more than frozen apps—think craft burgers, wood-fired pizzas, and appetizers designed for sharing around a simulator bay. These spots encourage longer sessions and turn golf into a dining experience.

Full kitchen venues often require food minimums or include food in package pricing. Check menus before booking if food matters to your group. The best spots nail both the golf tech and the kitchen execution—ask locals which venues deliver on both fronts.

**Coaching Available:**
Learning from a pro while using simulator data is powerful. Venues with on-site coaching offer lesson packages, swing analysis, and structured improvement programs. Some employ full-time instructors; others partner with local pros who rent teaching time.

When evaluating coaching options, ask about instructor credentials, lesson formats, and whether they include recorded sessions. The best teaching venues integrate launch monitor data into lessons and provide take-home summaries. Single lessons work for quick fixes; packages deliver real improvement.

### Launch Monitor Categories

**Radar-Based (TrackMan, FlightScope):**
Radar launch monitors use Doppler technology to track the club and ball through impact. TrackMan and FlightScope are the industry leaders—both deliver exceptional accuracy and are trusted on PGA Tour ranges. Radar systems excel at tracking ball flight from launch to landing.

Radar venues typically feature higher ceilings to allow proper ball tracking. The technology works well for both indoor and outdoor settings. Accuracy for ball flight data is exceptional, though some systems estimate rather than measure spin directly. Professional fittings often use radar as the gold standard.

**Photometric/Camera-Based (Foresight, Uneekor, SkyTrak):**
Camera-based launch monitors photograph the ball at impact to capture spin, speed, and launch angle. Foresight, Uneekor, and SkyTrak lead this category. The advantage: direct measurement of the ball rather than extrapolation.

Photometric systems work great in low-ceiling environments and don't require as much ball flight space as radar. Spin accuracy tends to be excellent since cameras actually see the ball rotating. Many venues prefer camera systems for fitting because of their ball data precision. Price points vary widely from entry-level SkyTrak to premium GCQuad.

### Software Categories

**GSPro:**
GSPro has become the favorite simulation software for serious indoor golfers. The course library rivals anything else on the market, graphics are continuously improving, and the price point delivers incredible value. Venues running GSPro attract players who care about course accuracy and realistic gameplay.

What sets GSPro apart is the community-driven development and course creation. You'll find virtual versions of famous tracks that play remarkably close to reality. Competition features, practice modes, and multiplayer options are all strong. Ask venues about their GSPro license and which courses they have available.

**E6 Connect:**
E6 Connect is the polished, premium option in golf simulation software. The graphics are stunning, the course library is well-curated, and the overall experience feels refined. Commercial venues often choose E6 for its professional presentation and reliable performance.

Venues running E6 typically invest in the complete experience—quality projectors, proper screen materials, and maintained equipment. The software integrates smoothly with most launch monitors and offers both entertainment and practice modes. Expect a slightly more upscale feel at E6 venues.

**TGC 2019:**
The Golf Club 2019 offers an enormous course library and satisfying gameplay, making it a popular choice for entertainment-focused venues. While graphics and interface have aged somewhat, the course count and community creations are unmatched.

TGC venues tend to prioritize fun over data. The software includes excellent multiplayer options, course designer tools, and social features. Players who love course variety gravitate toward TGC—you can play virtually any layout that exists in the real world.

---

## FAQ Library

### Hardware FAQs

**General:**
- Q: What's the difference between radar and camera launch monitors?
- Q: How accurate are indoor golf simulators?
- Q: Does launch monitor brand affect my game improvement?

**Location-Specific:**
- Q: How many {brand} venues are in {city}?
- Q: What's the typical price for {brand} simulator time in {city}?
- Q: Which {city} venue has the best {brand} setup?

### Vibe FAQs

**General:**
- Q: What should I wear to an upscale golf simulator lounge?
- Q: Can I bring my own clubs to simulator bars?
- Q: How do I choose between entertainment and practice venues?

**Location-Specific:**
- Q: Which {city} venues are best for date night?
- Q: What are the most social golf simulator spots in {city}?
- Q: Are there family-friendly options in {city}?

### Amenity FAQs

**General:**
- Q: What amenities should I look for in a golf simulator venue?
- Q: Do private rooms cost extra?
- Q: What food options are typical at simulator venues?

**Location-Specific:**
- Q: Which {city} venues have private rooms?
- Q: Where can I find venues with full bars in {city}?
- Q: What {city} locations offer the best food?

---

## Implementation Notes

### File Changes Per Phase

**Phase 1:** Create 3 new page files in `/app/venue/us/[state]/[city]/best/`
- `amenities/[amenity]/page.tsx`
- `launch-monitor/[type]/page.tsx`
- `software/[software]/page.tsx`

**Phase 2-5:** Modify existing page files to add:
- Enhanced metadata generation
- Unique intro copy
- FAQ sections with schema
- Dynamic internal links
- Proper schema markup

### Schema Components Needed

- [ ] `CollectionPageSchema.tsx` — For location and best-by pages
- [ ] `FAQPageSchema.tsx` — For embedding FAQ schema in pages
- [ ] Update existing `CitySchema.tsx` to use CollectionPage
- [ ] Update existing `VenueSchema.tsx` as needed

### Content Components Needed

- [ ] `SeoCopyLibrary.ts` — Centralized unique copy per category
- [ ] `FaqLibrary.ts` — Centralized FAQs per category
- [ ] Update `SeoIndexSections.tsx` — Add FAQ schema injection

---

## Next Steps

1. **Review this plan** with Tim
2. **Start Phase 1** — Create missing city-level best-by pages
3. **Implement page by page** — Show each for review before moving on
4. **Commit after each page type** — Keep changes reviewable
