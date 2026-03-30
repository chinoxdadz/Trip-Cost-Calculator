import { useMemo, useState } from "react";
import FormInput from "./FormInput";

const VEHICLES = [
  { label: "Sedan (15 km/L)", value: 15 },
  { label: "SUV/Innova (10 km/L)", value: 10 },
  { label: "Van (7 km/L)", value: 7 }
];

const currencyPH = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function toNumber(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export default function Calculator() {
  const [distanceKm, setDistanceKm] = useState("100");
  const [fuelPrice, setFuelPrice] = useState("65");
  const [kmPerLiter, setKmPerLiter] = useState("10");
  const [rentalFee, setRentalFee] = useState("3500");
  const [tollFee, setTollFee] = useState("0");
  const [driverFee, setDriverFee] = useState("0");
  const [passengers, setPassengers] = useState("4");
  const [withDriver, setWithDriver] = useState(false);

  const costs = useMemo(() => {
    const distance = toNumber(distanceKm);
    const fuel = toNumber(fuelPrice);
    const efficiency = Math.max(1, toNumber(kmPerLiter));
    const rental = toNumber(rentalFee);
    const toll = toNumber(tollFee);
    const driver = withDriver ? toNumber(driverFee) : 0;
    const pax = Math.max(1, Math.floor(toNumber(passengers) || 1));

    const fuelCost = (distance / efficiency) * fuel;
    const total = fuelCost + rental + toll + driver;
    const perPerson = total / pax;

    return {
      efficiency,
      fuelCost,
      rental,
      toll,
      driver,
      total,
      perPerson
    };
  }, [distanceKm, fuelPrice, kmPerLiter, rentalFee, tollFee, driverFee, passengers, withDriver]);

  return (
    <main className="app-shell">
      <section className="card form-card">
        <header>
          <h1 className="title">Trip Cost Calculator</h1>
          <p className="subtitle">Estimate total trip cost and per-person share in real time.</p>
        </header>

        <div className="fields-grid">
          <FormInput
            id="distanceKm"
            label="Distance (km)"
            value={distanceKm}
            onChange={(event) => setDistanceKm(event.target.value)}
            min="0"
            step="0.1"
          />

          <FormInput
            id="fuelPrice"
            label="Fuel Price (PHP/L)"
            value={fuelPrice}
            onChange={(event) => setFuelPrice(event.target.value)}
            min="0"
            step="0.1"
          />

          <div className="field-group">
            <label htmlFor="vehicle" className="field-label">Vehicle Type</label>
            <select
              id="vehicle"
              className="field-input"
              value={kmPerLiter}
              onChange={(event) => setKmPerLiter(event.target.value)}
            >
              {VEHICLES.map((vehicle) => (
                <option key={vehicle.value} value={vehicle.value}>
                  {vehicle.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <span className="field-label">Trip Mode</span>
            <div className="mode-toggle">
              <button
                type="button"
                className={`mode-btn ${!withDriver ? "active" : ""}`}
                onClick={() => setWithDriver(false)}
              >
                Self-drive
              </button>
              <button
                type="button"
                className={`mode-btn ${withDriver ? "active" : ""}`}
                onClick={() => setWithDriver(true)}
              >
                With Driver
              </button>
            </div>
          </div>

          <FormInput
            id="rentalFee"
            label="Rental Fee"
            value={rentalFee}
            onChange={(event) => setRentalFee(event.target.value)}
            min="0"
            step="0.01"
          />

          <FormInput
            id="tollFee"
            label="Toll Fees"
            value={tollFee}
            onChange={(event) => setTollFee(event.target.value)}
            min="0"
            step="0.01"
          />

          {withDriver && (
            <FormInput
              id="driverFee"
              label="Driver Fee"
              value={driverFee}
              onChange={(event) => setDriverFee(event.target.value)}
              min="0"
              step="0.01"
            />
          )}

          <FormInput
            id="passengers"
            label="Passengers"
            value={passengers}
            onChange={(event) => setPassengers(event.target.value)}
            min="1"
            step="1"
          />
        </div>
      </section>

      <section className="card summary-card">
        <div className="summary-header">
          <h2>Cost Breakdown</h2>
          <p>Efficiency: {costs.efficiency.toFixed(2)} km/L</p>
        </div>

        <div className="total-highlight">
          <span>Total Trip Cost</span>
          <strong>{currencyPH.format(costs.total)}</strong>
        </div>

        <ul className="breakdown-list">
          <li><span>Fuel</span><strong>{currencyPH.format(costs.fuelCost)}</strong></li>
          <li><span>Toll</span><strong>{currencyPH.format(costs.toll)}</strong></li>
          <li><span>Rental</span><strong>{currencyPH.format(costs.rental)}</strong></li>
          <li><span>Driver</span><strong>{currencyPH.format(costs.driver)}</strong></li>
          <li><span>Total</span><strong>{currencyPH.format(costs.total)}</strong></li>
        </ul>

        <div className="per-person">
          <span>Per person</span>
          <strong>{currencyPH.format(costs.perPerson)}</strong>
        </div>
      </section>
    </main>
  );
}
