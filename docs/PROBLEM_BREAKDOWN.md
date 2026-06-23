# Part 1 — Problem Breakdown

## Questions I Thought Of While Solving the Problem

1. **Scope of "configuration":** Does a configuration mean a fixed set of parts (one frame + one gear set + one tyre + etc.), or can a cycle have multiple of the same category (e.g., two tyres)?
2. **Part categories:** What are the exact categories? Frame, Gear Set, Tyres, Brakes, Handlebars, Seat, Chain, Wheels — are there others?
3. **Mandatory vs optional parts:** Are all categories mandatory for a valid configuration, or can some be optional (e.g., a basic cycle might not have gears)?
4. **Price versioning:** When a part price changes, do existing saved configurations retain the old price or update to the new price?
5. **Multi-user access:** Will multiple salespersons use this simultaneously? Do we need user authentication?
6. **Discounts/markup:** Does the total price include any margin, tax, or discount, or is it purely sum-of-parts?
7. **Part compatibility:** Are all parts compatible with each other, or are there constraints (e.g., a racing frame only works with thin tyres)?
8. **Currency:** Is everything in INR (₹)? Do we need multi-currency support?
9. **Audit trail:** Do stakeholders need a history of who changed what price and when?
10. **Data volume:** "Thousands of configurations" — do we need pagination, search, and filters?
11. **Offline access:** Do salespersons need offline access, or is this always connected?
12. **Export capability:** Do they need to export quotes as PDF/Excel for customers?

## Assumptions Made

1. **Fixed categories:** A cycle configuration consists of exactly one part from each of these categories: Frame, Gear Set, Tyres, Brakes, Handlebars, Seat, Chain, Wheels.
2. **All categories mandatory:** Every configuration must have one part from each category to be valid.
3. **No authentication (MVP):** Single-user system for this prototype. No login required.
4. **Live pricing:** Configurations always reflect current part prices (no historical price lock-in for this MVP).
5. **No compatibility rules:** Any part can be combined with any other part (simplification for MVP).
6. **INR only:** All prices in Indian Rupees.
7. **No tax/discount:** Total = sum of part prices. No additional markup for MVP.
8. **Price history tracked:** We store when prices change for auditability.
9. **Web-based:** Browser-based application, always online.
10. **SQLite sufficient:** For a small team prototype, SQLite is adequate. Can migrate to PostgreSQL later.

## User Stories / Use Cases

### US-1: Manage Parts
**As a** salesperson  
**I want to** add, edit, and delete parts with their prices  
**So that** the pricing engine always has up-to-date component costs  

**Acceptance Criteria:**
- Can create a part with name, category, and price
- Can update a part's price (old price is recorded in history)
- Can delete a part that isn't used in any configuration
- Parts are organized by category

### US-2: Create a Cycle Configuration
**As a** salesperson  
**I want to** build a cycle configuration by picking one part from each category  
**So that** I can see the total cost of a specific cycle build  

**Acceptance Criteria:**
- Can give the configuration a name (e.g., "Hero Sprint Pro 2024")
- Must select exactly one part from each category
- Shows running total as parts are selected
- Configuration is saved for future reference

### US-3: View Price Breakdown
**As a** salesperson  
**I want to** see a detailed price breakdown of any configuration  
**So that** I can explain costs to customers component by component  

**Acceptance Criteria:**
- Shows each category, selected part name, and its price
- Shows the grand total
- Breakdown is always based on current prices

### US-4: Browse & Search Configurations
**As a** salesperson  
**I want to** quickly find existing configurations  
**So that** I don't recreate builds I've already priced  

**Acceptance Criteria:**
- Can list all configurations with their total prices
- Can search by configuration name
- Can sort by price or name

### US-5: Track Price Changes
**As a** manager  
**I want to** see when part prices were last updated  
**So that** I know our pricing is current  

**Acceptance Criteria:**
- Each part shows its last updated date
- Price history log available per part
