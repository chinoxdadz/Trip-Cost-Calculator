---
name: premium-mapbox-trip-calculator-ph
description: 'Build a premium mobile-first Philippines trip cost calculator with Mapbox GL JS and Directions API. Use for multi-stop routing, autocomplete inputs, real-time fuel and total cost computation, self-drive or with-driver pricing, and Google Form booking prefill links.'
argument-hint: 'Target file path, Google Form prefill entry IDs, and optional visual style notes'
user-invocable: true
---

# Premium Mapbox Trip Cost Calculator (PH)

## What This Skill Produces

A production-ready single-file web calculator (HTML, CSS, JS) for Philippine car rental pricing with:
- Origin, destination, and dynamic stops
- Mapbox autocomplete and route rendering
- Distance-aware cost calculation
- Driver mode toggle and live totals
- Book Now button that opens a Google Form prefilled with trip details

Default output mode:
- Single-file HTML/CSS/JS implementation in the workspace

Optional branch:
- Multi-file React conversion branch only when explicitly requested

Scope:
- Project-only workspace customization

## When to Use

Use this skill when the user asks for one or more of the following:
- Multi-stop trip estimator for a car rental website
- Mapbox route integration with autocomplete
- Fuel, toll, rental, and driver fee computation in PHP
- Mobile-first premium UI for transport pricing
- Google Form booking integration from calculator values

## Inputs To Collect

Required functional inputs:
- Origin (text)
- Destination (text)
- Stops list (0..5, recommend max 5 for UX and performance)
- Fuel price (PHP/L)
- Vehicle preset (km/L)
- Rental fee
- Toll fee
- Trip mode: Self-drive or With Driver
- Driver fee (only when With Driver)
- Passenger count

Required integration inputs:
- Mapbox public token placeholder (never secret token)
- Google Form base URL
- Google Form prefill entry IDs for mapped fields

## Decision Flow

1. Map setup decision:
- If token is missing or placeholder: keep UI usable, show clear route error, skip map calls
- If token is present: initialize map and enable all route features

2. Route mode decision:
- If there are no stops: route from origin to destination
- If stops exist: route origin -> stop1 -> ... -> stopN -> destination

3. Location validity decision:
- If any required location is unresolved from autocomplete/geocode: block route calculation and show inline error
- If all required points resolve: fetch and render route

4. Pricing mode decision:
- Self-drive: driver fee = 0 and input hidden
- With Driver: include driver fee and show input

5. Booking decision:
- If Google Form config is complete: build prefill URL and open in new tab
- If missing entry IDs for some fields: allow partial mapping, show warning for omitted fields
- If form URL itself is missing: keep button disabled and show actionable message

## Implementation Procedure

1. Build mobile-first card layout
- Top card: route inputs and route controls
- Mid card: map canvas and route metrics
- Bottom card: fare inputs, mode toggle, and results
- Keep touch targets large and spacing consistent

2. Define app state and constants
- Map state: map instance, line source id, marker refs
- Route state: origin, destination, stops, distanceKm, durationSec
- Pricing state: fuelPrice, vehicleKml, rentalFee, tollFee, withDriver, driverFee, passengers
- Constants for vehicle presets and currency formatter

3. Build dynamic stops UI
- Add Add Stops / Remove Stops controls
- Add stop input rows with remove buttons per row
- Keep stop order explicit (Stop 1, Stop 2, ...)
- Reindex labels after add/remove
- Enforce a max of 5 stops and show a friendly limit message when reached

4. Add Mapbox autocomplete for all location fields
- Use Geocoding API with debounce
- Show suggestion dropdown under each route field
- On selection, store both place label and coordinates
- Hide stale suggestions and prevent out-of-order async updates
- Trigger route recompute automatically after valid selection (origin, destination, or stop)

5. Validate and build route coordinates
- Ensure origin and destination are selected or geocoded
- Resolve each stop coordinate in order
- Construct waypoint string for Directions API
- Keep explicit Calculate Route button as fallback for manual retry

6. Fetch route and render map
- Request driving route from Directions API
- Read total distance and duration from response
- Draw route polyline source/layer
- Render start/end markers and stop markers
- Fit map bounds to all coordinates

7. Wire live pricing calculations
- Fuel liters = distanceKm / vehicleKml
- Fuel cost = fuelLiters * fuelPrice
- Driver cost = withDriver ? driverFee : 0
- Total = fuel + rental + toll + driver
- Per person = total / max(passengers, 1)
- Recompute on every relevant input and on route updates

8. Implement Google Form prefill booking
- Build URLSearchParams using entry.<id> keys
- Include origin, destination, stops, vehicle, distance, total, perPerson, mode, and optional driverFee
- Open prefilled link in new tab on Book Now click
- If some field mappings are missing, submit available mappings and show a warning summary

9. Add resilience and UX feedback
- Loading state for route fetch
- Error state for invalid places or API failures
- Disabled actions when prerequisites are missing
- Clear empty state text before first route is calculated

## Calculation Rules

Use these formulas exactly:
- Fuel cost = (distance / kmL) * fuel price
- Total cost = fuel + rental + toll + driver fee (if selected)
- Per-person cost = total / passengers

Validation rules:
- Treat invalid numeric input as 0
- Never allow passengers <= 0 in division
- Hide or disable driver fee when self-drive is active
- Route distance should be rounded to 2 decimals before display/use

## Google Form Prefill Mapping Pattern

Typical mapping strategy:
- origin -> entry.<id>
- destination -> entry.<id>
- stops joined string -> entry.<id>
- vehicle label -> entry.<id>
- distanceKm -> entry.<id>
- trip mode -> entry.<id>
- total -> entry.<id>
- perPerson -> entry.<id>
- optional driver fee -> entry.<id>

Use URLSearchParams to avoid manual encoding bugs.

## Completion Checks

A build is complete only when all checks pass:
- Multi-stop routing works and includes every stop in order (up to 5)
- Autocomplete works for origin, destination, and all stops
- Invalid/empty locations are blocked with clear feedback
- Map shows route line + start/end markers + stop markers
- Distance and estimated duration update after route compute
- Route recomputes automatically after autocomplete selection and stop changes
- Explicit Calculate Route button still works as fallback
- Costs update in real time from both route and fare inputs
- Driver toggle correctly controls both UI and totals
- Book Now opens a Google Form with mapped prefilled values and warns on unmapped fields
- UI is clean and usable on narrow mobile widths and desktop

## Example Prompts

- Build a single-file premium PH trip calculator with Mapbox autocomplete, dynamic stops, and Google Form booking prefill
- Add Add Stops/Remove Stops controls and ensure route distance includes every stop in Directions API calls
- Improve my existing calculator with robust waypoint routing, map markers, and booking URL prefill mapping
- Convert this single-file calculator into a React multi-file branch while preserving booking prefill behavior

## Common Pitfalls To Avoid

- Using a secret Mapbox token in frontend code
- Mixing typed text with unresolved coordinates without validation
- Forgetting to update route when stop order changes
- Dropping stop markers during rerenders
- Dividing by zero when passenger input is empty or 0
- Hardcoding Google Form entry IDs without confirming actual field mapping
