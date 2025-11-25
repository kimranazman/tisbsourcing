# Dropee Analytics Dashboard

A modern, colorful analytics dashboard for analyzing Dropee order data. Built with React, Vite, and Tailwind CSS.

## Features

- **Dashboard Overview**: KPI cards, top items chart, geographic distribution, order trends
- **Orders Page**: Full order table with sorting and pagination
- **Customers Page**: Customer analytics and ranking
- **Items Page**: Item and brand analysis
- **Geographic Page**: State-by-state breakdown

### Key Capabilities

- Global search across orders, items, and customers
- Multi-filter support: State, Brand, Date Range
- Interactive charts (bar, line, pie)
- Responsive design for mobile and desktop
- Modern gradient UI with animations

## Tech Stack

- **React 19** + **Vite 7**
- **Tailwind CSS 4** (via Vite plugin)
- **Recharts** for data visualization
- **TanStack Table** for data tables
- **Zustand** for state management
- **Headless UI** for accessible components

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Data

The dashboard uses pre-converted JSON data from an Excel file:

- `public/data/orders.json` - Order records
- `public/data/metadata.json` - Aggregated metadata

### Updating Data

To update the data from a new Excel file:

```bash
cd python
python convert_excel.py
```

## Deployment

This project is configured for Vercel deployment:

1. Push to GitHub
2. Import project in Vercel
3. Deploy (auto-detected as Vite project)

## Project Structure

```
src/
├── components/
│   ├── layout/      # Layout components (Sidebar, Header)
│   ├── common/      # Reusable components (Card, StatCard, FilterPanel)
│   └── charts/      # Chart components (Bar, Line, Pie, DataTable)
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── store/           # Zustand store
└── utils/           # Utility functions
```

## License

Private - Internal use only
