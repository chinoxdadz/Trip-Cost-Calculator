/*
  Google Form Mapping Tool (Browser)
  - Extracts entry IDs from raw HTML
  - Builds calculator-field mapping
  - Validates required keys
  - Generates prefill URLs
*/

(function attachGoogleFormMappingTool(global) {
  const REQUIRED_KEYS = [
    "origin",
    "destination",
    "vehicleType",
    "distance",
    "total",
    "perPerson",
    "driverToggle"
  ];

  const OPTIONAL_KEYS = ["stops"];

  function unique(values) {
    return Array.from(new Set(values));
  }

  function safeLabel(input) {
    if (!input) return "Unnamed field";

    const labelledBy = input.getAttribute("aria-label");
    if (labelledBy && labelledBy.trim()) return labelledBy.trim();

    const placeholder = input.getAttribute("placeholder");
    if (placeholder && placeholder.trim()) return placeholder.trim();

    const labelEl = input.closest("label") || input.parentElement?.querySelector("label");
    if (labelEl && labelEl.textContent.trim()) return labelEl.textContent.trim();

    return "Unnamed field";
  }

  function extractEntryId(nameAttr) {
    if (!nameAttr) return null;
    const match = nameAttr.match(/(entry\.[0-9]+)/);
    return match ? match[1] : null;
  }

  function extractFieldsFromHtml(rawHtml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");
    const candidates = Array.from(doc.querySelectorAll("input[name], textarea[name], select[name]"));

    const fields = [];
    candidates.forEach((el) => {
      const entryId = extractEntryId(el.getAttribute("name"));
      if (!entryId) return;

      fields.push({
        id: entryId,
        label: safeLabel(el),
        inputType: (el.getAttribute("type") || el.tagName || "unknown").toLowerCase(),
        required: el.hasAttribute("required")
      });
    });

    const uniqueIds = unique(fields.map((field) => field.id));
    const deduped = uniqueIds.map((id) => fields.find((field) => field.id === id));

    return deduped.sort((a, b) => a.id.localeCompare(b.id));
  }

  function validateMapping(mapping) {
    const missingRequired = REQUIRED_KEYS.filter((key) => !mapping[key]);
    const missingOptional = OPTIONAL_KEYS.filter((key) => !mapping[key]);

    return {
      ok: missingRequired.length === 0,
      missingRequired,
      missingOptional,
      warnings: [
        ...missingRequired.map((key) => `Missing required mapping: ${key}`),
        ...missingOptional.map((key) => `Optional mapping not set: ${key}`)
      ]
    };
  }

  function buildPrefillUrl(formBaseUrl, mapping, calculatorData) {
    const mappingStatus = validateMapping(mapping);
    if (!formBaseUrl || !formBaseUrl.trim()) {
      throw new Error("Google Form URL is required.");
    }

    const cleanUrl = formBaseUrl.replace(/viewform(\?.*)?$/i, "formResponse");
    const params = new URLSearchParams();

    Object.keys(mapping).forEach((key) => {
      const entryId = mapping[key];
      if (!entryId) return;

      const value = calculatorData[key];
      if (value === undefined || value === null || value === "") return;

      params.set(entryId, typeof value === "string" ? value : JSON.stringify(value));
    });

    return {
      url: `${cleanUrl}?${params.toString()}`,
      warnings: mappingStatus.warnings,
      ok: mappingStatus.ok
    };
  }

  function createGoogleFormMapper(rawHtml) {
    const fields = extractFieldsFromHtml(rawHtml);

    return {
      fields,
      requiredKeys: [...REQUIRED_KEYS],
      optionalKeys: [...OPTIONAL_KEYS],
      validateMapping,
      buildPrefillUrl: (formBaseUrl, mapping, calculatorData) =>
        buildPrefillUrl(formBaseUrl, mapping, calculatorData)
    };
  }

  global.GFormMapper = {
    createGoogleFormMapper,
    extractFieldsFromHtml,
    validateMapping,
    buildPrefillUrl
  };
})(window);

/* Example usage (browser):

const sampleHtml = `
  <form>
    <input name="entry.111111" aria-label="Origin" />
    <input name="entry.222222" aria-label="Destination" />
    <input name="entry.333333" aria-label="Vehicle Type" />
    <input name="entry.444444" aria-label="Distance" />
    <input name="entry.555555" aria-label="Total" />
    <input name="entry.666666" aria-label="Per Person" />
    <input name="entry.777777" aria-label="Driver Toggle" />
    <input name="entry.888888" aria-label="Stops" />
  </form>
`;

const mapper = GFormMapper.createGoogleFormMapper(sampleHtml);
console.table(mapper.fields);

const mapping = {
  origin: "entry.111111",
  destination: "entry.222222",
  vehicleType: "entry.333333",
  distance: "entry.444444",
  total: "entry.555555",
  perPerson: "entry.666666",
  driverToggle: "entry.777777",
  stops: "entry.888888"
};

const calculatorData = {
  origin: "Quezon City",
  destination: "Tagaytay",
  stops: "Nuvali, Santa Rosa",
  vehicleType: "SUV/Innova",
  distance: "78.45",
  total: "4500.00",
  perPerson: "1125.00",
  driverToggle: "With Driver"
};

const prefill = mapper.buildPrefillUrl(
  "https://docs.google.com/forms/d/e/FORM_ID/viewform",
  mapping,
  calculatorData
);

console.log(prefill.url);
console.log(prefill.warnings);
*/
