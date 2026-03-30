# Car Rental Trip Cost Estimator: Workspace Instructions

## Purpose
This workspace is for building a mobile-friendly car rental trip cost estimator tailored for the Philippines. The main deliverable is a responsive web calculator that estimates total trip cost and cost per person, factoring in:
- Travel distance (km)
- Fuel price (PHP/L)
- Vehicle type (with presets)
- Rental fee
- Toll fees
- Trip mode: Self-drive or With Driver
- Driver fee (if applicable)
- Number of passengers

## Key Conventions
- **Single-file implementation** is preferred for minimal workspaces: use one HTML file with embedded CSS and JavaScript.
- **Vehicle presets**:
  - Sedan: 15 km/L
  - SUV/Innova: 10 km/L
  - Van: 7 km/L
- **Live updates**: UI should update cost breakdowns as inputs change.
- **Peso formatting**: All monetary values must be formatted in PHP (₱) with thousands separators.
- **Mobile-first**: Layout and controls must be touch-friendly and responsive.
- **Driver fee**: Only shown and included in total if "With Driver" mode is selected.
- **Cost per passenger**: Always display this value.

## Anti-patterns
- Do not split logic across multiple files unless the workspace is already structured for it.
- Avoid hardcoding values except for vehicle presets.
- Do not use frameworks or build tools unless explicitly requested.

## Example Prompts
- "Create a car rental trip cost estimator for the Philippines."
- "Add a toggle for self-drive vs with driver."
- "Show cost per passenger and format all prices in PHP."

## Next Steps
- After implementing the estimator, consider adding:
  - Local storage for last-used values
  - Print/export functionality
  - Additional vehicle types or custom efficiency

---
Link, don't embed: If you add more documentation, reference it here instead of duplicating content.
