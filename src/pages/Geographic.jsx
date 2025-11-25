import { useMemo } from 'react'
import { useOrders } from '../hooks/useOrders'
import { useFilterStore } from '../store/filterStore'
import { filterOrders, calculateOrdersByState } from '../utils/analytics'
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters'
import Card from '../components/common/Card'
import StatCard from '../components/common/StatCard'
import FilterPanel from '../components/common/FilterPanel'
import LoadingSpinner from '../components/common/LoadingSpinner'
import DataTable from '../components/charts/DataTable'
import BarChartComponent from '../components/charts/BarChartComponent'
import PieChartComponent from '../components/charts/PieChartComponent'
import { MapIcon, BuildingOffice2Icon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

export default function Geographic() {
  const { orders, metadata, loading, error } = useOrders()
  const filters = useFilterStore()

  const filteredOrders = useMemo(() => {
    if (!orders) return []
    return filterOrders(orders, filters)
  }, [orders, filters])

  // Calculate geographic analytics
  const geoData = useMemo(() => {
    if (!filteredOrders.length) return { states: [], stats: null }

    const stateMap = {}
    const totalOrders = new Set()

    filteredOrders.forEach(order => {
      const state = order.state || 'Unknown'
      totalOrders.add(order.orderNo)

      if (!stateMap[state]) {
        stateMap[state] = {
          state,
          orders: new Set(),
          revenue: 0,
          customers: new Set()
        }
      }

      stateMap[state].orders.add(order.orderNo)
      stateMap[state].revenue += order.orderTotal || 0
      if (order.customerName) stateMap[state].customers.add(order.customerName)
    })

    const states = Object.values(stateMap).map(s => ({
      ...s,
      count: s.orders.size,
      customerCount: s.customers.size,
      avgOrderValue: s.orders.size > 0 ? s.revenue / s.orders.size : 0,
      percentage: totalOrders.size > 0 ? (s.orders.size / totalOrders.size) * 100 : 0
    })).sort((a, b) => b.count - a.count)

    const totalStates = states.filter(s => s.state !== 'Unknown').length
    const topState = states[0] || { state: '-', count: 0 }
    const totalRevenue = states.reduce((sum, s) => sum + s.revenue, 0)

    return {
      states,
      stats: {
        totalStates,
        topState,
        totalRevenue
      }
    }
  }, [filteredOrders])

  const ordersByState = useMemo(() =>
    calculateOrdersByState(filteredOrders),
    [filteredOrders]
  )

  const columns = useMemo(() => [
    {
      accessorKey: 'state',
      header: 'State',
      cell: ({ getValue }) => (
        <span className="font-medium text-slate-900">{getValue()}</span>
      )
    },
    {
      accessorKey: 'count',
      header: 'Orders',
      cell: ({ getValue }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {formatNumber(getValue())} orders
        </span>
      )
    },
    {
      accessorKey: 'percentage',
      header: '% of Total',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              style={{ width: `${Math.min(getValue(), 100)}%` }}
            />
          </div>
          <span className="text-sm text-slate-600">{getValue().toFixed(1)}%</span>
        </div>
      )
    },
    {
      accessorKey: 'customerCount',
      header: 'Customers',
      cell: ({ getValue }) => (
        <span className="text-sm text-slate-600">{formatNumber(getValue())}</span>
      )
    },
    {
      accessorKey: 'revenue',
      header: 'Revenue',
      cell: ({ getValue }) => (
        <span className="text-sm font-semibold text-slate-900">
          {formatCurrency(getValue())}
        </span>
      )
    },
    {
      accessorKey: 'avgOrderValue',
      header: 'Avg Order',
      cell: ({ getValue }) => (
        <span className="text-sm text-slate-600">
          {formatCurrency(getValue())}
        </span>
      )
    }
  ], [])

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 font-medium">Error loading data</p>
          <p className="text-slate-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <FilterPanel metadata={metadata} />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total States"
          value={formatNumber(geoData.stats?.totalStates || 0)}
          subtitle="Malaysian states covered"
          icon={MapIcon}
          color="blue"
        />
        <StatCard
          title="Top State"
          value={formatNumber(geoData.stats?.topState?.count || 0)}
          subtitle={geoData.stats?.topState?.state || '-'}
          icon={BuildingOffice2Icon}
          color="pink"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(geoData.stats?.totalRevenue || 0)}
          subtitle="Across all states"
          icon={CurrencyDollarIcon}
          color="emerald"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Orders by State" subtitle="Distribution of orders">
          <BarChartComponent
            data={ordersByState.slice(0, 10)}
            dataKey="count"
            nameKey="state"
            height={350}
            horizontal
          />
        </Card>

        <Card title="State Distribution" subtitle="Order percentage by state">
          <PieChartComponent
            data={geoData.states}
            dataKey="count"
            nameKey="state"
            height={350}
          />
        </Card>
      </div>

      {/* Revenue by State */}
      <Card title="Revenue by State" subtitle="Total revenue generated per state">
        <BarChartComponent
          data={geoData.states.slice(0, 10).map(s => ({
            ...s,
            name: s.state
          }))}
          dataKey="revenue"
          nameKey="name"
          height={300}
        />
      </Card>

      {/* State Table */}
      <Card
        title="State Details"
        subtitle={`${geoData.states.length} states/regions found`}
      >
        <DataTable
          data={geoData.states}
          columns={columns}
          pageSize={15}
        />
      </Card>
    </div>
  )
}
