---
name: google-form-mapping-extraction-validation
description: 'Extract and validate Google Form entry IDs from raw form HTML, map fields to calculator data, and generate prefill URLs. Use for booking integration, form mapping audits, and partial mapping warnings.'
argument-hint: 'Raw Google Form HTML, required calculator fields, and target form URL'
user-invocable: true
---

# Google Form Mapping Extraction & Validation

## What This Skill Produces

A browser-safe JavaScript tool that:
- Parses raw Google Form HTML
- Extracts `entry.<id>` fields with best-effort labels
- Validates required and optional mapping keys
- Allows partial mapping with warnings
- Generates a prefill URL function for calculator booking data

## When to Use

- Integrating Google Form booking from a trip calculator
- Verifying form field IDs after Google Form changes
- Building prefill links with clear required-field checks

## Required Calculator Keys

Required keys:
- origin
- destination
- vehicleType
- distance
- total
- perPerson
- driverToggle

Optional keys:
- stops

## Procedure

1. Load the raw Google Form HTML as a string.
2. Run [extract-and-map.js](./scripts/extract-and-map.js).
3. Inspect extracted `fields` and choose ID mappings.
4. Validate mapping with required keys.
5. Generate prefill URL using calculator data object.
6. Show warnings for missing optional or unmapped entries.

## Completion Checks

- All required keys map to existing `entry.<id>` fields
- Partial mappings are allowed but warnings are shown
- Generated prefill URL contains encoded query params
- Tool runs in browser without external libraries

## Example Prompts

- Extract Google Form entry IDs from this HTML and map them to calculator fields
- Validate my field mapping and generate a robust prefill URL builder
- Build a browser helper for partial Google Form mapping with warnings
