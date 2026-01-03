/**
 * 2025 Crop Planner Calculator
 * CSU/Iowa State Extension Rates @ 75% Spread
 * NE Colorado - Irrigated & Dryland Corn
 */

// ============================================
// RATE CONFIGURATION - CSU/Iowa State @ 75% Spread
// ============================================

// Field Operations ($/acre) - 75% of rate range
// Range source: CSU/Iowa State Extension Custom Rate Surveys
const OPERATIONS = [
    { name: 'Disk (Tandem)', passes: 2, rate: 14.50 },      // Range: $12-16, 75% = $14.50
    { name: 'Strip Till', passes: 1, rate: 18.75 },         // Range: $15-20, 75% = $18.75
    { name: 'Plant (Corn)', passes: 1, rate: 22.50 },       // Range: $18-24, 75% = $22.50
    { name: 'Combine (Corn)', passes: 1, rate: 41.25 },     // Range: $35-43, 75% = $41.25
    { name: 'Grain Cart', passes: 1, rate: 5.50 }           // Range: $4-6, 75% = $5.50
];

// Hauling Configuration - 22 miles one way
const HAUL_DISTANCE_ONE_WAY = 22;  // miles
const HAUL_RATE_PER_BUSHEL = 0.18; // $/bu for ~22 mile haul - Range: $0.12-0.20, 75% = $0.18

// Chemical Program - 2 Pass System
// Application cost per pass ($/acre)
const CHEM_APPLICATION_RATE = 9.75;  // Range: $8-11, 75% = $9.75

// Spray Configuration
const SPRAY_RATE_GPA = 12;  // gallons per acre
const HYDROVANT_RATE_PERCENT = 0.001;  // 0.1% = 1 gal per 1000 gal
const HYDROVANT_COST_PER_GAL = 165.00;
// Hydrovant cost: 12 GPA × 0.001 = 0.012 gal/ac × $165 = $1.98/ac
const HYDROVANT_COST_PER_ACRE = SPRAY_RATE_GPA * HYDROVANT_RATE_PERCENT * HYDROVANT_COST_PER_GAL;

// Chemical Products ($/acre for product only)
// NE Colorado 2-pass program - irrigatedOnly: true means only applied to irrigated acres
const CHEMICALS = [
    // === PASS 1: Pre-emergence ===
    {
        name: 'Glyphosate 41% (Generic)',
        pass: 'Pre',
        ratePerAcre: 32,  // oz/acre (1 qt)
        unit: 'oz',
        costPerUnit: 0.12,  // ~$15/gal = $0.12/oz
        get costPerAcre() { return this.ratePerAcre * this.costPerUnit; }
    },
    {
        name: 'Valor SX (flumioxazin)',
        pass: 'Pre',
        ratePerAcre: 2.5,  // oz/acre
        unit: 'oz',
        costPerUnit: 4.20,
        get costPerAcre() { return this.ratePerAcre * this.costPerUnit; }
    },
    {
        name: 'Atrazine 4L',
        pass: 'Pre',
        ratePerAcre: 1.0,  // pt/acre
        unit: 'pt',
        costPerUnit: 1.95,  // ~$3.85/qt = $1.95/pt
        get costPerAcre() { return this.ratePerAcre * this.costPerUnit; }
    },
    {
        name: 'Metolachlor (Dual II Magnum)',
        pass: 'Pre',
        ratePerAcre: 1.33,  // pt/acre
        unit: 'pt',
        costPerUnit: 8.50,
        get costPerAcre() { return this.ratePerAcre * this.costPerUnit; }
    },
    {
        name: 'Fluroxypyr (Starane Ultra)',
        pass: 'Pre',
        ratePerAcre: 0.67,  // pt/acre (typical rate 0.5-1 pt)
        unit: 'pt',
        costPerUnit: 12.50,  // ~$100/gal = $12.50/pt
        get costPerAcre() { return this.ratePerAcre * this.costPerUnit; }
    },
    {
        name: 'Hydrovant (adjuvant)',
        pass: 'Pre',
        ratePerAcre: 0.1,  // % v/v at 12 GPA
        unit: '% v/v',
        costPerAcre: HYDROVANT_COST_PER_ACRE  // $1.98/ac
    },
    // === PASS 2: Post-emergence ===
    {
        name: 'Glyphosate 41% (Generic)',
        pass: 'Post',
        ratePerAcre: 32,  // oz/acre (1 qt)
        unit: 'oz',
        costPerUnit: 0.12,
        get costPerAcre() { return this.ratePerAcre * this.costPerUnit; }
    },
    {
        name: 'AMS (Ammonium Sulfate)',
        pass: 'Post',
        ratePerAcre: 2.5,  // lbs/acre
        unit: 'lb',
        costPerUnit: 0.35,  // ~$17.50/50lb bag
        get costPerAcre() { return this.ratePerAcre * this.costPerUnit; }
    },
    {
        name: 'Atrazine 4L',
        pass: 'Post',
        ratePerAcre: 1.0,  // pt/acre
        unit: 'pt',
        costPerUnit: 1.95,
        get costPerAcre() { return this.ratePerAcre * this.costPerUnit; }
    },
    {
        name: 'DiFlexx (dicamba)',
        pass: 'Post',
        ratePerAcre: 3.0,  // oz/acre - safened dicamba
        unit: 'oz',
        costPerUnit: 0.95,  // ~$12/gal = $0.95/oz
        get costPerAcre() { return this.ratePerAcre * this.costPerUnit; }
    },
    {
        name: 'Hydrovant (adjuvant)',
        pass: 'Post',
        ratePerAcre: 0.1,  // % v/v at 12 GPA
        unit: '% v/v',
        costPerAcre: HYDROVANT_COST_PER_ACRE  // $1.98/ac
    },
    {
        name: 'Acetochlor (Warrant)',
        pass: 'Post',
        ratePerAcre: 3.0,  // pt/acre - residual for late-season
        unit: 'pt',
        costPerUnit: 4.75,
        irrigatedOnly: true,  // NOT applied to dryland
        get costPerAcre() { return this.ratePerAcre * this.costPerUnit; }
    }
];

// Fertilizer - 220N-40P-25S
// Prices at 75% of typical range
const FERTILIZER = [
    { nutrient: 'Nitrogen (N)', lbsPerAcre: 220, pricePerLb: 0.58 },    // Range: $0.45-0.62, 75% = $0.58
    { nutrient: 'Phosphorus (P2O5)', lbsPerAcre: 40, pricePerLb: 0.61 }, // Range: $0.52-0.64, 75% = $0.61
    { nutrient: 'Sulfur (S)', lbsPerAcre: 25, pricePerLb: 0.38 }        // Range: $0.28-0.42, 75% = $0.38
];

// Fertilizer application cost
const FERT_APPLICATION_RATE = 8.25;  // $/acre - Range: $6-9, 75% = $8.25

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

function calculate() {
    const irrigatedAcres = parseFloat(document.getElementById('irrigatedAcres').value) || 0;
    const drylandAcres = parseFloat(document.getElementById('drylandAcres').value) || 0;
    const totalAcres = irrigatedAcres + drylandAcres;
    const cornPrice = parseFloat(document.getElementById('cornPrice').value) || 4.50;

    // Calculate bushels for hauling
    const irrigatedBushels = irrigatedAcres * IRRIGATED_YIELD;
    const drylandBushels = drylandAcres * DRYLAND_YIELD;

    // Calculate Operations
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

    // Add Hauling (yield-dependent)
    const irrigatedHaulCost = irrigatedBushels * HAUL_RATE_PER_BUSHEL;
    const drylandHaulCost = drylandBushels * HAUL_RATE_PER_BUSHEL;
    const totalHaulCost = irrigatedHaulCost + drylandHaulCost;

    opsIrrigatedTotal += irrigatedHaulCost;
    opsDrylandTotal += drylandHaulCost;

    const haulRow = document.createElement('tr');
    haulRow.innerHTML = `
        <td>Hauling (${HAUL_DISTANCE_ONE_WAY} mi one-way)</td>
        <td>-</td>
        <td>${formatCurrencyDecimal(HAUL_RATE_PER_BUSHEL)}/bu</td>
        <td>${formatCurrency(irrigatedHaulCost)}</td>
        <td>${formatCurrency(drylandHaulCost)}</td>
        <td>${formatCurrency(totalHaulCost)}</td>
    `;
    operationsBody.appendChild(haulRow);

    const opsTotal = opsIrrigatedTotal + opsDrylandTotal;
    document.getElementById('opsIrrigatedTotal').textContent = formatCurrency(opsIrrigatedTotal);
    document.getElementById('opsDrylandTotal').textContent = formatCurrency(opsDrylandTotal);
    document.getElementById('opsTotal').textContent = formatCurrency(opsTotal);

    // Calculate Chemicals (with irrigated-only support)
    let chemIrrigatedTotal = 0;
    let chemDrylandTotal = 0;
    const chemicalBody = document.getElementById('chemicalBody');
    chemicalBody.innerHTML = '';

    // Group chemicals by pass for application cost
    const passes = new Set(CHEMICALS.map(c => c.pass));
    const applicationCost = passes.size * CHEM_APPLICATION_RATE * totalAcres;

    CHEMICALS.forEach(chem => {
        let irrigatedCost, drylandCost, productCost;

        if (chem.irrigatedOnly) {
            // Only apply to irrigated acres
            irrigatedCost = chem.costPerAcre * irrigatedAcres;
            drylandCost = 0;
            productCost = irrigatedCost;
        } else {
            // Apply to all acres
            irrigatedCost = chem.costPerAcre * irrigatedAcres;
            drylandCost = chem.costPerAcre * drylandAcres;
            productCost = irrigatedCost + drylandCost;
        }

        chemIrrigatedTotal += irrigatedCost;
        chemDrylandTotal += drylandCost;

        const row = document.createElement('tr');
        const noteText = chem.irrigatedOnly ? ' <em>(irr only)</em>' : '';
        row.innerHTML = `
            <td>${chem.name}${noteText}</td>
            <td>${chem.pass}</td>
            <td>${chem.ratePerAcre} ${chem.unit}/ac</td>
            <td>${formatCurrencyDecimal(chem.costPerAcre)}</td>
            <td>${formatCurrency(productCost)}</td>
        `;
        chemicalBody.appendChild(row);
    });

    // Add application row
    const numPasses = passes.size;
    const appRow = document.createElement('tr');
    appRow.innerHTML = `
        <td><em>Application (${numPasses} passes @ ${SPRAY_RATE_GPA} GPA)</em></td>
        <td>-</td>
        <td>-</td>
        <td>${formatCurrencyDecimal(CHEM_APPLICATION_RATE * numPasses)}/ac</td>
        <td>${formatCurrency(applicationCost)}</td>
    `;
    chemicalBody.appendChild(appRow);

    // Split application cost proportionally
    const appIrrigated = totalAcres > 0 ? applicationCost * (irrigatedAcres / totalAcres) : 0;
    const appDryland = totalAcres > 0 ? applicationCost * (drylandAcres / totalAcres) : 0;
    chemIrrigatedTotal += appIrrigated;
    chemDrylandTotal += appDryland;

    const totalChemCost = chemIrrigatedTotal + chemDrylandTotal;
    document.getElementById('chemTotal').textContent = formatCurrency(totalChemCost);

    // Calculate Fertilizer
    let fertCostPerAcre = 0;
    let fertIrrigatedTotal = 0;
    let fertDrylandTotal = 0;
    const fertilizerBody = document.getElementById('fertilizerBody');
    fertilizerBody.innerHTML = '';

    FERTILIZER.forEach(fert => {
        const costPerAcre = fert.lbsPerAcre * fert.pricePerLb;
        fertCostPerAcre += costPerAcre;
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

    // Add application cost row
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

    // Calculate totals
    const grandTotal = opsTotal + totalChemCost + fertTotal;

    const irrigatedTotal = opsIrrigatedTotal + chemIrrigatedTotal + fertIrrigatedTotal;
    const drylandTotal = opsDrylandTotal + chemDrylandTotal + fertDrylandTotal;

    // Update summary
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

    // Update breakdown summary
    document.getElementById('summaryOps').textContent = formatCurrency(opsTotal);
    document.getElementById('summaryChem').textContent = formatCurrency(totalChemCost - applicationCost);
    document.getElementById('summaryFert').textContent = formatCurrency(fertTotal - (fertAppIrrigated + fertAppDryland));
    document.getElementById('summaryApp').textContent = formatCurrency(applicationCost + fertAppIrrigated + fertAppDryland);

    document.getElementById('grandTotal').textContent = formatCurrency(grandTotal);
    document.getElementById('grandIrrigated').textContent = formatCurrency(irrigatedTotal);
    document.getElementById('grandDryland').textContent = formatCurrency(drylandTotal);

    // Profit Analysis
    const irrigatedRevenue = irrigatedAcres * IRRIGATED_YIELD * cornPrice;
    const drylandRevenue = drylandAcres * DRYLAND_YIELD * cornPrice;
    const totalRevenue = irrigatedRevenue + drylandRevenue;

    const irrigatedNet = irrigatedRevenue - irrigatedTotal;
    const drylandNet = drylandRevenue - drylandTotal;
    const totalNet = totalRevenue - grandTotal;

    document.getElementById('irrigatedRevenue').textContent = formatCurrency(irrigatedRevenue);
    document.getElementById('irrigatedNet').textContent = formatCurrency(irrigatedNet);
    document.getElementById('irrigatedReturn').textContent = formatCurrencyDecimal(irrigatedAcres > 0 ? irrigatedNet / irrigatedAcres : 0);

    document.getElementById('drylandRevenue').textContent = formatCurrency(drylandRevenue);
    document.getElementById('drylandNet').textContent = formatCurrency(drylandNet);
    document.getElementById('drylandReturn').textContent = formatCurrencyDecimal(drylandAcres > 0 ? drylandNet / drylandAcres : 0);

    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('totalNet').textContent = formatCurrency(totalNet);
    document.getElementById('avgReturn').textContent = formatCurrencyDecimal(totalAcres > 0 ? totalNet / totalAcres : 0);

    // Color code net returns
    styleNetReturn('irrigatedNet', irrigatedNet);
    styleNetReturn('drylandNet', drylandNet);
    styleNetReturn('totalNet', totalNet);
}

function styleNetReturn(elementId, value) {
    const element = document.getElementById(elementId);
    if (value >= 0) {
        element.style.color = '#28a745';
    } else {
        element.style.color = '#dc3545';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    calculate();
    document.getElementById('genDate').textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});
