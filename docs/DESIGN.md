# Part 3 — Design Sensibility & UI

## Design Principles

1. **Clarity over cleverness:** Salespersons need instant answers, not fancy animations.
2. **Progressive disclosure:** Show summary first, details on demand.
3. **Visual hierarchy:** Price totals are prominent; category labels guide scanning.
4. **Mobile-friendly:** Salespersons may use tablets in showrooms.
5. **Fast feedback:** Running totals update instantly as selections change.

## UI Layout (Wireframes)

### Main Navigation
```
┌─────────────────────────────────────────────────────────┐
│  🚲 Hero Cycles Pricing Engine                          │
│  ┌──────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │  Parts   │  │ Configurations │  │  New Config    │  │
│  └──────────┘  └────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Parts Management Page
```
┌─────────────────────────────────────────────────────────┐
│  Parts Management                    [+ Add New Part]   │
├─────────────────────────────────────────────────────────┤
│  Filter: [All Categories ▼]  Search: [____________]     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐    │
│  │ Frame                                           │    │
│  ├─────────────────────────────────────────────────┤    │
│  │ Steel Frame Standard    ₹1,200   [Edit][Delete] │    │
│  │ Aluminium Frame Light   ₹2,800   [Edit][Delete] │    │
│  │ Carbon Fiber Pro        ₹8,500   [Edit][Delete] │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Gear Set                                        │    │
│  ├─────────────────────────────────────────────────┤    │
│  │ Single Speed            ₹500     [Edit][Delete] │    │
│  │ 7-Speed Shimano         ₹1,800   [Edit][Delete] │    │
│  │ 21-Speed Pro            ₹4,200   [Edit][Delete] │    │
│  └─────────────────────────────────────────────────┘    │
│  ...                                                    │
└─────────────────────────────────────────────────────────┘
```

### Configuration Builder Page
```
┌─────────────────────────────────────────────────────────┐
│  New Configuration                                      │
│  Name: [Hero Sprint Pro 2024___________]                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   🖼 Frame    │  │  ⚙ Gear Set  │  │  🔘 Tyres    │  │
│  │              │  │              │  │              │  │
│  │ [Aluminium ▼]│  │ [7-Speed  ▼] │  │ [Road     ▼] │  │
│  │   ₹2,800    │  │   ₹1,800    │  │   ₹600     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  🛑 Brakes   │  │ 🦯 Handlebar │  │  💺 Seat     │  │
│  │              │  │              │  │              │  │
│  │ [Disc     ▼] │  │ [Flat     ▼] │  │ [Comfort ▼] │  │
│  │   ₹1,500    │  │   ₹800     │  │   ₹600     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │  🔗 Chain    │  │  ◎ Wheels    │                    │
│  │              │  │              │                    │
│  │ [Standard ▼] │  │ [Alloy   ▼] │                    │
│  │   ₹350      │  │   ₹2,200    │                    │
│  └──────────────┘  └──────────────┘                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Total Price:  ₹10,650                                 │
│                                                         │
│   [💾 Save Configuration]                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Configuration Detail / Price Breakdown
```
┌─────────────────────────────────────────────────────────┐
│  Hero Sprint Pro 2024                    [Edit][Delete] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Price Breakdown                                        │
│  ┌───────────────────────────────────────────────┐      │
│  │ Category     │ Part              │ Price      │      │
│  ├───────────────────────────────────────────────┤      │
│  │ Frame        │ Aluminium Light   │   ₹2,800  │      │
│  │ Gear Set     │ 7-Speed Shimano   │   ₹1,800  │      │
│  │ Tyres        │ Road Tyres        │     ₹600  │      │
│  │ Brakes       │ Disc Brakes       │   ₹1,500  │      │
│  │ Handlebars   │ Flat Bar          │     ₹800  │      │
│  │ Seat         │ Comfort Seat      │     ₹600  │      │
│  │ Chain        │ Standard Chain    │     ₹350  │      │
│  │ Wheels       │ Alloy Wheels      │   ₹2,200  │      │
│  ├───────────────────────────────────────────────┤      │
│  │ TOTAL        │                   │  ₹10,650  │      │
│  └───────────────────────────────────────────────┘      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Color Palette & Typography

- **Primary:** #1E40AF (deep blue — trustworthy, professional)
- **Accent:** #F59E0B (amber — for prices and CTAs)
- **Background:** #F8FAFC (light gray)
- **Text:** #1E293B (near-black)
- **Font:** Inter (clean, highly readable at all sizes)

## Responsive Behavior

- **Desktop (>1024px):** Full grid layout, side-by-side cards
- **Tablet (768-1024px):** 2-column grid
- **Mobile (<768px):** Single column, stacked cards

## Key UX Decisions

1. **Category cards instead of a table:** Visual grouping makes it easier to scan options.
2. **Running total always visible:** Pinned to bottom on mobile, inline on desktop.
3. **Inline editing for parts:** No separate edit page — click price to edit in place.
4. **Confirmation before delete:** Prevents accidental data loss.
5. **Color-coded categories:** Each category has a subtle color to aid visual scanning.
