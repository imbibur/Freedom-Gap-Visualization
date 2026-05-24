/*
  ui.js
  Manages inputs, validation, persistence, URL sharing, and UI text updates.
*/

window.FreedomUI = (() => {
  const STORAGE_KEY = "freedom-gap-inputs-v2";

  const DEFAULT_VALUES = {
    currency: "IDR",
    period: "monthly",
    startingIncome: 10000000,
    startingExpense: 6000000,
    incomeGrowthRate: 8,
    expenseGrowthRate: 4,
    years: 10,
    scenario: "custom",
  };

  const SCENARIOS = {
    conservative: { incomeGrowthRate: 3, expenseGrowthRate: 3 },
    realistic: { incomeGrowthRate: 7, expenseGrowthRate: 4 },
    aggressive: { incomeGrowthRate: 12, expenseGrowthRate: 5 },
  };

  const elements = {
    form: null,
    error: null,
    actionStatus: null,
    summaryIncome: null,
    summaryExpenses: null,
    summaryGap: null,
    summarySavingsRate: null,
    summaryCumulative: null,
    incomeHelp: null,
    expenseHelp: null,
    chartSubtitle: null,
    resetButton: null,
    copyLinkButton: null,
    exportCsvButton: null,
    exportPngButton: null,
  };

  const init = () => {
    elements.form = document.getElementById("controls");
    elements.error = document.getElementById("formError");
    elements.actionStatus = document.getElementById("actionStatus");
    elements.summaryIncome = document.getElementById("summaryIncome");
    elements.summaryExpenses = document.getElementById("summaryExpenses");
    elements.summaryGap = document.getElementById("summaryGap");
    elements.summarySavingsRate = document.getElementById("summarySavingsRate");
    elements.summaryCumulative = document.getElementById("summaryCumulative");
    elements.incomeHelp = document.getElementById("incomeHelp");
    elements.expenseHelp = document.getElementById("expenseHelp");
    elements.chartSubtitle = document.getElementById("chartSubtitle");
    elements.resetButton = document.getElementById("resetButton");
    elements.copyLinkButton = document.getElementById("copyLinkButton");
    elements.exportCsvButton = document.getElementById("exportCsvButton");
    elements.exportPngButton = document.getElementById("exportPngButton");
    applyInitialValues();
    updateHelperText();
    return elements;
  };

  const getFormatter = (currency) => {
    const locale = currency === "IDR" ? "id-ID" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "IDR" ? 0 : 2,
    });
  };

  const parseNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const normalizeValues = (rawValues) => ({
    currency: rawValues.currency === "USD" ? "USD" : "IDR",
    period: rawValues.period === "annual" ? "annual" : "monthly",
    startingIncome: parseNumber(rawValues.startingIncome),
    startingExpense: parseNumber(rawValues.startingExpense),
    incomeGrowthRate: parseNumber(rawValues.incomeGrowthRate),
    expenseGrowthRate: parseNumber(rawValues.expenseGrowthRate),
    years: parseNumber(rawValues.years),
    scenario: rawValues.scenario || "custom",
  });

  const validateInputs = (values) => {
    if (!values) return "Please enter valid values.";
    const { startingIncome, startingExpense, incomeGrowthRate, expenseGrowthRate, years } = values;
    if ([startingIncome, startingExpense, incomeGrowthRate, expenseGrowthRate, years].some((item) => item === null)) return "Please enter valid numeric values.";
    if (startingIncome < 0 || startingExpense < 0) return "Starting values must be zero or higher.";
    if (incomeGrowthRate <= -100 || expenseGrowthRate <= -100) return "Growth rates must be greater than -100%.";
    if (!Number.isInteger(years) || years < 1 || years > 60) return "Number of years must be between 1 and 60.";
    return "";
  };

  const setFormValues = (values) => {
    if (!elements.form) return;
    Object.entries({ ...DEFAULT_VALUES, ...values }).forEach(([key, value]) => {
      const input = elements.form.elements[key];
      if (input) input.value = value;
    });
    updateHelperText();
  };

  const getQueryValues = () => {
    const params = new URLSearchParams(window.location.search);
    if (!params.size) return null;
    return {
      currency: params.get("currency"),
      period: params.get("period"),
      startingIncome: params.get("income"),
      startingExpense: params.get("expense"),
      incomeGrowthRate: params.get("incomeGrowth"),
      expenseGrowthRate: params.get("expenseGrowth"),
      years: params.get("years"),
      scenario: params.get("scenario"),
    };
  };

  const getStoredValues = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  };

  const applyInitialValues = () => {
    const queryValues = getQueryValues();
    const storedValues = getStoredValues();
    setFormValues(normalizeValues({ ...DEFAULT_VALUES, ...(storedValues || {}), ...(queryValues || {}) }));
  };

  const getFormValues = (showError = true) => {
    if (!elements.form) return null;
    const formData = new FormData(elements.form);
    const values = normalizeValues(Object.fromEntries(formData.entries()));
    const errorMessage = validateInputs(values);
    if (showError && elements.error) elements.error.textContent = errorMessage;
    return errorMessage ? null : values;
  };

  const formatCurrency = (value, currency = getFormValues(false)?.currency || DEFAULT_VALUES.currency) => getFormatter(currency).format(value || 0);
  const formatPercent = (value) => (Number.isFinite(value) ? `${value.toFixed(1)}%` : "0%");

  const updateHelperText = () => {
    const period = elements.form?.elements.period?.value || DEFAULT_VALUES.period;
    const label = period === "monthly" ? "monthly" : "annual";
    if (elements.incomeHelp) elements.incomeHelp.textContent = `Current ${label} income.`;
    if (elements.expenseHelp) elements.expenseHelp.textContent = `Current ${label} expenses.`;
    if (elements.chartSubtitle) elements.chartSubtitle.textContent = `Projected ${label} values by year.`;
  };

  const updateSummary = ({ values, currentGap, savingsRate, cumulativeFreedom }) => {
    const periodLabel = values.period === "monthly" ? "/mo" : "/yr";
    elements.summaryIncome.textContent = `${formatCurrency(values.startingIncome, values.currency)} ${periodLabel}`;
    elements.summaryExpenses.textContent = `${formatCurrency(values.startingExpense, values.currency)} ${periodLabel}`;
    elements.summaryGap.textContent = `${formatCurrency(currentGap, values.currency)} ${periodLabel}`;
    elements.summarySavingsRate.textContent = formatPercent(savingsRate);
    elements.summaryCumulative.textContent = `${formatCurrency(cumulativeFreedom, values.currency)} over ${values.years} years`;
  };

  const saveValues = (values) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(values)); } catch (error) {}
  };

  const applyScenario = () => {
    const scenario = elements.form?.elements.scenario?.value;
    if (!scenario || scenario === "custom" || !SCENARIOS[scenario]) return;
    elements.form.elements.incomeGrowthRate.value = SCENARIOS[scenario].incomeGrowthRate;
    elements.form.elements.expenseGrowthRate.value = SCENARIOS[scenario].expenseGrowthRate;
  };

  const markCustomScenario = () => {
    if (elements.form?.elements.scenario) elements.form.elements.scenario.value = "custom";
  };

  const setStatus = (message) => {
    if (!elements.actionStatus) return;
    elements.actionStatus.textContent = message;
    window.clearTimeout(setStatus.timeoutId);
    if (message) setStatus.timeoutId = window.setTimeout(() => { elements.actionStatus.textContent = ""; }, 3000);
  };

  const reset = () => {
    setFormValues(DEFAULT_VALUES);
    saveValues(DEFAULT_VALUES);
    setStatus("Reset to default values.");
  };

  const buildShareUrl = (values) => {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("currency", values.currency);
    url.searchParams.set("period", values.period);
    url.searchParams.set("income", values.startingIncome);
    url.searchParams.set("expense", values.startingExpense);
    url.searchParams.set("incomeGrowth", values.incomeGrowthRate);
    url.searchParams.set("expenseGrowth", values.expenseGrowthRate);
    url.searchParams.set("years", values.years);
    url.searchParams.set("scenario", values.scenario);
    return url.toString();
  };

  const copyShareLink = async (values) => {
    const shareUrl = buildShareUrl(values);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus("Share link copied.");
    } catch (error) {
      window.prompt("Copy this share link:", shareUrl);
    }
  };

  return { DEFAULT_VALUES, elements, init, getFormValues, formatCurrency, formatPercent, updateSummary, saveValues, applyScenario, markCustomScenario, updateHelperText, reset, copyShareLink, setStatus };
})();
