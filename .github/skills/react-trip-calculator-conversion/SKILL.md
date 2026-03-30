---
name: react-trip-calculator-conversion
description: 'Convert single-file trip calculator HTML/CSS/JS into a modular React app with Map, RouteInputs, StopsInputs, TripDetails, Results, and BookingButton while preserving feature parity.'
argument-hint: 'Source file path, preferred React structure, and whether to keep CSS or use CSS modules'
user-invocable: true
---

# React Trip Calculator Conversion

## What This Skill Produces

A modular React implementation of the calculator with the same behavior as the HTML version:
- Route inputs and stop management
- Mapbox autocomplete and route updates
- Driver mode and fare calculations
- Google Form prefill booking link

## Target Component Split

- `Map`
- `RouteInputs`
- `StopsInputs`
- `TripDetails`
- `Results`
- `BookingButton`

## Procedure

1. Analyze current HTML/JS responsibilities.
2. Define shared state shape and derived selectors.
3. Move pricing formulas to pure helpers.
4. Build components in this order: inputs, map, details, results, booking.
5. Wire Mapbox effects with `useEffect` and cleanup.
6. Port autocomplete and route recompute triggers.
7. Port Google Form prefill generator.
8. Execute [parity checklist](./assets/parity-checklist.md).

## Completion Checks

- Feature parity is maintained for route, stops, pricing, and booking URL prefill.
- UI spacing and mobile behavior match existing premium style.
- No secret tokens are exposed.

## Example Prompts

- Convert my HTML calculator to React with full parity and reusable components.
- Split Mapbox logic into a dedicated `Map` component and keep pricing pure.
- Migrate booking prefill generation to a reusable React utility.
