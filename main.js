/*
  main.js
  Coordinates calculations, UI updates, chart rendering, exports, and persistence.
*/

document.addEventListener("DOMContentLoaded", () => {
  const {
    elements,
    init,
    getFormValues,
    updateSummary,
    saveValues,
    applyScenario,
    markCustomScenario,
    updateHelperText,
    reset,
    copyShareLink,
    setStatus,
  } = window.FreedomUI;

  init();

  const canvas = document.getElementById("freedomChart");
  if (!canvas || !elements.form) return;

  const ctx = canvas.getContext("2d");
  let latestSeries = null;

  const annualize = (value, period) => (period === "monthly" ? value * 12 : value);
  const displayValue = (annualValue, period) => (period === "monthly" ? annualValue / 12 : annualValue);

  const calculateSeries = ({ startingIncome, startingExpense, incomeGrowthRate, expenseGrowthRate, years, period }) => {
    const income = [];
    const expenses = [];
    const freedomGap = [];
    const savingsRates = [];
    const labels = [];
    const incomeRate = incomeGrowthRate / 100;
    const expenseRate = expenseGrowthRate / 100;
    const startingAnnualIncome = annualize(startingIncome, period);
    const startingAnnualExpense = annualize(startingExpense, period);
    let cumulativeFreedom = 0;

    for (let year = 1; year <= years; year += 1) {
      const annualIncome = startingAnnualIncome * Math.pow(1 + incomeRate, year - 1);
      const annualExpense = startingAnnualExpense * Math.pow(1 + expenseRate, year - 1);
      const annualGap = annualIncome - annualExpense;
      const savingsRate = annualIncome > 0 ? (annualGap / annualIncome) * 100 : 0;

      cumulativeFreedom += annualGap;
      labels.push(`Year ${year}`);
      income.push(Number(displayValue(annualIncome, period).toFixed(2)));
      expenses.push(Number(displayValue(annualExpense, period).toFixed(2)));
      freedomGap.push(Number(displayValue(annualGap, period).toFixed(2)));
      savingsRates.push(Number(savingsRate.toFixed(2)));
    }

    return { labels, income, expenses, freedomGap, savingsRates, cumulativeFreedom };
  };

  const render = () => {
    const values = getFormValues();
    if (!values) return;

    updateHelperText();
    const series = calculateSeries(values);
    latestSeries = { values, ...series };

    const currentGap = values.startingIncome - values.startingExpense;
    const savingsRate = values.startingIncome > 0 ? (currentGap / values.startingIncome) * 100 : 0;

    updateSummary({ values, currentGap, savingsRate, cumulativeFreedom: series.cumulativeFreedom });

    window.FreedomChart.renderOrUpdateChart(ctx, {
      labels: series.labels,
      income: series.income,
      expenses: series.expenses,
      freedomGap: series.freedomGap,
      savingsRates: series.savingsRates,
      currency: values.currency,
    });

    saveValues(values);
  };

  const downloadFile = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    if (!latestSeries) return;
    const { labels, income, expenses, freedomGap, savingsRates, values, cumulativeFreedom } = latestSeries;
    const rows = [
      ["Year", `Income (${values.period})`, `Expenses (${values.period})`, `Freedom Gap (${values.period})`, "Savings Rate %"],
      ...labels.map((label, index) => [label, income[index], expenses[index], freedomGap[index], savingsRates[index]]),
      [],
      ["Cumulative Freedom", cumulativeFreedom],
      ["Currency", values.currency],
      ["Input Period", values.period],
    ];

    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    downloadFile("freedom-gap-projection.csv", csv, "text/csv;charset=utf-8");
    setStatus("CSV exported.");
  };

  const exportPng = () => {
    const chart = window.FreedomChart.getChartInstance();
    if (!chart) return;
    const link = document.createElement("a");
    link.href = chart.toBase64Image("image/png", 1);
    link.download = "freedom-gap-chart.png";
    link.click();
    setStatus("PNG exported.");
  };

  elements.form.addEventListener("input", (event) => {
    const fieldName = event.target.name;
    if (fieldName === "incomeGrowthRate" || fieldName === "expenseGrowthRate") markCustomScenario();
    render();
  });

  elements.form.addEventListener("change", (event) => {
    if (event.target.name === "scenario") applyScenario();
    render();
  });

  elements.resetButton.addEventListener("click", () => { reset(); render(); });
  elements.copyLinkButton.addEventListener("click", () => {
    const values = getFormValues();
    if (values) copyShareLink(values);
  });
  elements.exportCsvButton.addEventListener("click", exportCsv);
  elements.exportPngButton.addEventListener("click", exportPng);

  render();
});
