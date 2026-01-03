/**
 * 2025 Crop Planner Calculator
 * CSU/Iowa State Extension Rates @ 75% Spread
 */

// ============================================
// RATE CONFIGURATION - CSU/Iowa State @ 75% Spread
// ============================================

// Field Operations ($/acre) - 75% of rate range
// Range source: CSU/Iowa State Extension Custom Rate Surveys
const OPERATIONS = [
    { name: 'Disk (Tandem)', passes: 2, rate: 14.50 },      // Range: $12-16, 75% = $15
    { name: 'Strip Till', passes: 1, rate: 18.75 },         // Range: $15-20, 75% = $18.75
    { name: 'Plant (Corn)', passes: 1, rate: 22.50 },       // Range: $18-24, 75% = $22.50
    { name: 'Harvest (Corn)', passes: 1, rate: 41.25 }      // Range: $35-43, 75% = $41
];

// Chemical Program - 3 Pass System
// Application cost per pass ($/acre)
const CHEM_APPLICATION_RATE = 9.75;  // Range: $8-11, 75% = $9.75

// Chemical Products ($/acre for product only)
const CHEMICALS = [
    {
        name: 'Valor SX (flumioxazin)',
        pass: 'Pre-1',
        ratePerAcre: 2.5,  // oz/acre
        costPerOz: 4.20,
        get costPerAcre() { return this.ratePerAcre * this.costPerOz; }
    },
    {
        name: 'Atrazine 4L',
        pass: 'Pre-1',
        ratePerAcre: 2.0,  // qt/acre
        costPerQt: 3.85,
        get costPerAcre() { return this.ratePerAcre * this.costPerQt; }
    },
    {
        name: 'Metolachlor (Dual II Magnum)',
        pass: 'Pre-2',
        ratePerAcre: 1.33,  // pt/acre
        costPerPt: 8.50,
        get costPerAcre() { return this.ratePerAcre * this.costPerPt; }
    },
    {
        name: 'Acetochlor (Warrant)',
        pass: 'Post',
        ratePerAcre: 3.0,  // pt/acre
        costPerPt: 4.75,
        get costPerAcre() { return this.ratePerAcre * this.costPerPt; }
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
const IRRIGATED_YIELD = 220;
const DRYLAND_YIELD = 140;

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

    const opsTotal = opsIrrigatedTotal + opsDrylandTotal;
    document.getElementById('opsIrrigatedTotal').textContent = formatCurrency(opsIrrigatedTotal);
    document.getElementById('opsDrylandTotal').textContent = formatCurrency(opsDrylandTotal);
    document.getElementById('opsTotal').textContent = formatCurrency(opsTotal);

    // Calculate Chemicals
    let chemTotalCost = 0;
    let applicationCost = 0;
    const chemicalBody = document.getElementById('chemicalBody');
    chemicalBody.innerHTML = '';

    // Group chemicals by pass for application cost
    const passes = new Set(CHEMICALS.map(c => c.pass));
    applicationCost = passes.size * CHEM_APPLICATION_RATE * totalAcres;

    CHEMICALS.forEach(chem => {
        const productCost = chem.costPerAcre * totalAcres;
        chemTotalCost += productCost;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${chem.name}</td>
            <td>${chem.pass}</td>
            <td>${chem.ratePerAcre} ${chem.costPerOz ? 'oz' : chem.costPerQt ? 'qt' : 'pt'}/ac</td>
            <td>${formatCurrencyDecimal(chem.costPerAcre)}</td>
            <td>${formatCurrency(productCost)}</td>
        `;
        chemicalBody.appendChild(row);
    });

    // Add application row
    const appRow = document.createElement('tr');
    appRow.innerHTML = `
        <td><em>Application (3 passes)</em></td>
        <td>-</td>
        <td>-</td>
        <td>${formatCurrencyDecimal(CHEM_APPLICATION_RATE * 3)}/ac</td>
        <td>${formatCurrency(applicationCost)}</td>
    `;
    chemicalBody.appendChild(appRow);

    const totalChemCost = chemTotalCost + applicationCost;
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

    // Split chemical costs proportionally
    const chemIrrigated = totalChemCost * (irrigatedAcres / totalAcres);
    const chemDryland = totalChemCost * (drylandAcres / totalAcres);

    const irrigatedTotal = opsIrrigatedTotal + chemIrrigated + fertIrrigatedTotal;
    const drylandTotal = opsDrylandTotal + chemDryland + fertDrylandTotal;

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
    document.getElementById('summaryChem').textContent = formatCurrency(chemTotalCost);
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
