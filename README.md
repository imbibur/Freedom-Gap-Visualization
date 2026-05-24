# Freedom Gap Visualization

The **Freedom Gap** is the distance between your income and expenses over time. In this visualization, the shaded **Freedom Zone** shows how much surplus you can direct toward savings, investing, debt repayment, or building more optionality.

## Live site

https://imbibur.github.io/Freedom-Gap-Visualization/

## How to run the project

This is a **100% static site**. No build steps are required.

1. Download or clone this repository.
2. Open `index.html` directly in your browser.

That’s it.

## GitHub Pages compatibility

This project is intentionally simple so it can run on GitHub Pages:

- No backend
- No database
- No Node.js requirement
- No build step
- No framework dependency
- Relative file paths only
- Browser-only JavaScript

## Features

- IDR and USD currency switch
- Monthly and annual input modes
- Income, expense, freedom gap, savings rate, and cumulative freedom summary cards
- Conservative, realistic, aggressive, and custom scenario presets
- Automatic local save using `localStorage`
- Shareable URL query parameters
- CSV export
- PNG chart export
- Responsive layout for desktop and mobile
- Pinned Chart.js CDN version for better stability

## Core formulas

```text
Freedom Gap = Income - Expenses
Savings Rate = Freedom Gap / Income × 100
Cumulative Freedom = total annualized surplus across the projection period
```

## Why this visualization matters

The Freedom Gap chart helps illustrate how two habits shape long-term outcomes:

- **Growing income** through skills, promotions, business, or additional income streams.
- **Managing expenses** so they grow more slowly than income.

By keeping expenses under control while income rises, the shaded Freedom Zone expands year after year, representing surplus that can be invested toward financial resilience and independence.
