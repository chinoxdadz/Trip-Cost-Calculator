# React Parity Checklist

Use this checklist after conversion.

## Route & Map

- Origin + destination route computes correctly.
- Stops are included in route order.
- Route line renders and updates on location changes.
- Start/end/stop markers appear and update correctly.
- Autocomplete selections trigger route recompute.
- Calculate Route fallback button still works.

## Pricing

- Fuel formula: `(distance / kmL) * fuelPrice`.
- Total formula: `fuel + rental + toll + driver(if enabled)`.
- Per-person formula: `total / passengers` with passenger guard >= 1.
- Driver toggle hides/shows driver fee and updates totals.

## Booking

- Booking URL uses mapped Google Form `entry.<id>` values.
- Partial mappings are allowed with visible warnings.
- Required mapping gaps are flagged clearly.

## UX

- Mobile-first layout preserved.
- Buttons, inputs, and cards align with design tokens.
- No regressions in status/error/loading messages.
