---
name: trip-calculator-route-pricing-testing
description: 'Test route and pricing correctness for trip calculator flows. Use for regression checks on distance, cost formulas, and Google Form prefill URL generation using sample trip fixtures.'
argument-hint: 'App URL or function entry points, sample trips, and expected totals'
user-invocable: true
---

# Trip Calculator Route & Pricing Testing

## What This Skill Produces

A reusable testing workflow and scripts for validating:
- Distance-to-pricing calculations
- Driver mode behavior
- Per-person totals
- Booking prefill URL output

## Procedure

1. Define fixtures for origin, stops, destination, and expected distances.
2. Define fare fixtures for fuel price, rental, toll, driver, and passengers.
3. Compute expected outputs using pure formula helpers.
4. Compare app outputs against expected values.
5. Validate Google Form prefill URL params.
6. Print clear mismatch reports.
7. Run in regression mode after calculator updates.

## Included Script

- [calc-regression.js](./scripts/calc-regression.js)

## Completion Checks

- Every fixture passes formula checks.
- Mismatches include field name, expected value, and actual value.
- New fixtures can be added without changing core script logic.

## Example Prompts

- Add regression fixtures for Laguna, Tagaytay, and Batangas routes.
- Validate my prefill URL output against expected `entry.<id>` mapping.
- Create a CI-friendly summary from calculator regression tests.
