/**
 * 2025 Crop Planner Calculator
 * CSU/Iowa State Extension Rates @ 75% Spread
 * NE Colorado - Irrigated & Dryland Corn
 * Separate sections for Irrigated and Dryland
 */

// ============================================
// RATE CONFIGURATION - CSU/Iowa State @ 75% Spread
// ============================================

// Field Operations ($/acre) - 75% of rate range
// Irrigated includes tillage (disk, strip till)
const OPERATIONS_IRRIGATED = [
    { name: 'Disk (Tandem)', passes: 2, rate: 14.50 },
    { name: 'Strip Till', passes: 1, rate: 18.75 },
    { name: 'Plant (Corn)', passes: 1, rate: 22.50 },
    { name: 'Combine (Corn)', passes: 1, rate: 41.25 },
    { name: 'Grain Cart', passes: 1, rate: 5.50 }
];

// Dryland - no tillage (no-till)
const OPERATIONS_DRYLAND = [
    { name: 'Plant (Corn)', passes: 1, rate: 22.50 },
    { name: 'Combine (Corn)', passes: 1, rate: 41.25 },
    { name: 'Grain Cart', passes: 1, rate: 5.50 }
];

// Hauling Configuration - 22 miles one way
const HAUL_DISTANCE_ONE_WAY = 22;
const HAUL_RATE_PER_BUSHEL = 0.18;

// ============================================
// LAND RENTAL - NE Colorado Average Rates
// ============================================
const LAND_RENTAL = {
    irrigated: { name: 'Irrigated Land Rent', costPerAcre: 225.00 },
    dryland: { name: 'Dryland Land Rent', costPerAcre: 45.00 }
};

// ============================================
// CROP INSURANCE - RCIS
// ============================================
const CROP_INSURANCE = {
    irrigated: [
        { name: 'Multi-Peril (MPCI/RP)', details: 'RCIS - 75% coverage', costPerAcre: 32.00 },
        { name: 'Hail Insurance', details: 'RCIS - $100/ac coverage', costPerAcre: 12.00 }
    ],
    dryland: [
        { name: 'Multi-Peril (MPCI/RP)', details: 'RCIS - 75% coverage', costPerAcre: 18.00 },
        { name: 'Hail Insurance', details: 'RCIS - $100/ac coverage', costPerAcre: 8.00 }
    ]
};

// ============================================
// IRRIGATION COSTS (Irrigated Only)
// ============================================
const IRRIGATION_COSTS = [
    { name: 'Well Electricity', details: '~15 acre-in @ $22/acre-in', costPerAcre: 330.00 },
    { name: 'Well Maintenance', details: 'Annual allowance', costPerAcre: 18.00 }
];

// ============================================
// CHEMICAL PROGRAM - Separate Pre & Post
// ============================================
const CHEM_APPLICATION_RATE = 8.00;  // $8/acre per application pass

// Spray Configuration
const SPRAY_RATE_GPA = 12;
const HYDROVANT_RATE_PERCENT = 0.001;
const HYDROVANT_COST_PER_GAL = 165.00;
const HYDROVANT_COST_PER_ACRE = SPRAY_RATE_GPA * HYDROVANT_RATE_PERCENT * HYDROVANT_COST_PER_GAL; // $1.98

// Pre-calculated chemical costs per acre
const GLYPHOSATE_COST = 32 * 0.12;        // $3.84
const VALOR_COST = 2.5 * 4.20;            // $10.50
const ATRAZINE_COST = 1.0 * 1.95;         // $1.95
const METOLACHLOR_COST = 1.33 * 8.50;     // $11.31
const FLUROXYPYR_COST = 0.67 * 12.50;     // $8.38
const AMS_COST = 2.5 * 0.35;              // $0.88
const DIFLEXX_COST = 3.0 * 0.95;          // $2.85
const WARRANT_COST = 3.0 * 4.75;          // $14.25

// Pre-Emergence Chemicals (same for both)
const PRE_CHEMICALS = [
    { name: 'Glyphosate 41% (Generic)', ratePerAcre: 32, unit: 'oz', costPerAcre: GLYPHOSATE_COST },
    { name: 'Valor SX (flumioxazin)', ratePerAcre: 2.5, unit: 'oz', costPerAcre: VALOR_COST },
    { name: 'Atrazine 4L', ratePerAcre: 1.0, unit: 'pt', costPerAcre: ATRAZINE_COST },
    { name: 'Fluroxypyr (Starane Ultra)', ratePerAcre: 0.67, unit: 'pt', costPerAcre: FLUROXYPYR_COST },
    { name: 'Hydrovant (adjuvant)', ratePerAcre: 0.1, unit: '% v/v', costPerAcre: HYDROVANT_COST_PER_ACRE }
];

// Pre-calculated cost per acre for Pre-emergence (including application)
const PRE_COST_PER_ACRE = GLYPHOSATE_COST + VALOR_COST + ATRAZINE_COST + FLUROXYPYR_COST + HYDROVANT_COST_PER_ACRE + CHEM_APPLICATION_RATE;

// Post-Emergence Chemicals - Irrigated (includes Warrant and Metolachlor)
const POST_CHEMICALS_IRR = [
    { name: 'Glyphosate 41% (Generic)', ratePerAcre: 32, unit: 'oz', costPerAcre: GLYPHOSATE_COST },
    { name: 'AMS (Ammonium Sulfate)', ratePerAcre: 2.5, unit: 'lb', costPerAcre: AMS_COST },
    { name: 'Atrazine 4L', ratePerAcre: 1.0, unit: 'pt', costPerAcre: ATRAZINE_COST },
    { name: 'Metolachlor (Dual II Magnum)', ratePerAcre: 1.33, unit: 'pt', costPerAcre: METOLACHLOR_COST },
    { name: 'DiFlexx (dicamba)', ratePerAcre: 3.0, unit: 'oz', costPerAcre: DIFLEXX_COST },
    { name: 'Hydrovant (adjuvant)', ratePerAcre: 0.1, unit: '% v/v', costPerAcre: HYDROVANT_COST_PER_ACRE },
    { name: 'Acetochlor (Warrant)', ratePerAcre: 3.0, unit: 'pt', costPerAcre: WARRANT_COST }
];

// Post-Emergence Chemicals - Dryland (includes Metolachlor, no Warrant)
const POST_CHEMICALS_DRY = [
    { name: 'Glyphosate 41% (Generic)', ratePerAcre: 32, unit: 'oz', costPerAcre: GLYPHOSATE_COST },
    { name: 'AMS (Ammonium Sulfate)', ratePerAcre: 2.5, unit: 'lb', costPerAcre: AMS_COST },
    { name: 'Atrazine 4L', ratePerAcre: 1.0, unit: 'pt', costPerAcre: ATRAZINE_COST },
    { name: 'Metolachlor (Dual II Magnum)', ratePerAcre: 1.33, unit: 'pt', costPerAcre: METOLACHLOR_COST },
    { name: 'DiFlexx (dicamba)', ratePerAcre: 3.0, unit: 'oz', costPerAcre: DIFLEXX_COST },
    { name: 'Hydrovant (adjuvant)', ratePerAcre: 0.1, unit: '% v/v', costPerAcre: HYDROVANT_COST_PER_ACRE }
];

// Pre-calculated cost per acre for Post-emergence (including application)
const POST_COST_PER_ACRE_IRR = GLYPHOSATE_COST + AMS_COST + ATRAZINE_COST + METOLACHLOR_COST + DIFLEXX_COST + HYDROVANT_COST_PER_ACRE + WARRANT_COST + CHEM_APPLICATION_RATE;
const POST_COST_PER_ACRE_DRY = GLYPHOSATE_COST + AMS_COST + ATRAZINE_COST + METOLACHLOR_COST + DIFLEXX_COST + HYDROVANT_COST_PER_ACRE + CHEM_APPLICATION_RATE;

// Fertilizer Programs - Irrigated vs Dryland
const FERT_APPLICATION_RATE = 8.25;

// Irrigated Fertilizer - 220N-40P-25S-1Zn + Micros (UAN32 @ $0.73/lb N)
const FERT_IRRIGATED = [
    { nutrient: 'Nitrogen (N) - UAN32', lbsPerAcre: 220, pricePerLb: 0.73, costPerAcre: 220 * 0.73 },
    { nutrient: 'Phosphorus (P2O5)', lbsPerAcre: 40, pricePerLb: 0.61, costPerAcre: 40 * 0.61 },
    { nutrient: 'Sulfur (S)', lbsPerAcre: 25, pricePerLb: 0.38, costPerAcre: 25 * 0.38 },
    { nutrient: 'Zinc (Zn)', lbsPerAcre: 1, pricePerLb: 4.50, costPerAcre: 1 * 4.50 },
    { nutrient: 'Micronutrient Package', lbsPerAcre: 1, pricePerLb: 8.00, costPerAcre: 1 * 8.00 }
];

// Dryland Fertilizer - 80N-20P-15S-0.5Zn (UAN32 @ $0.73/lb N)
const FERT_DRYLAND = [
    { nutrient: 'Nitrogen (N) - UAN32', lbsPerAcre: 80, pricePerLb: 0.73, costPerAcre: 80 * 0.73 },
    { nutrient: 'Phosphorus (P2O5)', lbsPerAcre: 20, pricePerLb: 0.61, costPerAcre: 20 * 0.61 },
    { nutrient: 'Sulfur (S)', lbsPerAcre: 15, pricePerLb: 0.38, costPerAcre: 15 * 0.38 },
    { nutrient: 'Zinc (Zn)', lbsPerAcre: 0.5, pricePerLb: 4.50, costPerAcre: 0.5 * 4.50 }
];

// Pre-calculated cost per acre for Fertilizer (including application)
const FERT_COST_PER_ACRE_IRR = (220 * 0.73) + (40 * 0.61) + (25 * 0.38) + (1 * 4.50) + (1 * 8.00) + FERT_APPLICATION_RATE;
const FERT_COST_PER_ACRE_DRY = (80 * 0.73) + (20 * 0.61) + (15 * 0.38) + (0.5 * 4.50) + FERT_APPLICATION_RATE;

// Expected yields (bu/acre)
const IRRIGATED_YIELD = 240;
const DRYLAND_YIELD = 90;

// ============================================
// CALCULATION FUNCTIONS
// ============================================

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatCurrencyDecimal(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

function calculate() {
    const irrigatedAcres = parseFloat(document.getElementById('irrigatedAcres').value) || 0;
    const drylandAcres = parseFloat(document.getElementById('drylandAcres').value) || 0;
    const totalAcres = irrigatedAcres + drylandAcres;
    const cornPrice = parseFloat(document.getElementById('cornPrice').value) || 4.50;

    const irrigatedBushels = irrigatedAcres * IRRIGATED_YIELD;
    const drylandBushels = drylandAcres * DRYLAND_YIELD;
    const totalBushels = irrigatedBushels + drylandBushels;

    // Update display headers
    document.getElementById('irrAcresDisplay').textContent = irrigatedAcres;
    document.getElementById('dryAcresDisplay').textContent = drylandAcres;
    document.getElementById('irrigatedYield').textContent = IRRIGATED_YIELD;
    document.getElementById('drylandYield').textContent = DRYLAND_YIELD;
    document.getElementById('totalAcres').textContent = totalAcres;

    // ============================================
    // IRRIGATED CALCULATIONS
    // ============================================
    let irrOpsTotal = 0;
    let irrIrrigationTotal = 0;
    let irrRentTotal = 0;
    let irrInsTotal = 0;
    let irrPreChemTotal = 0;
    let irrPostChemTotal = 0;
    let irrFertTotal = 0;

    // Irrigated Field Operations
    const irrOpsBody = document.getElementById('irrOpsBody');
    irrOpsBody.innerHTML = '';
    OPERATIONS_IRRIGATED.forEach(op => {
        const cost = op.rate * op.passes * irrigatedAcres;
        irrOpsTotal += cost;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${op.name}</td>
            <td>${op.passes}</td>
            <td>${formatCurrencyDecimal(op.rate)}</td>
            <td>${formatCurrency(cost)}</td>
        `;
        irrOpsBody.appendChild(row);
    });
    // Irrigated Hauling
    const irrHaulCost = irrigatedBushels * HAUL_RATE_PER_BUSHEL;
    irrOpsTotal += irrHaulCost;
    const irrHaulRow = document.createElement('tr');
    irrHaulRow.innerHTML = `
        <td>Hauling (${HAUL_DISTANCE_ONE_WAY} mi)</td>
        <td>-</td>
        <td>${formatCurrencyDecimal(HAUL_RATE_PER_BUSHEL)}/bu</td>
        <td>${formatCurrency(irrHaulCost)}</td>
    `;
    irrOpsBody.appendChild(irrHaulRow);
    document.getElementById('irrOpsTotal').textContent = formatCurrency(irrOpsTotal);

    // Irrigated Irrigation Costs
    const irrIrrigationBody = document.getElementById('irrIrrigationBody');
    irrIrrigationBody.innerHTML = '';
    IRRIGATION_COSTS.forEach(item => {
        const cost = item.costPerAcre * irrigatedAcres;
        irrIrrigationTotal += cost;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.details}</td>
            <td>${formatCurrencyDecimal(item.costPerAcre)}</td>
            <td>${formatCurrency(cost)}</td>
        `;
        irrIrrigationBody.appendChild(row);
    });
    document.getElementById('irrIrrigationTotal').textContent = formatCurrency(irrIrrigationTotal);

    // Irrigated Land Rental
    const irrRentBody = document.getElementById('irrRentBody');
    irrRentBody.innerHTML = '';
    irrRentTotal = LAND_RENTAL.irrigated.costPerAcre * irrigatedAcres;
    const irrRentRow = document.createElement('tr');
    irrRentRow.innerHTML = `
        <td>${LAND_RENTAL.irrigated.name}</td>
        <td>NE Colorado avg rate</td>
        <td>${formatCurrencyDecimal(LAND_RENTAL.irrigated.costPerAcre)}</td>
        <td>${formatCurrency(irrRentTotal)}</td>
    `;
    irrRentBody.appendChild(irrRentRow);
    document.getElementById('irrRentTotal').textContent = formatCurrency(irrRentTotal);

    // Irrigated Crop Insurance
    const irrInsBody = document.getElementById('irrInsBody');
    irrInsBody.innerHTML = '';
    CROP_INSURANCE.irrigated.forEach(ins => {
        const cost = ins.costPerAcre * irrigatedAcres;
        irrInsTotal += cost;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ins.name}</td>
            <td>${ins.details}</td>
            <td>${formatCurrencyDecimal(ins.costPerAcre)}</td>
            <td>${formatCurrency(cost)}</td>
        `;
        irrInsBody.appendChild(row);
    });
    document.getElementById('irrInsTotal').textContent = formatCurrency(irrInsTotal);

    // Irrigated Pre-Emergence
    const irrPreChemBody = document.getElementById('irrPreChemBody');
    irrPreChemBody.innerHTML = '';
    PRE_CHEMICALS.forEach(chem => {
        const cost = chem.costPerAcre * irrigatedAcres;
        irrPreChemTotal += cost;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${chem.name}</td>
            <td>${chem.ratePerAcre} ${chem.unit}/ac</td>
            <td>${formatCurrencyDecimal(chem.costPerAcre)}</td>
            <td>${formatCurrency(cost)}</td>
        `;
        irrPreChemBody.appendChild(row);
    });
    const irrPreAppCost = CHEM_APPLICATION_RATE * irrigatedAcres;
    irrPreChemTotal += irrPreAppCost;
    const irrPreAppRow = document.createElement('tr');
    irrPreAppRow.innerHTML = `
        <td><em>Application Cost</em></td>
        <td>@ ${SPRAY_RATE_GPA} GPA</td>
        <td>${formatCurrencyDecimal(CHEM_APPLICATION_RATE)}</td>
        <td>${formatCurrency(irrPreAppCost)}</td>
    `;
    irrPreChemBody.appendChild(irrPreAppRow);
    document.getElementById('irrPreChemTotal').textContent = formatCurrency(irrPreChemTotal);
    document.getElementById('irrPreCostPerAcre').textContent = formatCurrencyDecimal(PRE_COST_PER_ACRE);

    // Irrigated Post-Emergence (includes Warrant)
    const irrPostChemBody = document.getElementById('irrPostChemBody');
    irrPostChemBody.innerHTML = '';
    POST_CHEMICALS_IRR.forEach(chem => {
        const cost = chem.costPerAcre * irrigatedAcres;
        irrPostChemTotal += cost;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${chem.name}</td>
            <td>${chem.ratePerAcre} ${chem.unit}/ac</td>
            <td>${formatCurrencyDecimal(chem.costPerAcre)}</td>
            <td>${formatCurrency(cost)}</td>
        `;
        irrPostChemBody.appendChild(row);
    });
    const irrPostAppCost = CHEM_APPLICATION_RATE * irrigatedAcres;
    irrPostChemTotal += irrPostAppCost;
    const irrPostAppRow = document.createElement('tr');
    irrPostAppRow.innerHTML = `
        <td><em>Application Cost</em></td>
        <td>@ ${SPRAY_RATE_GPA} GPA</td>
        <td>${formatCurrencyDecimal(CHEM_APPLICATION_RATE)}</td>
        <td>${formatCurrency(irrPostAppCost)}</td>
    `;
    irrPostChemBody.appendChild(irrPostAppRow);
    document.getElementById('irrPostChemTotal').textContent = formatCurrency(irrPostChemTotal);
    document.getElementById('irrPostCostPerAcre').textContent = formatCurrencyDecimal(POST_COST_PER_ACRE_IRR);

    // Irrigated Fertilizer
    const irrFertBody = document.getElementById('irrFertBody');
    irrFertBody.innerHTML = '';
    FERT_IRRIGATED.forEach(fert => {
        const cost = fert.costPerAcre * irrigatedAcres;
        irrFertTotal += cost;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fert.nutrient}</td>
            <td>${fert.lbsPerAcre}</td>
            <td>${formatCurrencyDecimal(fert.pricePerLb)}</td>
            <td>${formatCurrencyDecimal(fert.costPerAcre)}</td>
            <td>${formatCurrency(cost)}</td>
        `;
        irrFertBody.appendChild(row);
    });
    const irrFertAppCost = FERT_APPLICATION_RATE * irrigatedAcres;
    irrFertTotal += irrFertAppCost;
    const irrFertAppRow = document.createElement('tr');
    irrFertAppRow.innerHTML = `
        <td><em>Application</em></td>
        <td>-</td>
        <td>-</td>
        <td>${formatCurrencyDecimal(FERT_APPLICATION_RATE)}</td>
        <td>${formatCurrency(irrFertAppCost)}</td>
    `;
    irrFertBody.appendChild(irrFertAppRow);
    document.getElementById('irrFertTotal').textContent = formatCurrency(irrFertTotal);
    document.getElementById('irrFertCostPerAcre').textContent = formatCurrencyDecimal(FERT_COST_PER_ACRE_IRR);

    // Irrigated Summary
    const irrChemTotal = irrPreChemTotal + irrPostChemTotal;
    const irrigatedTotal = irrOpsTotal + irrIrrigationTotal + irrRentTotal + irrInsTotal + irrChemTotal + irrFertTotal;
    document.getElementById('irrSummaryOps').textContent = formatCurrency(irrOpsTotal);
    document.getElementById('irrSummaryIrr').textContent = formatCurrency(irrIrrigationTotal);
    document.getElementById('irrSummaryRent').textContent = formatCurrency(irrRentTotal);
    document.getElementById('irrSummaryIns').textContent = formatCurrency(irrInsTotal);
    document.getElementById('irrSummaryChem').textContent = formatCurrency(irrChemTotal);
    document.getElementById('irrSummaryFert').textContent = formatCurrency(irrFertTotal);
    document.getElementById('irrigatedGrandTotal').textContent = formatCurrency(irrigatedTotal);
    document.getElementById('irrigatedCostPerAcre').textContent = formatCurrencyDecimal(irrigatedAcres > 0 ? irrigatedTotal / irrigatedAcres : 0);

    // ============================================
    // DRYLAND CALCULATIONS
    // ============================================
    let dryOpsTotal = 0;
    let dryRentTotal = 0;
    let dryInsTotal = 0;
    let dryPreChemTotal = 0;
    let dryPostChemTotal = 0;
    let dryFertTotal = 0;

    // Dryland Field Operations (no-till - no disk or strip till)
    const dryOpsBody = document.getElementById('dryOpsBody');
    dryOpsBody.innerHTML = '';
    OPERATIONS_DRYLAND.forEach(op => {
        const cost = op.rate * op.passes * drylandAcres;
        dryOpsTotal += cost;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${op.name}</td>
            <td>${op.passes}</td>
            <td>${formatCurrencyDecimal(op.rate)}</td>
            <td>${formatCurrency(cost)}</td>
        `;
        dryOpsBody.appendChild(row);
    });
    // Dryland Hauling
    const dryHaulCost = drylandBushels * HAUL_RATE_PER_BUSHEL;
    dryOpsTotal += dryHaulCost;
    const dryHaulRow = document.createElement('tr');
    dryHaulRow.innerHTML = `
        <td>Hauling (${HAUL_DISTANCE_ONE_WAY} mi)</td>
        <td>-</td>
        <td>${formatCurrencyDecimal(HAUL_RATE_PER_BUSHEL)}/bu</td>
        <td>${formatCurrency(dryHaulCost)}</td>
    `;
    dryOpsBody.appendChild(dryHaulRow);
    document.getElementById('dryOpsTotal').textContent = formatCurrency(dryOpsTotal);

    // Dryland Land Rental
    const dryRentBody = document.getElementById('dryRentBody');
    dryRentBody.innerHTML = '';
    dryRentTotal = LAND_RENTAL.dryland.costPerAcre * drylandAcres;
    const dryRentRow = document.createElement('tr');
    dryRentRow.innerHTML = `
        <td>${LAND_RENTAL.dryland.name}</td>
        <td>NE Colorado avg rate</td>
        <td>${formatCurrencyDecimal(LAND_RENTAL.dryland.costPerAcre)}</td>
        <td>${formatCurrency(dryRentTotal)}</td>
    `;
    dryRentBody.appendChild(dryRentRow);
    document.getElementById('dryRentTotal').textContent = formatCurrency(dryRentTotal);

    // Dryland Crop Insurance
    const dryInsBody = document.getElementById('dryInsBody');
    dryInsBody.innerHTML = '';
    CROP_INSURANCE.dryland.forEach(ins => {
        const cost = ins.costPerAcre * drylandAcres;
        dryInsTotal += cost;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ins.name}</td>
            <td>${ins.details}</td>
            <td>${formatCurrencyDecimal(ins.costPerAcre)}</td>
            <td>${formatCurrency(cost)}</td>
        `;
        dryInsBody.appendChild(row);
    });
    document.getElementById('dryInsTotal').textContent = formatCurrency(dryInsTotal);

    // Dryland Pre-Emergence
    const dryPreChemBody = document.getElementById('dryPreChemBody');
    dryPreChemBody.innerHTML = '';
    PRE_CHEMICALS.forEach(chem => {
        const cost = chem.costPerAcre * drylandAcres;
        dryPreChemTotal += cost;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${chem.name}</td>
            <td>${chem.ratePerAcre} ${chem.unit}/ac</td>
            <td>${formatCurrencyDecimal(chem.costPerAcre)}</td>
            <td>${formatCurrency(cost)}</td>
        `;
        dryPreChemBody.appendChild(row);
    });
    const dryPreAppCost = CHEM_APPLICATION_RATE * drylandAcres;
    dryPreChemTotal += dryPreAppCost;
    const dryPreAppRow = document.createElement('tr');
    dryPreAppRow.innerHTML = `
        <td><em>Application Cost</em></td>
        <td>@ ${SPRAY_RATE_GPA} GPA</td>
        <td>${formatCurrencyDecimal(CHEM_APPLICATION_RATE)}</td>
        <td>${formatCurrency(dryPreAppCost)}</td>
    `;
    dryPreChemBody.appendChild(dryPreAppRow);
    document.getElementById('dryPreChemTotal').textContent = formatCurrency(dryPreChemTotal);
    document.getElementById('dryPreCostPerAcre').textContent = formatCurrencyDecimal(PRE_COST_PER_ACRE);

    // Dryland Post-Emergence (no Warrant)
    const dryPostChemBody = document.getElementById('dryPostChemBody');
    dryPostChemBody.innerHTML = '';
    POST_CHEMICALS_DRY.forEach(chem => {
        const cost = chem.costPerAcre * drylandAcres;
        dryPostChemTotal += cost;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${chem.name}</td>
            <td>${chem.ratePerAcre} ${chem.unit}/ac</td>
            <td>${formatCurrencyDecimal(chem.costPerAcre)}</td>
            <td>${formatCurrency(cost)}</td>
        `;
        dryPostChemBody.appendChild(row);
    });
    const dryPostAppCost = CHEM_APPLICATION_RATE * drylandAcres;
    dryPostChemTotal += dryPostAppCost;
    const dryPostAppRow = document.createElement('tr');
    dryPostAppRow.innerHTML = `
        <td><em>Application Cost</em></td>
        <td>@ ${SPRAY_RATE_GPA} GPA</td>
        <td>${formatCurrencyDecimal(CHEM_APPLICATION_RATE)}</td>
        <td>${formatCurrency(dryPostAppCost)}</td>
    `;
    dryPostChemBody.appendChild(dryPostAppRow);
    document.getElementById('dryPostChemTotal').textContent = formatCurrency(dryPostChemTotal);
    document.getElementById('dryPostCostPerAcre').textContent = formatCurrencyDecimal(POST_COST_PER_ACRE_DRY);

    // Dryland Fertilizer
    const dryFertBody = document.getElementById('dryFertBody');
    dryFertBody.innerHTML = '';
    FERT_DRYLAND.forEach(fert => {
        const cost = fert.costPerAcre * drylandAcres;
        dryFertTotal += cost;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fert.nutrient}</td>
            <td>${fert.lbsPerAcre}</td>
            <td>${formatCurrencyDecimal(fert.pricePerLb)}</td>
            <td>${formatCurrencyDecimal(fert.costPerAcre)}</td>
            <td>${formatCurrency(cost)}</td>
        `;
        dryFertBody.appendChild(row);
    });
    const dryFertAppCost = FERT_APPLICATION_RATE * drylandAcres;
    dryFertTotal += dryFertAppCost;
    const dryFertAppRow = document.createElement('tr');
    dryFertAppRow.innerHTML = `
        <td><em>Application</em></td>
        <td>-</td>
        <td>-</td>
        <td>${formatCurrencyDecimal(FERT_APPLICATION_RATE)}</td>
        <td>${formatCurrency(dryFertAppCost)}</td>
    `;
    dryFertBody.appendChild(dryFertAppRow);
    document.getElementById('dryFertTotal').textContent = formatCurrency(dryFertTotal);
    document.getElementById('dryFertCostPerAcre').textContent = formatCurrencyDecimal(FERT_COST_PER_ACRE_DRY);

    // Dryland Summary
    const dryChemTotal = dryPreChemTotal + dryPostChemTotal;
    const drylandTotal = dryOpsTotal + dryRentTotal + dryInsTotal + dryChemTotal + dryFertTotal;
    document.getElementById('drySummaryOps').textContent = formatCurrency(dryOpsTotal);
    document.getElementById('drySummaryRent').textContent = formatCurrency(dryRentTotal);
    document.getElementById('drySummaryIns').textContent = formatCurrency(dryInsTotal);
    document.getElementById('drySummaryChem').textContent = formatCurrency(dryChemTotal);
    document.getElementById('drySummaryFert').textContent = formatCurrency(dryFertTotal);
    document.getElementById('drylandGrandTotal').textContent = formatCurrency(drylandTotal);
    document.getElementById('drylandCostPerAcre').textContent = formatCurrencyDecimal(drylandAcres > 0 ? drylandTotal / drylandAcres : 0);

    // ============================================
    // COMBINED TOTALS
    // ============================================
    const grandTotal = irrigatedTotal + drylandTotal;

    // Combined expense breakdown
    document.getElementById('combOpsIrr').textContent = formatCurrency(irrOpsTotal);
    document.getElementById('combOpsDry').textContent = formatCurrency(dryOpsTotal);
    document.getElementById('combOpsTotal').textContent = formatCurrency(irrOpsTotal + dryOpsTotal);

    document.getElementById('combIrrIrr').textContent = formatCurrency(irrIrrigationTotal);
    document.getElementById('combIrrTotal').textContent = formatCurrency(irrIrrigationTotal);

    document.getElementById('combRentIrr').textContent = formatCurrency(irrRentTotal);
    document.getElementById('combRentDry').textContent = formatCurrency(dryRentTotal);
    document.getElementById('combRentTotal').textContent = formatCurrency(irrRentTotal + dryRentTotal);

    document.getElementById('combInsIrr').textContent = formatCurrency(irrInsTotal);
    document.getElementById('combInsDry').textContent = formatCurrency(dryInsTotal);
    document.getElementById('combInsTotal').textContent = formatCurrency(irrInsTotal + dryInsTotal);

    document.getElementById('combChemIrr').textContent = formatCurrency(irrChemTotal);
    document.getElementById('combChemDry').textContent = formatCurrency(dryChemTotal);
    document.getElementById('combChemTotal').textContent = formatCurrency(irrChemTotal + dryChemTotal);

    document.getElementById('combFertIrr').textContent = formatCurrency(irrFertTotal);
    document.getElementById('combFertDry').textContent = formatCurrency(dryFertTotal);
    document.getElementById('combFertTotal').textContent = formatCurrency(irrFertTotal + dryFertTotal);

    document.getElementById('grandIrrigated').textContent = formatCurrency(irrigatedTotal);
    document.getElementById('grandDryland').textContent = formatCurrency(drylandTotal);
    document.getElementById('grandTotal').textContent = formatCurrency(grandTotal);

    document.getElementById('combCostPerAcreIrr').textContent = formatCurrencyDecimal(irrigatedAcres > 0 ? irrigatedTotal / irrigatedAcres : 0);
    document.getElementById('combCostPerAcreDry').textContent = formatCurrencyDecimal(drylandAcres > 0 ? drylandTotal / drylandAcres : 0);
    document.getElementById('combCostPerAcreAvg').textContent = formatCurrencyDecimal(totalAcres > 0 ? grandTotal / totalAcres : 0);

    // ============================================
    // REVENUE & PROFIT
    // ============================================
    const irrigatedRevenue = irrigatedBushels * cornPrice;
    const drylandRevenue = drylandBushels * cornPrice;
    const totalRevenue = irrigatedRevenue + drylandRevenue;

    const irrigatedNet = irrigatedRevenue - irrigatedTotal;
    const drylandNet = drylandRevenue - drylandTotal;
    const totalNet = totalRevenue - grandTotal;

    document.getElementById('irrigatedBushels').textContent = formatNumber(irrigatedBushels) + ' bu';
    document.getElementById('drylandBushels').textContent = formatNumber(drylandBushels) + ' bu';
    document.getElementById('totalBushels').textContent = formatNumber(totalBushels) + ' bu';

    document.getElementById('irrigatedRevenue').textContent = formatCurrency(irrigatedRevenue);
    document.getElementById('drylandRevenue').textContent = formatCurrency(drylandRevenue);
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);

    document.getElementById('irrigatedExpenses').textContent = formatCurrency(irrigatedTotal);
    document.getElementById('drylandExpenses').textContent = formatCurrency(drylandTotal);
    document.getElementById('totalExpenses').textContent = formatCurrency(grandTotal);

    document.getElementById('irrigatedNet').textContent = formatCurrency(irrigatedNet);
    document.getElementById('drylandNet').textContent = formatCurrency(drylandNet);
    document.getElementById('totalNet').textContent = formatCurrency(totalNet);

    document.getElementById('irrigatedReturn').textContent = formatCurrencyDecimal(irrigatedAcres > 0 ? irrigatedNet / irrigatedAcres : 0);
    document.getElementById('drylandReturn').textContent = formatCurrencyDecimal(drylandAcres > 0 ? drylandNet / drylandAcres : 0);
    document.getElementById('avgReturn').textContent = formatCurrencyDecimal(totalAcres > 0 ? totalNet / totalAcres : 0);

    // Profit summary box
    const profitBox = document.getElementById('profitBox');
    const netProfitDisplay = document.getElementById('netProfitDisplay');
    const profitPerAcre = document.getElementById('profitPerAcre');

    netProfitDisplay.textContent = formatCurrency(totalNet);
    profitPerAcre.textContent = formatCurrencyDecimal(totalAcres > 0 ? totalNet / totalAcres : 0) + '/acre average';

    if (totalNet >= 0) {
        profitBox.className = 'profit-box positive';
        profitBox.querySelector('h3').textContent = 'NET PROFIT';
    } else {
        profitBox.className = 'profit-box negative';
        profitBox.querySelector('h3').textContent = 'NET LOSS';
    }

    styleNetReturn('irrigatedNet', irrigatedNet);
    styleNetReturn('drylandNet', drylandNet);
    styleNetReturn('totalNet', totalNet);
}

function styleNetReturn(elementId, value) {
    const element = document.getElementById(elementId);
    if (value >= 0) {
        element.style.color = '#27ae60';
    } else {
        element.style.color = '#c0392b';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    calculate();
    document.getElementById('genDate').textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});
