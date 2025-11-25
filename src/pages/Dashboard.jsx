import { useMemo } from 'react'
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline'
import { useOrders } from '../hooks/useOrders'
import { useFilterStore } from '../store/filterStore'
import {
  calculateTopItems,
  calculateTopCustomers,
  calculateOrdersByState,
  calculateMonthlyTrend,
  filterOrders
} from '../utils/analytics'
import { formatCurrency, formatNumber, formatCompactNumber } from '../utils/formatters'
import StatCard from '../components/common/StatCard'
import Card from '../components/common/Card'
import FilterPanel from '../components/common/FilterPanel'
import LoadingSpinner from '../components/common/LoadingSpinner'
import BarChartComponent from '../components/charts/BarChartComponent'
import LineChartComponent from '../components/charts/LineChartComponent'
import PieChartComponent from '../components/charts/PieChartComponent'

export default function Dashboard() {
  const { orders, metadata, loading, error } = useOrders()
  const filters = useFilterStore()

  // Filter orders based on current filters
  const filteredOrders = useMemo(() => {
    if (!orders) return []
    return filterOrders(orders, filters)
  }, [orders, filters])

  // Calculate analytics
  const stats = useMemo(() => {
    if (!filteredOrders.length) return null

    const uniqueOrders = new Set(filteredOrders.map(o => o.orderNo)).size
    const orderTotals = {}
    filteredOrders.forEach(o => {
      if (!orderTotals[o.orderNo]) {
        orderTotals[o.orderNo] = o.orderTotal || 0
      }
    })
    const totalRevenue = Object.values(orderTotals).reduce((a, b) => a + b, 0)
    const uniqueCustomers = new Set(filteredOrders.map(o => o.customerName).filter(Boolean)).size
    const avgOrderValue = uniqueOrders > 0 ? totalRevenue / uniqueOrders : 0

    return {
      totalOrders: uniqueOrders,
      totalRevenue,
      uniqueCustomers,
      avgOrderValue
    }
  }, [filteredOrders])

  const topItems = useMemo(() =>
    calculateTopItems(filteredOrders, 10),
    [filteredOrders]
  )

  const topCustomers = useMemo(() =>
    calculateTopCustomers(filteredOrders, 10),
    [filteredOrders]
  )

  const ordersByState = useMemo(() =>
    calculateOrdersByState(filteredOrders),
    [filteredOrders]
  )

  const monthlyTrend = useMemo(() =>
    calculateMonthlyTrend(filteredOrders),
    [filteredOrders]
  )

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
      {/* Filters */}
      <FilterPanel metadata={metadata} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={formatNumber(stats?.totalOrders || 0)}
          subtitle={`From ${metadata?.totalRecords || 0} records`}
          icon={ShoppingCartIcon}
          color="blue"
        />
        <StatCard
          title="Total Revenue"
          value={formatCompactNumber(stats?.totalRevenue || 0)}
          subtitle="Malaysian Ringgit (RM)"
          icon={CurrencyDollarIcon}
          color="pink"
        />
        <StatCard
          title="Unique Customers"
          value={formatNumber(stats?.uniqueCustomers || 0)}
          subtitle={`Across ${metadata?.states?.length || 0} states`}
          icon={UserGroupIcon}
          color="emerald"
        />
        <StatCard
          title="Avg Order Value"
          value={formatCurrency(stats?.avgOrderValue || 0)}
          subtitle="Per order"
          icon={CalculatorIcon}
          color="amber"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Top 10 Ordered Items" subtitle="By frequency">
          <BarChartComponent
            data={topItems}
            dataKey="count"
            nameKey="name"
            height={350}
            horizontal
          />
        </Card>

        <Card title="Orders by State" subtitle="Geographic distribution">
          <PieChartComponent
            data={ordersByState}
            dataKey="count"
            nameKey="state"
            height={350}
          />
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card title="Order Trends" subtitle="Monthly order volume over time">
        <LineChartComponent
          data={monthlyTrend}
          lines={[
            { key: 'orders', color: '#6366f1', name: 'Orders' }
          ]}
          height={300}
        />
      </Card>

      {/* Top Customers Table */}
      <Card title="Top Customers" subtitle="By order frequency">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((customer, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-slate-200 text-slate-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 text-sm">{customer.name}</p>
                    {customer.email && (
                      <p className="text-xs text-slate-500">{customer.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {customer.orderCount} orders
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {formatCurrency(customer.totalSpent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
