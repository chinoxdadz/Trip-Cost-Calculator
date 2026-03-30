---
name: car-rental-trip-cost-estimator-ph
description: 'Build a mobile-friendly car rental trip cost estimator for the Philippines. Use when creating a fuel, toll, rental, and driver fee calculator with vehicle presets, live updates, peso formatting, and per-passenger cost breakdowns.'
argument-hint: 'Target file path, optional styling direction, and whether to include stretch goals'
user-invocable: true
---

# Car Rental Trip Cost Estimator (PH)

## What This Skill Does

Use this skill to build a responsive web calculator for a Philippine car rental business. The tool estimates total trip cost and cost per person from travel distance, fuel price, vehicle efficiency, rental fee, toll fees, optional driver fee, and passenger count.

Default output should be a complete working implementation. If the workspace is minimal or the user asks for a single file, prefer one self-contained HTML file with embedded CSS and JavaScript.

## When to Use

- Build a trip cost calculator for a car rental landing page or booking flow
- Create a mobile-first pricing estimator for Philippine road trips
- Add a self-drive versus with-driver pricing toggle
- Generate a live-updating UI with trip cost breakdowns and peso currency formatting

## Required Inputs

Collect or implement fields for:

- Distance in kilometers
- Fuel price in Philippine Peso per liter
- Vehicle type preset
- Rental fee
- Toll fees
- Trip mode: Self-drive or With Driver
- Driver fee, only when With Driver is selected
- Number of passengers

Vehicle presets must be:

- Sedan: 15 km/L
- SUV/Innova: 10 km/L
- Van: 7 km/L

## Required Calculations

Apply these formulas:

- Fuel liters = distance / fuel efficiency
- Fuel cost = fuel liters * fuel price
- Driver cost = driver fee when mode is With Driver, otherwise 0
- Total trip cost = fuel cost + rental fee + toll fees + driver cost
- Cost per person = total trip cost / passengers

Validation rules:

- Never allow division by zero for passengers
- Treat empty or invalid numeric input as 0 unless the UI enforces a minimum
- Hide or disable the driver fee input when Self-drive is selected
- Recalculate immediately whenever any relevant input changes

## Implementation Procedure

1. Create a mobile-first layout.
2. Add a clear form section for trip inputs and a separate summary section for results.
3. Implement a mode toggle for Self-drive and With Driver.
4. Add the three vehicle presets and store their fuel efficiency values in code.
5. Wire input listeners so every change triggers recalculation without a submit button.
6. Compute fuel liters, fuel cost, total cost, and cost per person.
7. Show a full breakdown with at least fuel, toll, rental, and driver line items.
8. Format all monetary output in Philippine Peso.
9. Ensure the interface works cleanly on narrow mobile screens before refining desktop spacing.

## UI Guidance

Aim for a modern calculator feel rather than a plain form.

- Use strong visual hierarchy for the total cost and cost per person
- Keep labels explicit and readable on mobile
- Group related charges in a breakdown card
- Surface the selected vehicle efficiency so the calculation is understandable
- Prefer immediate feedback and visible defaults over hidden state

If the user does not specify a design direction, choose a clean, contemporary layout with:

- One-column mobile layout
- Card-based sections
- Sticky or visually prominent results area on larger screens
- Accessible color contrast and touch-friendly controls

## JavaScript Expectations

Implementation should usually include:

- A preset map or array for vehicle efficiencies
- A single `calculateTripCost` function or equivalent
- A helper for safely reading numeric values from inputs
- A helper for formatting PHP currency, preferably via `Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })`
- Event listeners on all relevant inputs and mode controls
- UI logic that shows or hides the driver fee field based on the selected mode

## Completion Checks

The result is complete only if all of the following are true:

- The calculator updates in real time as values change
- Self-drive excludes driver cost from both calculation and display logic
- With Driver includes the driver fee in the total
- Passenger count cannot produce `Infinity`, `NaN`, or divide-by-zero output
- All money values render in Peso format with the `₱` symbol
- The breakdown clearly lists fuel, toll, rental, and driver amounts
- The page is usable on mobile and desktop widths
- The delivered output is a runnable HTML, CSS, and JavaScript implementation

## Stretch Goals

Add only if the user asks, or if they explicitly request extras:

- Google Maps API distance autofill
- Preset trips such as Tagaytay or airport pickup
- Book Now button linking to an external form
- Save, print, or export trip summary

## Example Prompts

- Build the estimator in `index.html` as a single-file app
- Create a clean mobile calculator UI for a van rental estimator in PHP currency
- Add preset trips and a Book Now button to the trip cost estimator