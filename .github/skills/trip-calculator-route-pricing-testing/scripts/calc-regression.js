/*
  Trip Calculator Regression Helper
  - Plain JS, no dependencies
  - Can run in browser console or Node
*/

(function attachTripRegression(global) {
  function approxEqual(actual, expected, epsilon) {
    return Math.abs(actual - expected) <= epsilon;
  }

  function computeCosts(input) {
    const distance = Math.max(0, Number(input.distanceKm) || 0);
    const fuelPrice = Math.max(0, Number(input.fuelPrice) || 0);
    const kmL = Math.max(1, Number(input.kmL) || 1);
    const rental = Math.max(0, Number(input.rentalFee) || 0);
    const toll = Math.max(0, Number(input.tollFee) || 0);
    const withDriver = Boolean(input.withDriver);
    const driver = withDriver ? Math.max(0, Number(input.driverFee) || 0) : 0;
    const passengers = Math.max(1, Math.floor(Number(input.passengers) || 1));

    const fuelCost = (distance / kmL) * fuelPrice;
    const total = fuelCost + rental + toll + driver;
    const perPerson = total / passengers;

    return { fuelCost, total, perPerson, driverApplied: driver };
  }

  function buildPrefillUrl(formUrl, mapping, data) {
    const url = formUrl.replace(/viewform(\?.*)?$/i, "formResponse");
    const params = new URLSearchParams();

    Object.keys(mapping).forEach((key) => {
      const entryId = mapping[key];
      if (!entryId) return;
      const value = data[key];
      if (value === undefined || value === null || value === "") return;
      params.set(entryId, String(value));
    });

    return `${url}?${params.toString()}`;
  }

  function runRegression(fixtures, options) {
    const epsilon = options?.epsilon ?? 0.01;
    const results = fixtures.map((fixture) => {
      const actual = computeCosts(fixture.input);
      const expected = fixture.expected;

      const checks = {
        fuelCost: approxEqual(actual.fuelCost, expected.fuelCost, epsilon),
        total: approxEqual(actual.total, expected.total, epsilon),
        perPerson: approxEqual(actual.perPerson, expected.perPerson, epsilon)
      };

      const pass = Object.values(checks).every(Boolean);
      return {
        name: fixture.name,
        pass,
        checks,
        actual,
        expected
      };
    });

    const failed = results.filter((result) => !result.pass);
    return {
      pass: failed.length === 0,
      total: results.length,
      failedCount: failed.length,
      results,
      failed
    };
  }

  global.TripCalcRegression = {
    computeCosts,
    buildPrefillUrl,
    runRegression
  };
})(typeof window !== "undefined" ? window : globalThis);

/* Example usage:

const fixtures = [
  {
    name: "Tagaytay SUV with driver",
    input: {
      distanceKm: 80,
      fuelPrice: 65,
      kmL: 10,
      rentalFee: 3500,
      tollFee: 200,
      withDriver: true,
      driverFee: 1000,
      passengers: 4
    },
    expected: {
      fuelCost: 520,
      total: 5220,
      perPerson: 1305
    }
  }
];

const report = TripCalcRegression.runRegression(fixtures);
console.log(report);

const prefill = TripCalcRegression.buildPrefillUrl(
  "https://docs.google.com/forms/d/e/FORM_ID/viewform",
  {
    origin: "entry.111",
    destination: "entry.222",
    total: "entry.333"
  },
  {
    origin: "Quezon City",
    destination: "Tagaytay",
    total: "5220"
  }
);

console.log(prefill);
*/
