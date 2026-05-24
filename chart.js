/*
  chart.js
  Handles Chart.js configuration and rendering for the Freedom Gap visualization.
*/

window.FreedomChart = (() => {
  let chartInstance = null;

  const buildDatasets = (income, expenses) => [
    {
      label: "Income",
      data: income,
      borderColor: "#16a34a",
      backgroundColor: "rgba(22, 163, 74, 0.12)",
      tension: 0.35,
      borderWidth: 3,
      pointRadius: 2,
      pointHoverRadius: 5,
      fill: {
        target: 1,
        above: "rgba(56, 189, 248, 0.22)",
        below: "rgba(239, 68, 68, 0.15)",
      },
    },
    {
      label: "Expenses",
      data: expenses,
      borderColor: "#ef4444",
      backgroundColor: "rgba(239, 68, 68, 0.12)",
      tension: 0.35,
      borderWidth: 3,
      pointRadius: 2,
      pointHoverRadius: 5,
      fill: false,
    },
  ];

  const buildConfig = ({ labels, income, expenses, freedomGap, savingsRates, currency }) => ({
    type: "line",
    data: { labels, datasets: buildDatasets(income, expenses) },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterBody: (items) => {
              const index = items[0]?.dataIndex ?? 0;
              return [
                `Freedom Gap: ${window.FreedomUI.formatCurrency(freedomGap[index], currency)}`,
                `Savings Rate: ${window.FreedomUI.formatPercent(savingsRates[index])}`,
              ];
            },
            label: (context) => {
              const value = context.parsed.y ?? 0;
              return `${context.dataset.label}: ${window.FreedomUI.formatCurrency(value, currency)}`;
            },
          },
        },
      },
      scales: {
        x: { title: { display: true, text: "Years" }, ticks: { maxRotation: 0 } },
        y: {
          title: { display: true, text: `Amount (${currency})` },
          ticks: { callback: (value) => window.FreedomUI.formatCurrency(value, currency) },
        },
      },
    },
  });

  const renderOrUpdateChart = (ctx, data) => {
    if (!chartInstance) {
      chartInstance = new Chart(ctx, buildConfig(data));
      return;
    }

    chartInstance.data.labels = data.labels;
    chartInstance.data.datasets = buildDatasets(data.income, data.expenses);
    chartInstance.options.scales.y.title.text = `Amount (${data.currency})`;
    chartInstance.options.scales.y.ticks.callback = (value) => window.FreedomUI.formatCurrency(value, data.currency);
    chartInstance.options.plugins.tooltip.callbacks.afterBody = (items) => {
      const index = items[0]?.dataIndex ?? 0;
      return [
        `Freedom Gap: ${window.FreedomUI.formatCurrency(data.freedomGap[index], data.currency)}`,
        `Savings Rate: ${window.FreedomUI.formatPercent(data.savingsRates[index])}`,
      ];
    };
    chartInstance.options.plugins.tooltip.callbacks.label = (context) => {
      const value = context.parsed.y ?? 0;
      return `${context.dataset.label}: ${window.FreedomUI.formatCurrency(value, data.currency)}`;
    };
    chartInstance.update();
  };

  const getChartInstance = () => chartInstance;

  return { renderOrUpdateChart, getChartInstance };
})();
