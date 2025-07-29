// This file is intentionally left blank.

\Desktop\Githubcopiliot\bucks2bar\src\js\main.js
const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
];

// Generate years from 2000 to current year
const currentYear = new Date().getFullYear();
const years = [];
for(let y = 2000; y <= currentYear; y++) years.push(y);

let financeData = {};

// Load from localStorage if available
if (localStorage.getItem('financeData')) {
    financeData = JSON.parse(localStorage.getItem('financeData'));
} else {
    years.forEach(year => {
        financeData[year] = {};
        months.forEach(month => {
            financeData[year][month] = {income: 0, expense: 0};
        });
    });
}

let yearlyChart = null;

document.addEventListener("DOMContentLoaded", function() {
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    const incomeInput = document.getElementById('incomeInput');
    const expenseInput = document.getElementById('expenseInput');
    const form = document.getElementById('financeForm');
    const alertBox = document.getElementById('alertBox');
    const summaryTable = document.getElementById('summaryTable');

    // Populate year dropdown
    yearSelect.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');
    yearSelect.value = currentYear;

    function updateFormFields() {
        const year = yearSelect.value;
        const month = monthSelect.value;
        // If new year/month, initialize
        if (!financeData[year]) {
            financeData[year] = {};
            months.forEach(m => financeData[year][m] = {income: 0, expense: 0});
        }
        if (!financeData[year][month]) {
            financeData[year][month] = {income: 0, expense: 0};
        }
        incomeInput.value = financeData[year][month].income;
        expenseInput.value = financeData[year][month].expense;
        alertBox.innerHTML = '';
    }

    yearSelect.addEventListener('change', function() {
        updateFormFields();
        updateTable();
        updateChart();
    });
    monthSelect.addEventListener('change', updateFormFields);

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const year = yearSelect.value;
        const month = monthSelect.value;
        const income = parseFloat(incomeInput.value);
        const expense = parseFloat(expenseInput.value);

        if (expense > income) {
            alertBox.innerHTML = '<div class="alert alert-danger">Expense cannot be greater than income!</div>';
            return;
        }
        financeData[year][month] = {income, expense};
        // Save to localStorage
        localStorage.setItem('financeData', JSON.stringify(financeData));
        alertBox.innerHTML = `<div class="alert alert-success">Data saved for ${month} ${year}.</div>`;
        updateTable();
        updateChart();
    });

    function updateTable() {
        const year = yearSelect.value;
        if (!financeData[year]) {
            financeData[year] = {};
            months.forEach(m => financeData[year][m] = {income: 0, expense: 0});
        }
        summaryTable.innerHTML = months.map(m => {
            const {income, expense} = financeData[year][m] || {income: 0, expense: 0};
            const balance = income - expense;
            return `<tr>
                <td>${m}</td>
                <td>${income}</td>
                <td>${expense}</td>
                <td>${balance}</td>
            </tr>`;
        }).join('');
    }

    function updateChart() {
        if (!document.getElementById('chart').classList.contains('active')) return;

        const year = yearSelect.value;
        const incomeData = months.map(m => financeData[year][m]?.income || 0);
        const expenseData = months.map(m => financeData[year][m]?.expense || 0);
        const balanceData = months.map((m, i) => incomeData[i] - expenseData[i]);

        // Calculate totals
        const totalIncome = incomeData.reduce((a, b) => a + b, 0);
        const totalExpense = expenseData.reduce((a, b) => a + b, 0);
        document.getElementById('totalIncome').textContent = totalIncome;
        document.getElementById('totalExpense').textContent = totalExpense;

        // Datasets with visibility controlled by checkboxes
        const datasets = [];
        if (document.getElementById('showIncome').checked) {
            datasets.push({
                label: 'Income',
                data: incomeData,
                backgroundColor: 'rgba(54, 162, 235, 0.6)'
            });
        }
        if (document.getElementById('showExpense').checked) {
            datasets.push({
                label: 'Expense',
                data: expenseData,
                backgroundColor: 'rgba(255, 99, 132, 0.6)'
            });
        }
        if (document.getElementById('showBalance').checked) {
            datasets.push({
                label: 'Balance',
                data: balanceData,
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            });
        }

        const ctx = document.getElementById('yearlyChart').getContext('2d');
        if (yearlyChart) yearlyChart.destroy();
        yearlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Add event listeners for checkboxes
    document.getElementById('showIncome').addEventListener('change', updateChart);
    document.getElementById('showExpense').addEventListener('change', updateChart);
    document.getElementById('showBalance').addEventListener('change', updateChart);

    // Update chart when Chart tab is shown
    document.getElementById('chart-tab').addEventListener('shown.bs.tab', updateChart);

    // Initialize table and form fields
    updateTable();
    updateFormFields();
});