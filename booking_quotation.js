/**
 * booking_quotation.js
 *
 * Polished Google Form booking integration for the KM Car Rental Trip Calculator.
 * Builds a pre-filled Google Form URL from the live calculator state, collects
 * the customer's personal details via an accessible in-app modal, then opens the
 * Google Form in a new tab with everything ready to submit.
 *
 * Exports:
 *   showBookingModal(state, costs) — render and open the booking modal
 *   computeCosts(state)            — compute current trip costs from the DOM
 */

/* ═══════════════════════════════════════════════════════════════
   CONFIG — Google Form URL + entry ID map
   ═══════════════════════════════════════════════════════════════ */

const FORM_VIEWFORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSfQ-7AuR4zNridRgakKTZDDwKrsiOMNI7P4JjbMXU0Hl_uzVA/viewform";

/**
 * Google Form field → entry ID mapping.
 * Source: form_raw.txt (KM Car Rental Booking Form).
 */
const ENTRY = Object.freeze({
    fullName:        "entry.1562089729",  // Short answer — customer full name
    contactNumber:   "entry.2066773529",  // Short answer — phone number
    rentalDate:      "entry.1031548128",  // Date picker  — YYYY-MM-DD
    duration:        "entry.1519551846",  // Short answer — trip duration string
    serviceType:     "entry.354042077",   // Radio        — "Self-Drive" | "With Driver"
    seatingCapacity: "entry.1945359180",  // Radio        — "5 seater" | "7 seater" | "Van"
});

/**
 * Maps fuel efficiency (km/L) → Google Form "Seating Capacity" option.
 * These thresholds MUST match the vehicle presets in index.html:
 *   Sedan     → 15 km/L  →  "5 seater"
 *   SUV/Innova → 10 km/L →  "7 seater"
 *   Van        →  7 km/L →  "Van"
 */
const SEATING_MAP = [
    { minEff: 14, label: "5 seater" },  // Sedan  ≥ 14 km/L
    { minEff:  9, label: "7 seater" },  // SUV    ≥  9 km/L
    { minEff:  0, label: "Van"      },  // Van    < 9 km/L
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

const _phpFmt = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

function _fmt(value) {
    return _phpFmt.format(Math.max(0, value));
}

function _fmtDuration(seconds) {
    const mins = Math.max(0, Math.round(seconds / 60));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
}

function _seatingFromEff(kmPerLiter) {
    const eff = Number(kmPerLiter) || 0;
    return (SEATING_MAP.find((v) => eff >= v.minEff) ?? SEATING_MAP.at(-1)).label;
}

function _escHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function _truncate(str, max) {
    return str.length > max ? `${str.slice(0, max - 1)}\u2026` : str;
}

function _safeNum(id) {
    const v = Number.parseFloat(document.getElementById(id)?.value);
    return Number.isFinite(v) && v >= 0 ? v : 0;
}

/* ═══════════════════════════════════════════════════════════════
   URL BUILDER
   ═══════════════════════════════════════════════════════════════ */

function _buildPrefillUrl({ name, contact, date, state }) {
    const params = new URLSearchParams({ usp: "pp_url" });

    if (name.trim())    params.set(ENTRY.fullName,        name.trim());
    if (contact.trim()) params.set(ENTRY.contactNumber,   contact.trim());
    if (date)           params.set(ENTRY.rentalDate,      date);

    const durationSec = state.route?.durationSec || 0;
    if (durationSec > 0) params.set(ENTRY.duration, _fmtDuration(durationSec));

    params.set(ENTRY.serviceType, state.withDriver ? "With Driver" : "Self-Drive");

    const eff = document.getElementById("vehicleType")?.value;
    if (eff) params.set(ENTRY.seatingCapacity, _seatingFromEff(eff));

    return `${FORM_VIEWFORM_URL}?${params.toString()}`;
}

/* ═══════════════════════════════════════════════════════════════
   MODAL STYLES  (injected once into <head>)
   ═══════════════════════════════════════════════════════════════ */

const _MODAL_CSS = /* css */`
/* ── Backdrop ──────────────────────────────────────────────────── */
.bq-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(24, 34, 48, 0.52);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.22s ease;
}
@media (min-width: 540px) {
    .bq-backdrop { align-items: center; padding: 20px; }
}
.bq-backdrop.bq-open { opacity: 1; }

/* ── Dialog ─────────────────────────────────────────────────────── */
.bq-dialog {
    background: #fff;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -8px 48px rgba(24, 34, 48, 0.2);
    width: 100%;
    max-width: 480px;
    max-height: 92dvh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    transform: translateY(36px);
    transition: transform 0.3s cubic-bezier(0.34, 1.18, 0.64, 1);
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
}
@media (min-width: 540px) {
    .bq-dialog {
        border-radius: 20px;
        box-shadow: 0 24px 72px -16px rgba(24, 34, 48, 0.48);
        transform: scale(0.94) translateY(12px);
        max-height: 90dvh;
    }
}
.bq-backdrop.bq-open .bq-dialog { transform: translateY(0); }
@media (min-width: 540px) {
    .bq-backdrop.bq-open .bq-dialog { transform: scale(1) translateY(0); }
}

/* ── Drag handle (mobile only) ──────────────────────────────────── */
.bq-handle {
    width: 38px;
    height: 4px;
    background: #D7DDE5;
    border-radius: 999px;
    margin: 12px auto 0;
    flex-shrink: 0;
}
@media (min-width: 540px) { .bq-handle { display: none; } }

/* ── Header ─────────────────────────────────────────────────────── */
.bq-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px 0;
    flex-shrink: 0;
}
.bq-header-icon {
    width: 38px;
    height: 38px;
    background: #E7F6F3;
    border-radius: 11px;
    display: grid;
    place-items: center;
    font-size: 1.2rem;
    flex-shrink: 0;
}
.bq-header-text { flex: 1; min-width: 0; }
.bq-title {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 800;
    color: #182230;
    line-height: 1.25;
}
.bq-subtitle {
    margin: 2px 0 0;
    font-size: 0.77rem;
    color: #5F6C7A;
}
.bq-close {
    background: #F1F4F8;
    border: none;
    cursor: pointer;
    border-radius: 50%;
    width: 34px;
    height: 34px;
    font-size: 1.05rem;
    color: #5F6C7A;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;
    line-height: 1;
}
.bq-close:hover  { background: #E2E7EE; color: #182230; }
.bq-close:focus  { outline: 2px solid #0C7A69; outline-offset: 2px; }

/* ── Body ────────────────────────────────────────────────────────── */
.bq-body {
    padding: 14px 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
}

/* ── Trip summary card ───────────────────────────────────────────── */
.bq-summary {
    background: linear-gradient(135deg, #E7F6F3 0%, #f6fffc 100%);
    border: 1px solid #B5E1D8;
    border-radius: 14px;
    padding: 13px 14px;
    display: grid;
    gap: 8px;
}
.bq-summary-route {
    font-size: 0.88rem;
    font-weight: 700;
    color: #0C7A69;
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    flex-wrap: wrap;
}
.bq-summary-route span {
    color: #395064;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 38%;
}
.bq-route-arrow {
    flex-shrink: 0;
    color: #0C7A69;
}
.bq-summary-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 5px 8px;
}
.bq-pill {
    font-size: 0.77rem;
    color: #2A4A60;
    background: rgba(255,255,255,0.75);
    border: 1px solid #C8E8E1;
    border-radius: 999px;
    padding: 3px 10px;
    font-weight: 600;
    white-space: nowrap;
}
.bq-divider {
    height: 1px;
    background: #CBE9E3;
    margin: 0;
    border: none;
}
.bq-costs-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
}
.bq-total-cost {
    font-size: 1.55rem;
    font-weight: 800;
    color: #0C7A69;
    letter-spacing: -0.5px;
    line-height: 1;
}
.bq-total-label {
    font-size: 0.68rem;
    color: #5F6C7A;
    margin-top: 2px;
    font-weight: 500;
}
.bq-per-person {
    text-align: right;
}
.bq-per-person-value {
    font-size: 1rem;
    font-weight: 700;
    color: #1B2C3F;
}
.bq-per-person-label {
    font-size: 0.68rem;
    color: #5F6C7A;
    margin-top: 1px;
}

/* ── Pre-filled chips ────────────────────────────────────────────── */
.bq-prefill-section { display: grid; gap: 6px; }
.bq-section-label {
    font-size: 0.72rem;
    color: #5F6C7A;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 0;
}
.bq-chips-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
.bq-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #F1F4F8;
    border: 1px solid #D7DDE5;
    border-radius: 999px;
    padding: 4px 11px;
    font-size: 0.79rem;
    font-weight: 600;
    color: #2A4A60;
}
.bq-chip-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #0C7A69;
    flex-shrink: 0;
}

/* ── Form fields ─────────────────────────────────────────────────── */
.bq-fields { display: flex; flex-direction: column; gap: 10px; }
.bq-field  { display: grid; gap: 5px; }
.bq-label  {
    font-size: 0.81rem;
    font-weight: 700;
    color: #182230;
    display: flex;
    align-items: center;
    gap: 4px;
}
.bq-req { color: #D14343; font-size: 0.7rem; font-weight: 600; }
.bq-input {
    width: 100%;
    border: 1.5px solid #D7DDE5;
    border-radius: 12px;
    padding: 11px 14px;
    font-size: 0.97rem;
    font-family: inherit;
    color: #182230;
    background: #fff;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
    min-height: 44px;
    -webkit-appearance: none;
}
.bq-input::placeholder { color: #A0AEBF; }
.bq-input:focus {
    border-color: #0C7A69;
    box-shadow: 0 0 0 3px rgba(12, 122, 105, 0.14);
}
.bq-input.bq-invalid {
    border-color: #D14343;
    box-shadow: 0 0 0 3px rgba(209, 67, 67, 0.1);
}
.bq-err {
    font-size: 0.75rem;
    color: #D14343;
    margin: 0;
    min-height: 0;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.18s ease, opacity 0.18s ease;
    opacity: 0;
}
.bq-err.bq-show { max-height: 24px; opacity: 1; }

/* ── Footer ─────────────────────────────────────────────────────── */
.bq-footer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 2px;
}
.bq-btn-submit {
    background: linear-gradient(135deg, #0C7A69 0%, #06695a 100%);
    color: #fff;
    border: none;
    cursor: pointer;
    font-weight: 800;
    font-family: inherit;
    font-size: 0.97rem;
    width: 100%;
    padding: 14px 16px;
    border-radius: 12px;
    min-height: 48px;
    box-shadow: 0 4px 16px rgba(12, 122, 105, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
    position: relative;
    overflow: hidden;
}
.bq-btn-submit::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.1);
    opacity: 0;
    transition: opacity 0.18s ease;
}
.bq-btn-submit:hover  { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(12, 122, 105, 0.38); }
.bq-btn-submit:hover::after { opacity: 1; }
.bq-btn-submit:active { transform: translateY(0);    box-shadow: 0 2px 8px rgba(12, 122, 105, 0.2); }
.bq-btn-submit:focus  { outline: 2px solid #0C7A69; outline-offset: 3px; }
.bq-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-size: 0.75rem;
    color: #8898A8;
    margin: 0;
    text-align: center;
}
`;

/* ═══════════════════════════════════════════════════════════════
   MODAL HTML BUILDER
   ═══════════════════════════════════════════════════════════════ */

function _buildSummaryHtml(state, costs) {
    const origin = _truncate(state.origin?.text || "Pickup point", 30);
    const dest   = _truncate(state.destination?.text || "Drop-off point", 30);
    const km     = (state.route?.distanceKm || 0).toFixed(2);
    const dur    = state.route?.durationSec > 0 ? _fmtDuration(state.route.durationSec) : null;
    const pax    = Math.max(1, Math.floor(Number(document.getElementById("passengers")?.value) || 1));

    const vehicleEl    = document.getElementById("vehicleType");
    const vehicleLabel = vehicleEl?.options[vehicleEl.selectedIndex]?.text?.split("(")[0].trim() || "Vehicle";
    const service      = state.withDriver ? "With Driver" : "Self-Drive";

    return `
        <div class="bq-summary-route">
            <span>${_escHtml(origin)}</span>
            <svg class="bq-route-arrow" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>${_escHtml(dest)}</span>
        </div>
        <div class="bq-summary-meta">
            <span class="bq-pill">&#x1F4CF; ${_escHtml(km)} km</span>
            ${dur ? `<span class="bq-pill">&#x23F1; ${_escHtml(dur)}</span>` : ""}
            <span class="bq-pill">&#x1F697; ${_escHtml(vehicleLabel)}</span>
            <span class="bq-pill">&#x1F91D; ${_escHtml(service)}</span>
            <span class="bq-pill">&#x1F465; ${_escHtml(String(pax))} pax</span>
        </div>
        <hr class="bq-divider" aria-hidden="true">
        <div class="bq-costs-row">
            <div>
                <div class="bq-total-cost">${_escHtml(_fmt(costs.total))}</div>
                <div class="bq-total-label">Total trip cost</div>
            </div>
            <div class="bq-per-person">
                <div class="bq-per-person-value">${_escHtml(_fmt(costs.perPerson))}</div>
                <div class="bq-per-person-label">per person</div>
            </div>
        </div>
    `;
}

function _buildChipsHtml(state) {
    const eff         = document.getElementById("vehicleType")?.value;
    const seating     = eff ? _seatingFromEff(eff) : null;
    const service     = state.withDriver ? "With Driver" : "Self-Drive";
    const dur         = state.route?.durationSec > 0 ? _fmtDuration(state.route.durationSec) : null;

    const chip = (label) =>
        `<span class="bq-chip"><span class="bq-chip-dot" aria-hidden="true"></span>${_escHtml(label)}</span>`;

    return [
        chip(service),
        seating ? chip(seating) : "",
        dur ? chip(dur) : "",
    ].join("");
}

function _createModalEl(state, costs) {
    const el = document.createElement("div");
    el.className = "bq-backdrop";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Book your trip");

    // Set today as the minimum selectable date
    const today = new Date().toISOString().split("T")[0];

    el.innerHTML = `
        <div class="bq-dialog" tabindex="-1">
            <div class="bq-handle" aria-hidden="true"></div>

            <div class="bq-header">
                <div class="bq-header-icon" aria-hidden="true">&#x1F5D3;&#xFE0F;</div>
                <div class="bq-header-text">
                    <h2 class="bq-title">Book Your Trip</h2>
                    <p class="bq-subtitle">Fill in your details — the rest is pre-filled.</p>
                </div>
                <button class="bq-close" id="bqCloseBtn" aria-label="Close booking dialog" type="button">&#x2715;</button>
            </div>

            <div class="bq-body">

                <!-- Trip estimate summary -->
                <div class="bq-summary" aria-label="Trip estimate summary">
                    ${_buildSummaryHtml(state, costs)}
                </div>

                <!-- Pre-filled info chips -->
                <div class="bq-prefill-section">
                    <p class="bq-section-label">Pre-filled from your estimate</p>
                    <div class="bq-chips-row" aria-label="Pre-filled fields">
                        ${_buildChipsHtml(state)}
                    </div>
                </div>

                <!-- Contact inputs -->
                <div class="bq-fields">
                    <div class="bq-field">
                        <label class="bq-label" for="bqName">
                            Full Name
                            <span class="bq-req" aria-label="required">*</span>
                        </label>
                        <input
                            class="bq-input"
                            id="bqName"
                            type="text"
                            placeholder="e.g. Maria Santos"
                            autocomplete="name"
                            inputmode="text"
                            aria-required="true"
                            aria-describedby="bqNameErr"
                        />
                        <p class="bq-err" id="bqNameErr" role="alert" aria-live="polite">
                            Please enter your full name.
                        </p>
                    </div>

                    <div class="bq-field">
                        <label class="bq-label" for="bqContact">
                            Contact Number
                            <span class="bq-req" aria-label="required">*</span>
                        </label>
                        <input
                            class="bq-input"
                            id="bqContact"
                            type="tel"
                            placeholder="e.g. 09XX XXX XXXX"
                            autocomplete="tel"
                            inputmode="tel"
                            aria-required="true"
                            aria-describedby="bqContactErr"
                        />
                        <p class="bq-err" id="bqContactErr" role="alert" aria-live="polite">
                            Please enter your contact number.
                        </p>
                    </div>

                    <div class="bq-field">
                        <label class="bq-label" for="bqDate">
                            Preferred Rental Date
                            <span class="bq-req" aria-label="required">*</span>
                        </label>
                        <input
                            class="bq-input"
                            id="bqDate"
                            type="date"
                            min="${_escHtml(today)}"
                            aria-required="true"
                            aria-describedby="bqDateErr"
                        />
                        <p class="bq-err" id="bqDateErr" role="alert" aria-live="polite">
                            Please select a preferred rental date.
                        </p>
                    </div>
                </div>

                <!-- Submit -->
                <div class="bq-footer">
                    <button class="bq-btn-submit" id="bqSubmitBtn" type="button">
                        Open Booking Form
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2.2"
                                  stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <p class="bq-hint">
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M8 7v5M8 5v.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>
                        Opens Google Form in a new tab with your details pre-filled.
                    </p>
                </div>

            </div>
        </div>
    `;

    return el;
}

/* ═══════════════════════════════════════════════════════════════
   STYLES INJECTION
   ═══════════════════════════════════════════════════════════════ */

function _injectStyles() {
    if (document.getElementById("bq-styles")) return;
    const style = document.createElement("style");
    style.id = "bq-styles";
    style.textContent = _MODAL_CSS;
    document.head.appendChild(style);
}

/* ═══════════════════════════════════════════════════════════════
   VALIDATION
   ═══════════════════════════════════════════════════════════════ */

function _validate(backdrop) {
    const fields = [
        { inputId: "bqName",    errId: "bqNameErr",    check: (v) => v.trim().length > 0 },
        { inputId: "bqContact", errId: "bqContactErr", check: (v) => v.trim().length > 0 },
        { inputId: "bqDate",    errId: "bqDateErr",    check: (v) => Boolean(v) },
    ];

    let valid = true;
    let firstInvalid = null;

    fields.forEach(({ inputId, errId, check }) => {
        const inputEl = backdrop.querySelector(`#${inputId}`);
        const errEl   = backdrop.querySelector(`#${errId}`);
        const passes  = check(inputEl.value);

        inputEl.classList.toggle("bq-invalid", !passes);
        errEl?.classList.toggle("bq-show",    !passes);

        if (!passes) {
            valid = false;
            firstInvalid ??= inputEl;
        }
    });

    firstInvalid?.focus();

    return valid
        ? {
            name:    backdrop.querySelector("#bqName").value,
            contact: backdrop.querySelector("#bqContact").value,
            date:    backdrop.querySelector("#bqDate").value,
          }
        : null;
}

/* ═══════════════════════════════════════════════════════════════
   MODAL LIFECYCLE
   ═══════════════════════════════════════════════════════════════ */

let _activeModal = null;

function _closeModal() {
    if (!_activeModal) return;
    const modal = _activeModal;
    _activeModal = null;

    modal._cleanup?.();
    modal.classList.remove("bq-open");

    modal.addEventListener("transitionend", () => modal.remove(), { once: true });
    // Fallback removal in case transitionend doesn't fire.
    setTimeout(() => modal.remove(), 400);
}

/* ═══════════════════════════════════════════════════════════════
   PUBLIC API
   ═══════════════════════════════════════════════════════════════ */

/**
 * Show the booking quotation modal.
 *
 * @param {object} state  — App state: { origin, destination, route, withDriver, stops }
 * @param {object} costs  — Trip costs: { total, perPerson, fuelCost, toll, rental, driver }
 */
export function showBookingModal(state, costs) {
    if (_activeModal) _closeModal();

    _injectStyles();

    const modal = _createModalEl(state, costs);
    document.body.appendChild(modal);
    _activeModal = modal;

    // Animate in (double rAF ensures paint before adding class).
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add("bq-open")));

    // Close button.
    modal.querySelector("#bqCloseBtn").addEventListener("click", _closeModal);

    // Backdrop click closes (but not inner dialog clicks).
    modal.addEventListener("click", (e) => { if (e.target === modal) _closeModal(); });

    // Escape key.
    const onKeyDown = (e) => { if (e.key === "Escape") _closeModal(); };
    document.addEventListener("keydown", onKeyDown);
    modal._cleanup = () => document.removeEventListener("keydown", onKeyDown);

    // Live input validation — clear errors as user types.
    modal.querySelectorAll(".bq-input").forEach((input) => {
        input.addEventListener("input", () => {
            input.classList.remove("bq-invalid");
            const errEl = modal.querySelector(`#${input.id}Err`);
            errEl?.classList.remove("bq-show");
        });
    });

    // Submit.
    modal.querySelector("#bqSubmitBtn").addEventListener("click", () => {
        const data = _validate(modal);
        if (!data) return;

        const url = _buildPrefillUrl({ ...data, state });
        window.open(url, "_blank", "noopener,noreferrer");
        _closeModal();
    });

    // Focus first interactive element for accessibility.
    modal.querySelector(".bq-dialog")?.focus();
}

/**
 * Compute current trip costs by reading live DOM values.
 * Mirrors the renderTripCost() logic in index.html.
 *
 * @param {object} state — App state (needs state.withDriver, state.route.distanceKm)
 * @returns {{ fuelCost, toll, rental, driver, total, perPerson }}
 */
export function computeCosts(state) {
    const distanceKm = state.route?.distanceKm || 0;
    const fuelPrice  = _safeNum("fuelPrice");
    const efficiency = Math.max(1, Number(document.getElementById("vehicleType")?.value) || 1);
    const rental     = _safeNum("rentalFee");
    const toll       = _safeNum("tollFee");
    const driver     = state.withDriver ? _safeNum("driverFee") : 0;
    const passengers = Math.max(1, Math.floor(_safeNum("passengers") || 1));

    const fuelCost = (distanceKm / efficiency) * fuelPrice;
    const total    = fuelCost + rental + toll + driver;

    return {
        fuelCost,
        toll,
        rental,
        driver,
        total,
        perPerson: total / passengers,
    };
}
