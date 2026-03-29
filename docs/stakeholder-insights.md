# Stakeholder Insights — Synthesized from Codeathon Kickoff (March 28, 2026)

> Extracted from speaker presentations, Q&A, and team formation discussions.
> Goal: capture what stakeholders actually NEED so we build something that works for them, not just something cool.

---

## Charisse's Core Framework (THE priority hierarchy)

**This is the single most important design input:**

1. **Placement** — WHERE a plant goes (zone 0-5ft, 5-30ft, 30-100ft, near windows, near fences)
2. **Spacing** — HOW FAR APART fuels are (vertical and horizontal connectivity)
3. **Maintenance** — ongoing care, dead material removal, growth management
4. **Plant Selection** — LAST, not first

> "For the last many years, it seems like the focus has been entirely on plant selection."

**Why this matters for us:** Our app CANNOT be just a plant picker. If someone searches plants without first understanding their zones, spacing, and maintenance commitments, we've failed. The AI agent should lead with placement/spacing/maintenance questions BEFORE recommending plants.

**"Own the fuels, own the fire."** — Personal responsibility framing. The app should empower, not prescribe.

### Charisse on plant lists:
- She **hates** simplistic plant lists (the city's current lists are too reductive)
- Lists don't capture maintenance or spacing
- Lists "condemn whole groups" (like all natives) when the issue is actually context
- Her database IS different — it has placement codes, character scores, risk reduction rules
- **The power is in the NUANCE**, not the list itself

### Charisse on native plants:
- 250 native plants identified in the database for landscaping use
- "All plants burn" — natives aren't more dangerous, they're fire-adapted
- Natives support pollinators, soil health, drought resistance AND have fire reluctance
- After fires, natives are what return naturally
- **Don't condemn natives — enable informed choices about them**
- Many natives are also deer-resistant (double win)

### Charisse on data confidence:
- Data has PROVENANCE — sources tracked for every value
- Wants the data to be "easier to update" and wants to "feel confident in the data"
- Benjamin procured 38 additional databases + 100 academic texts for enrichment
- Needs conflict resolution UI when sources disagree
- **Key question from Annie: "Is the data easier for Charisse to update?"**

### Charisse on accessibility:
- "One of my big hopes is that this tool is made accessible"
- "I need a marketing strategy to reach every demographic"
- Current education efforts reach older, more affluent populations
- Socially vulnerable populations don't come to events
- "We always sample the same population... we need to broaden our outreach significantly"
- Did extraordinary work going to lower-income communities for CWPP

---

## Dennis Holeman — Systems Engineer (SRI, retired)

**Role at Mountain Meadows HOA:** Wrote the rules and regulations, updating them with new landscaping standards.

### Key insight: ENFORCEABLE DOCUMENTATION
> "If it's not written down, it's not enforceable."

**What he needs:**
- App that generates **rules and regulations** HOAs can adopt
- Compliance-ready documentation that fits into CC&R frameworks
- Standards that are specific enough to enforce but flexible enough to accommodate Charisse's nuance

### His success metric:
> "An app that we can recommend in our homeowners association as approved for adoption by all of the associations."

### From his email — expanded user categories:
1. Property owners (homeowners, landlords, commercial)
2. HOA/condo association boards
3. Property management companies
4. Residents (renters)
5. Developers
6. Landscapers
7. Nurseries
8. City planning staff (codes, permits)
9. Insurance groups (brokers, carriers)
10. Property law entities
11. Fire safety associations (Firewise USA, etc.)
12. Standards bodies
13. Grant-providing agencies

### His systems engineering lens:
- User interface usability is KEY
- Design for evolution over time
- Define interfaces between major components early
- Measures of effectiveness / measures of performance
- "By doing this work in a disciplined way at the front end, a lot of unnecessary effort and rework can be avoided"

---

## Lori Kaplan — Ashland Climate Collaborative

### Key insight: COMMUNITY CONNECTIVITY
> "If our neighbors aren't on the same page with us, that could dramatically reduce the effectiveness of the steps we've taken ourselves."

**What she needs:**
- Tools that help NEIGHBORHOODS coordinate, not just individual homeowners
- Social/community features — inventory who lives where, what resources they have
- Firewise community support (some existing, some need structure)
- Connection to the Community Wildfire Protection Plan (CWPP) actions

### Critical context:
- Applied for state funding with Charisse — DID NOT GET THE GRANT (Jan 2026)
- This is now a "guerrilla effort" — community-driven, not government-funded
- 3-4 active neighborhood groups already exist
- Firewise communities exist but are not currently funded
- "The great desire in the community to do this work together" — the will is there, the tools aren't

### Scaling insight:
> "50% of the people in this country live in communities under 50,000. We have 21,000. We need to find out how communities of this size respond to this threat."
> "We are modeling practices that can be replicated in other communities."

---

## Bob — Ashland City Councilor

### Key insight: 90/10 GOAL
- CWPP goal: **90% risk reduction coverage in 10 years**
- Whole city declared wildfire hazard zone
- $60 million estimated liability to bring community under control
- City has $7/month utility fee for fire mitigation (used to be $3.50)

### What the city can do:
- Building codes (new construction already fire-resistant)
- Plant lists (but they're blunt instruments)
- Strategic planning (undergoing city strategic plan NOW)
- Budget: biannual, next budget requests come in fall, reviewed next spring

### What the city CANNOT do alone:
- Force existing homeowners to change landscaping (education + incentives needed)
- Control insurance industry decisions
- Fund the full $60M

### His commitment:
- Willing to advocate for operational funding for tools like this
- Will bring it to budget discussions

---

## Ralph Bloomers — Coal Alliance / Fire Safe Communities

### Key insight: IT'S ABOUT EMBERS, NOT FLAMES
> "What we're dealing with is a blizzard of embers... those embers are trying to find small stuff."

**Design implications:**
- Focus on what CATCHES embers near the house (bark mulch, dead material, connected vegetation)
- "A great catch for ember that won't sustain combustion" — that's the metric
- Some plants (ficus, jade) outperform building materials in fire reluctance
- Juniper is dangerous because it's NOT MAINTAINED, not inherently
- Maintenance + arrangement > plant selection (confirms Charisse's hierarchy)

### Make it BEAUTIFUL and FUN
> "We have to make this fun. How can this be fun?"
> "We can make this beautiful, livable, and ecologically meaningful."

**Cultural shift framing:**
- "I got my windows back" — seeing it as gaining something, not losing plants
- Stylish hardscape is attractive
- Social contagion: "Once you have 30-40-50% of the neighborhood doing it, the rest will catch up"
- Pitched Scott Brothers (HGTV) on "Wildfire Ready Makeover Show" with Ashland as community
- References: Firesmart Yards in Marin, Washington DNR's "Come On Barbie" campaign

### Insurance connection:
- IBHS Wildfire Prepared Home certification
- State Farm CEO indicated discount for certified homes coming
- Lost his own insurance recently
- "If you have nothing in the zero-to-five zone, you are far more likely to be insurable"

---

## Woolsey McKernan — Viridian (Wildfire Finance)

### Key insight: MONEY — $120B unmitigated risk, $2K-$15K per property

**Financial model:**
- Treat fire mitigation as INFRASTRUCTURE (like schools, hospitals, roads)
- Finance it like infrastructure with municipal bonds
- Ashland's $7/month utility fee could back bond issuance
- Bring future money forward to fund work TODAY

### What he needs from the app:
- Trackable data on community progress
- Analytics that can be presented to funders/bond markets
- Evidence of adoption rates and risk reduction
- Portfolio-level views (community-wide, not just individual)

> "If we're able to create a tool that actually is not only for residence owners but members of residences that are part of an HOA, we created a solution where the user registry was HOAs can sign up and then they can invite residence owners in."

---

## Other Participants' Key Ideas

### Benjamin (Data Steward)
- Procured 38 additional databases + 100 academic texts
- Building conflict resolution system for multiple data sources
- "Informed choice is the actual power... I don't like your list. I'm situationally bound."
- Provenance and transparency are essential

### Mark Morrison (CPAC Chair)
- Pipeline friction: homeowner → someone → someone → landscaper = too many steps
- AR/camera walkthrough: point phone at yard, AI identifies plants, cross-references database
- Maintenance calendar with text message reminders ("Did you do this? Take a photo.")
- Yearly check-in tracking

### The "Social Pressure" Ideas
- HOA peer pressure: "70% of the HOA did it. You didn't."
- Gamification: pollinator score, fire safety score, community leaderboard
- In-group/out-group dynamics: "I know this, you don't" as motivator
- Community feedback loop designed from the beginning

### Garen Herbert — Tower Defense Game
- Fire-themed tower defense game as "accidental education"
- Budget-constrained plant defense building
- "Not letting the perfect be the enemy of the good"
- Start simple ($100 budget, 4 hours), scale up to HOA complexity

---

## What Success Looks Like (from stakeholders directly)

| Person | Success = |
|--------|-----------|
| **Charisse** | Data easier to update, confident in it. Homeowners feel empowered, not told what's wrong. Accessible to every demographic. |
| **Dennis** | App adoptable by HOA governing documents. Recommended for all associations. |
| **Lori** | Tool that connects community members. Something replicable for other communities. |
| **Bob** | Super easily accessible app. Start sharing immediately. |
| **Ralph** | Something that could become a national/statewide product. Beautiful and fun. |
| **Woolsey** | Trackable data for funders. HOA sign-up model with residence owner invites. |

---

## Critical Gaps We Should Address in LWF2

### 1. The Priority Hierarchy in UX Flow
Our current flow: address → map → browse plants → chat
**Should be:** address → map → zones → placement/spacing guidance → THEN plants
The AI agent should teach the framework before recommending species.

### 2. Maintenance as a First-Class Feature
- Not just "what to plant" but "how to maintain what you plant"
- Growth projections: "In 3 years, these plants will connect if not pruned"
- Maintenance calendar/reminders
- Oregon HOAs already keep 30-year reserve plans — we can integrate

### 3. Community/Neighborhood Layer
- Neighborhood groups (not just individual users)
- Aggregate view of community progress
- Peer visibility ("your neighbors are doing this")
- Firewise community certification pathway support

### 4. Compliance Document Generation (Dennis's ask)
- Generate CC&R-compatible landscaping rules
- Exportable compliance reports for HOAs
- Documentation that satisfies insurance requirements
- Wildfire Prepared Home certification pathway

### 5. The Data Confidence Problem
- Multiple sources, conflicting claims
- Need transparent provenance display
- "Why does the database say this?" should be answerable
- Charisse's expertise as the arbiter, but AI assists with conflict flagging

### 6. Financial/Insurance Connection
- Property-level risk scoring that maps to insurance frameworks
- Firewise/IBHS certification progress tracking
- Cost estimation for mitigation work ($2K-$15K per property)
- Grant eligibility helper
