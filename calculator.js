/**
 * 2025 Crop Planner Calculator
 * CSU/Iowa State Extension Rates @ 75% Spread
 * NE Colorado - Irrigated & Dryland Corn
 */

// ============================================
// RATE CONFIGURATION - CSU/Iowa State @ 75% Spread
// ============================================

// Field Operations ($/acre) - 75% of rate range
const OPERATIONS = [
    { name: 'Disk (Tandem)', passes: 2, rate: 14.50 },
    { name: 'Strip Till', passes: 1, rate: 18.75 },
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

// Pre-Emergence Chemicals
const PRE_CHEMICALS = [
    { name: 'Glyphosate 41% (Generic)', ratePerAcre: 32, unit: 'oz', costPerAcre: GLYPHOSATE_COST },
    { name: 'Valor SX (flumioxazin)', ratePerAcre: 2.5, unit: 'oz', costPerAcre: VALOR_COST },
    { name: 'Atrazine 4L', ratePerAcre: 1.0, unit: 'pt', costPerAcre: ATRAZINE_COST },
    { name: 'Metolachlor (Dual II Magnum)', ratePerAcre: 1.33, unit: 'pt', costPerAcre: METOLACHLOR_COST },
    { name: 'Fluroxypyr (Starane Ultra)', ratePerAcre: 0.67, unit: 'pt', costPerAcre: FLUROXYPYR_COST },
    { name: 'Hydrovant (adjuvant)', ratePerAcre: 0.1, unit: '% v/v', costPerAcre: HYDROVANT_COST_PER_ACRE }
];

// Pre-calculated cost per acre for Pre-emergence (including application)
const PRE_COST_PER_ACRE = GLYPHOSATE_COST + VALOR_COST + ATRAZINE_COST + METOLACHLOR_COST + FLUROXYPYR_COST + HYDROVANT_COST_PER_ACRE + CHEM_APPLICATION_RATE;

// Post-Emergence Chemicals
const POST_CHEMICALS = [
    { name: 'Glyphosate 41% (Generic)', ratePerAcre: 32, unit: 'oz', costPerAcre: GLYPHOSATE_COST },
    { name: 'AMS (Ammonium Sulfate)', ratePerAcre: 2.5, unit: 'lb', costPerAcre: AMS_COST },
    { name: 'Atrazine 4L', ratePerAcre: 1.0, unit: 'pt', costPerAcre: ATRAZINE_COST },
    { name: 'DiFlexx (dicamba)', ratePerAcre: 3.0, unit: 'oz', costPerAcre: DIFLEXX_COST },
    { name: 'Hydrovant (adjuvant)', ratePerAcre: 0.1, unit: '% v/v', costPerAcre: HYDROVANT_COST_PER_ACRE },
    { name: 'Acetochlor (Warrant)', ratePerAcre: 3.0, unit: 'pt', costPerAcre: WARRANT_COST, irrigatedOnly: true }
];

// Pre-calculated cost per acre for Post-emergence (including application)
const POST_COST_PER_ACRE_IRR = GLYPHOSATE_COST + AMS_COST + ATRAZINE_COST + DIFLEXX_COST + HYDROVANT_COST_PER_ACRE + WARRANT_COST + CHEM_APPLICATION_RATE;
const POST_COST_PER_ACRE_DRY = GLYPHOSATE_COST + AMS_COST + ATRAZINE_COST + DIFLEXX_COST + HYDROVANT_COST_PER_ACRE + CHEM_APPLICATION_RATE;

// Fertilizer - 220N-40P-25S
const NITROGEN_COST = 220 * 0.58;         // $127.60
const PHOSPHORUS_COST = 40 * 0.61;        // $24.40
const SULFUR_COST = 25 * 0.38;            // $9.50
const FERT_APPLICATION_RATE = 8.25;

const FERTILIZER = [
    { nutrient: 'Nitrogen (N)', lbsPerAcre: 220, pricePerLb: 0.58, costPerAcre: NITROGEN_COST },
    { nutrient: 'Phosphorus (P2O5)', lbsPerAcre: 40, pricePerLb: 0.61, costPerAcre: PHOSPHORUS_COST },
    { nutrient: 'Sulfur (S)', lbsPerAcre: 25, pricePerLb: 0.38, costPerAcre: SULFUR_COST }
];

// Pre-calculated cost per acre for Fertilizer (including application)
const FERT_COST_PER_ACRE = NITROGEN_COST + PHOSPHORUS_COST + SULFUR_COST + FERT_APPLICATION_RATE;

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

    // ============================================
    // FIELD OPERATIONS
    // ============================================
    let opsIrrigatedTotal = 0;
    let opsDrylandTotal = 0;
    const operationsBody = document.getElementById('operationsBody');
    operationsBody.innerHTML = '';

    OPERATIONS.forEach(op => {
        const irrigatedCost = op.rate * op.passes * irrigatedAcres;
        const drylandCost = op.rate * op.passes * drylandAcres;
        const totalCost = irrigatedCost + drylandCost;

        opsIrrigatedTotal += irrigatedCost;
        opsDrylandTotal += drylandCost;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${op.name}</td>
            <td>${op.passes}</td>
            <td>${formatCurrencyDecimal(op.rate)}</td>
            <td>${formatCurrency(irrigatedCost)}</td>
            <td>${formatCurrency(drylandCost)}</td>
            <td>${formatCurrency(totalCost)}</td>
        `;
        operationsBody.appendChild(row);
    });

    // Add Hauling
    const irrigatedHaulCost = irrigatedBushels * HAUL_RATE_PER_BUSHEL;
    const drylandHaulCost = drylandBushels * HAUL_RATE_PER_BUSHEL;
    opsIrrigatedTotal += irrigatedHaulCost;
    opsDrylandTotal += drylandHaulCost;

    const haulRow = document.createElement('tr');
    haulRow.innerHTML = `
        <td>Hauling (${HAUL_DISTANCE_ONE_WAY} mi one-way)</td>
        <td>-</td>
        <td>${formatCurrencyDecimal(HAUL_RATE_PER_BUSHEL)}/bu</td>
        <td>${formatCurrency(irrigatedHaulCost)}</td>
        <td>${formatCurrency(drylandHaulCost)}</td>
        <td>${formatCurrency(irrigatedHaulCost + drylandHaulCost)}</td>
    `;
    operationsBody.appendChild(haulRow);

    const opsTotal = opsIrrigatedTotal + opsDrylandTotal;
    document.getElementById('opsIrrigatedTotal').textContent = formatCurrency(opsIrrigatedTotal);
    document.getElementById('opsDrylandTotal').textContent = formatCurrency(opsDrylandTotal);
    document.getElementById('opsTotal').textContent = formatCurrency(opsTotal);

    // ============================================
    // IRRIGATION COSTS
    // ============================================
    let irrIrrigatedTotal = 0;
    const irrigationBody = document.getElementById('irrigationBody');
    irrigationBody.innerHTML = '';

    IRRIGATION_COSTS.forEach(item => {
        const irrigatedCost = item.costPerAcre * irrigatedAcres;
        irrIrrigatedTotal += irrigatedCost;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.details}</td>
            <td>${formatCurrencyDecimal(item.costPerAcre)}</td>
            <td>${formatCurrency(irrigatedCost)}</td>
            <td>$0</td>
            <td>${formatCurrency(irrigatedCost)}</td>
        `;
        irrigationBody.appendChild(row);
    });

    document.getElementById('irrIrrigatedTotal').textContent = formatCurrency(irrIrrigatedTotal);
    document.getElementById('irrDrylandTotal').textContent = '$0';
    document.getElementById('irrTotal').textContent = formatCurrency(irrIrrigatedTotal);

    // ============================================
    // LAND RENTAL
    // ============================================
    const landRentBody = document.getElementById('landRentBody');
    landRentBody.innerHTML = '';

    const irrigatedRentCost = LAND_RENTAL.irrigated.costPerAcre * irrigatedAcres;
    const drylandRentCost = LAND_RENTAL.dryland.costPerAcre * drylandAcres;
    const totalRentCost = irrigatedRentCost + drylandRentCost;

    // Irrigated rent row
    const irrRentRow = document.createElement('tr');
    irrRentRow.innerHTML = `
        <td>${LAND_RENTAL.irrigated.name}</td>
        <td>NE Colorado avg rate</td>
        <td>${formatCurrencyDecimal(LAND_RENTAL.irrigated.costPerAcre)}</td>
        <td>${formatCurrency(irrigatedRentCost)}</td>
        <td>$0</td>
        <td>${formatCurrency(irrigatedRentCost)}</td>
    `;
    landRentBody.appendChild(irrRentRow);

    // Dryland rent row
    const dryRentRow = document.createElement('tr');
    dryRentRow.innerHTML = `
        <td>${LAND_RENTAL.dryland.name}</td>
        <td>NE Colorado avg rate</td>
        <td>${formatCurrencyDecimal(LAND_RENTAL.dryland.costPerAcre)}</td>
        <td>$0</td>
        <td>${formatCurrency(drylandRentCost)}</td>
        <td>${formatCurrency(drylandRentCost)}</td>
    `;
    landRentBody.appendChild(dryRentRow);

    document.getElementById('rentIrrigatedTotal').textContent = formatCurrency(irrigatedRentCost);
    document.getElementById('rentDrylandTotal').textContent = formatCurrency(drylandRentCost);
    document.getElementById('rentTotal').textContent = formatCurrency(totalRentCost);

    // ============================================
    // CROP INSURANCE
    // ============================================
    let insIrrigatedTotal = 0;
    let insDrylandTotal = 0;
    const insuranceBody = document.getElementById('insuranceBody');
    insuranceBody.innerHTML = '';

    // Irrigated insurance
    CROP_INSURANCE.irrigated.forEach(ins => {
        const cost = ins.costPerAcre * irrigatedAcres;
        insIrrigatedTotal += cost;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ins.name} (Irrigated)</td>
            <td>${ins.details}</td>
            <td>${formatCurrencyDecimal(ins.costPerAcre)}</td>
            <td>${formatCurrency(cost)}</td>
            <td>$0</td>
            <td>${formatCurrency(cost)}</td>
        `;
        insuranceBody.appendChild(row);
    });

    // Dryland insurance
    CROP_INSURANCE.dryland.forEach(ins => {
        const cost = ins.costPerAcre * drylandAcres;
        insDrylandTotal += cost;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ins.name} (Dryland)</td>
            <td>${ins.details}</td>
            <td>${formatCurrencyDecimal(ins.costPerAcre)}</td>
            <td>$0</td>
            <td>${formatCurrency(cost)}</td>
            <td>${formatCurrency(cost)}</td>
        `;
        insuranceBody.appendChild(row);
    });

    const totalInsuranceCost = insIrrigatedTotal + insDrylandTotal;
    document.getElementById('insIrrigatedTotal').textContent = formatCurrency(insIrrigatedTotal);
    document.getElementById('insDrylandTotal').textContent = formatCurrency(insDrylandTotal);
    document.getElementById('insTotal').textContent = formatCurrency(totalInsuranceCost);

    // ============================================
    // PRE-EMERGENCE CHEMICALS
    // ============================================
    let preIrrigatedTotal = 0;
    let preDrylandTotal = 0;
    const preChemBody = document.getElementById('preChemBody');
    preChemBody.innerHTML = '';

    PRE_CHEMICALS.forEach(chem => {
        const irrigatedCost = chem.costPerAcre * irrigatedAcres;
        const drylandCost = chem.costPerAcre * drylandAcres;
        preIrrigatedTotal += irrigatedCost;
        preDrylandTotal += drylandCost;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${chem.name}</td>
            <td>${chem.ratePerAcre} ${chem.unit}/ac</td>
            <td>${formatCurrencyDecimal(chem.costPerAcre)}</td>
            <td>${formatCurrency(irrigatedCost)}</td>
            <td>${formatCurrency(drylandCost)}</td>
            <td>${formatCurrency(irrigatedCost + drylandCost)}</td>
        `;
        preChemBody.appendChild(row);
    });

    // Pre application cost
    const preAppIrrigated = CHEM_APPLICATION_RATE * irrigatedAcres;
    const preAppDryland = CHEM_APPLICATION_RATE * drylandAcres;
    preIrrigatedTotal += preAppIrrigated;
    preDrylandTotal += preAppDryland;

    const preAppRow = document.createElement('tr');
    preAppRow.innerHTML = `
        <td><em>Application Cost</em></td>
        <td>@ ${SPRAY_RATE_GPA} GPA</td>
        <td>${formatCurrencyDecimal(CHEM_APPLICATION_RATE)}</td>
        <td>${formatCurrency(preAppIrrigated)}</td>
        <td>${formatCurrency(preAppDryland)}</td>
        <td>${formatCurrency(preAppIrrigated + preAppDryland)}</td>
    `;
    preChemBody.appendChild(preAppRow);

    const preTotal = preIrrigatedTotal + preDrylandTotal;
    document.getElementById('preIrrigatedTotal').textContent = formatCurrency(preIrrigatedTotal);
    document.getElementById('preDrylandTotal').textContent = formatCurrency(preDrylandTotal);
    document.getElementById('preChemTotal').textContent = formatCurrency(preTotal);

    // Pre-emergence cost per acre (same for irrigated and dryland)
    document.getElementById('preCostPerAcre').textContent = formatCurrencyDecimal(PRE_COST_PER_ACRE);

    // ============================================
    // POST-EMERGENCE CHEMICALS
    // ============================================
    let postIrrigatedTotal = 0;
    let postDrylandTotal = 0;
    const postChemBody = document.getElementById('postChemBody');
    postChemBody.innerHTML = '';

    POST_CHEMICALS.forEach(chem => {
        let irrigatedCost, drylandCost;

        if (chem.irrigatedOnly) {
            irrigatedCost = chem.costPerAcre * irrigatedAcres;
            drylandCost = 0;
        } else {
            irrigatedCost = chem.costPerAcre * irrigatedAcres;
            drylandCost = chem.costPerAcre * drylandAcres;
        }

        postIrrigatedTotal += irrigatedCost;
        postDrylandTotal += drylandCost;

        const row = document.createElement('tr');
        const noteText = chem.irrigatedOnly ? ' <em>(irr only)</em>' : '';
        row.innerHTML = `
            <td>${chem.name}${noteText}</td>
            <td>${chem.ratePerAcre} ${chem.unit}/ac</td>
            <td>${formatCurrencyDecimal(chem.costPerAcre)}</td>
            <td>${formatCurrency(irrigatedCost)}</td>
            <td>${formatCurrency(drylandCost)}</td>
            <td>${formatCurrency(irrigatedCost + drylandCost)}</td>
        `;
        postChemBody.appendChild(row);
    });

    // Post application cost
    const postAppIrrigated = CHEM_APPLICATION_RATE * irrigatedAcres;
    const postAppDryland = CHEM_APPLICATION_RATE * drylandAcres;
    postIrrigatedTotal += postAppIrrigated;
    postDrylandTotal += postAppDryland;

    const postAppRow = document.createElement('tr');
    postAppRow.innerHTML = `
        <td><em>Application Cost</em></td>
        <td>@ ${SPRAY_RATE_GPA} GPA</td>
        <td>${formatCurrencyDecimal(CHEM_APPLICATION_RATE)}</td>
        <td>${formatCurrency(postAppIrrigated)}</td>
        <td>${formatCurrency(postAppDryland)}</td>
        <td>${formatCurrency(postAppIrrigated + postAppDryland)}</td>
    `;
    postChemBody.appendChild(postAppRow);

    const postTotal = postIrrigatedTotal + postDrylandTotal;
    document.getElementById('postIrrigatedTotal').textContent = formatCurrency(postIrrigatedTotal);
    document.getElementById('postDrylandTotal').textContent = formatCurrency(postDrylandTotal);
    document.getElementById('postChemTotal').textContent = formatCurrency(postTotal);

    // Post-emergence cost per acre (different for irrigated vs dryland due to Warrant)
    document.getElementById('postCostPerAcreIrr').textContent = formatCurrencyDecimal(POST_COST_PER_ACRE_IRR);
    document.getElementById('postCostPerAcreDry').textContent = formatCurrencyDecimal(POST_COST_PER_ACRE_DRY);

    // Combined chemical totals
    const chemIrrigatedTotal = preIrrigatedTotal + postIrrigatedTotal;
    const chemDrylandTotal = preDrylandTotal + postDrylandTotal;
    const totalChemCost = chemIrrigatedTotal + chemDrylandTotal;

    // ============================================
    // FERTILIZER COSTS
    // ============================================
    let fertIrrigatedTotal = 0;
    let fertDrylandTotal = 0;
    const fertilizerBody = document.getElementById('fertilizerBody');
    fertilizerBody.innerHTML = '';

    FERTILIZER.forEach(fert => {
        const costPerAcre = fert.lbsPerAcre * fert.pricePerLb;
        const irrigatedCost = costPerAcre * irrigatedAcres;
        const drylandCost = costPerAcre * drylandAcres;

        fertIrrigatedTotal += irrigatedCost;
        fertDrylandTotal += drylandCost;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fert.nutrient}</td>
            <td>${fert.lbsPerAcre}</td>
            <td>${formatCurrencyDecimal(fert.pricePerLb)}</td>
            <td>${formatCurrencyDecimal(costPerAcre)}</td>
            <td>${formatCurrency(irrigatedCost)}</td>
            <td>${formatCurrency(drylandCost)}</td>
        `;
        fertilizerBody.appendChild(row);
    });

    // Fertilizer application cost
    const fertAppIrrigated = FERT_APPLICATION_RATE * irrigatedAcres;
    const fertAppDryland = FERT_APPLICATION_RATE * drylandAcres;
    fertIrrigatedTotal += fertAppIrrigated;
    fertDrylandTotal += fertAppDryland;

    const fertAppRow = document.createElement('tr');
    fertAppRow.innerHTML = `
        <td><em>Application</em></td>
        <td>-</td>
        <td>-</td>
        <td>${formatCurrencyDecimal(FERT_APPLICATION_RATE)}</td>
        <td>${formatCurrency(fertAppIrrigated)}</td>
        <td>${formatCurrency(fertAppDryland)}</td>
    `;
    fertilizerBody.appendChild(fertAppRow);

    const fertTotal = fertIrrigatedTotal + fertDrylandTotal;
    document.getElementById('fertIrrigatedTotal').textContent = formatCurrency(fertIrrigatedTotal);
    document.getElementById('fertDrylandTotal').textContent = formatCurrency(fertDrylandTotal);
    document.getElementById('fertTotal').textContent = formatCurrency(fertTotal);

    // Fertilizer cost per acre (same for irrigated and dryland)
    document.getElementById('fertCostPerAcre').textContent = formatCurrencyDecimal(FERT_COST_PER_ACRE);

    // ============================================
    // TOTAL EXPENSES
    // ============================================
    const irrigatedTotal = opsIrrigatedTotal + irrIrrigatedTotal + irrigatedRentCost + insIrrigatedTotal + chemIrrigatedTotal + fertIrrigatedTotal;
    const drylandTotal = opsDrylandTotal + drylandRentCost + insDrylandTotal + chemDrylandTotal + fertDrylandTotal;
    const grandTotal = irrigatedTotal + drylandTotal;

    // Update summary cards
    document.getElementById('totalAcres').textContent = totalAcres.toLocaleString();
    document.getElementById('totalCost').textContent = formatCurrency(grandTotal);
    document.getElementById('costPerAcre').textContent = formatCurrencyDecimal(totalAcres > 0 ? grandTotal / totalAcres : 0);

    // Update crop stats
    document.getElementById('irrigatedYield').textContent = IRRIGATED_YIELD;
    document.getElementById('drylandYield').textContent = DRYLAND_YIELD;
    document.getElementById('irrigatedCostPerAcre').textContent = formatCurrencyDecimal(irrigatedAcres > 0 ? irrigatedTotal / irrigatedAcres : 0);
    document.getElementById('drylandCostPerAcre').textContent = formatCurrencyDecimal(drylandAcres > 0 ? drylandTotal / drylandAcres : 0);
    document.getElementById('irrigatedTotalCost').textContent = formatCurrency(irrigatedTotal);
    document.getElementById('drylandTotalCost').textContent = formatCurrency(drylandTotal);

    // Update expense breakdown
    const totalAppCost = preAppIrrigated + preAppDryland + postAppIrrigated + postAppDryland + fertAppIrrigated + fertAppDryland;
    document.getElementById('summaryOps').textContent = formatCurrency(opsTotal);
    document.getElementById('summaryIrr').textContent = formatCurrency(irrIrrigatedTotal);
    document.getElementById('summaryRent').textContent = formatCurrency(totalRentCost);
    document.getElementById('summaryIns').textContent = formatCurrency(totalInsuranceCost);
    document.getElementById('summaryChem').textContent = formatCurrency(totalChemCost - (preAppIrrigated + preAppDryland + postAppIrrigated + postAppDryland));
    document.getElementById('summaryFert').textContent = formatCurrency(fertTotal - fertAppIrrigated - fertAppDryland);
    document.getElementById('summaryApp').textContent = formatCurrency(totalAppCost);

    document.getElementById('grandTotal').textContent = formatCurrency(grandTotal);
    document.getElementById('grandIrrigated').textContent = formatCurrency(irrigatedTotal);
    document.getElementById('grandDryland').textContent = formatCurrency(drylandTotal);
    document.getElementById('irrigatedPerAcreExp').textContent = formatCurrencyDecimal(irrigatedAcres > 0 ? irrigatedTotal / irrigatedAcres : 0);
    document.getElementById('drylandPerAcreExp').textContent = formatCurrencyDecimal(drylandAcres > 0 ? drylandTotal / drylandAcres : 0);

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
