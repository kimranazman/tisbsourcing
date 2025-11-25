import { useMemo } from 'react'
import { useOrders } from '../hooks/useOrders'
import { useFilterStore } from '../store/filterStore'
import { filterOrders, calculateTopCustomers } from '../utils/analytics'
import { formatCurrency, formatNumber } from '../utils/formatters'
import Card from '../components/common/Card'
import StatCard from '../components/common/StatCard'
import FilterPanel from '../components/common/FilterPanel'
import LoadingSpinner from '../components/common/LoadingSpinner'
import DataTable from '../components/charts/DataTable'
import BarChartComponent from '../components/charts/BarChartComponent'
import { UserGroupIcon, TrophyIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

export default function Customers() {
  const { orders, metadata, loading, error } = useOrders()
  const filters = useFilterStore()

  const filteredOrders = useMemo(() => {
    if (!orders) return []
    return filterOrders(orders, filters)
  }, [orders, filters])

  // Calculate customer analytics
  const customerData = useMemo(() => {
    if (!filteredOrders.length) return { customers: [], stats: null }

    const customerMap = {}

    filteredOrders.forEach(order => {
      const customer = order.customerName
      if (!customer) return

      if (!customerMap[customer]) {
        customerMap[customer] = {
          name: customer,
          email: order.email,
          state: order.state,
          orders: new Set(),
          totalSpent: 0,
          items: new Set()
        }
      }

      customerMap[customer].orders.add(order.orderNo)
      customerMap[customer].totalSpent += order.orderTotal || 0
      if (order.itemName) customerMap[customer].items.add(order.itemName)
    })

    const customers = Object.values(customerMap).map(c => ({
      ...c,
      orderCount: c.orders.size,
      itemCount: c.items.size,
      avgOrderValue: c.orders.size > 0 ? c.totalSpent / c.orders.size : 0
    })).sort((a, b) => b.orderCount - a.orderCount)

    const totalCustomers = customers.length
    const topSpender = customers.reduce((max, c) => c.totalSpent > max.totalSpent ? c : max, { totalSpent: 0 })
    const avgOrdersPerCustomer = customers.length > 0
      ? customers.reduce((sum, c) => sum + c.orderCount, 0) / customers.length
      : 0

    return {
      customers,
      stats: {
        totalCustomers,
        topSpender,
        avgOrdersPerCustomer
      }
    }
  }, [filteredOrders])

  const topCustomersChart = useMemo(() => {
    return customerData.customers.slice(0, 10).map(c => ({
      name: c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name,
      fullName: c.name,
      count: c.orderCount
    }))
  }, [customerData.customers])

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Customer Name',
      cell: ({ getValue, row }) => (
        <div>
          <p className="font-medium text-slate-900 text-sm">
            {getValue()?.length > 35 ? getValue().substring(0, 35) + '...' : getValue()}
          </p>
          {row.original.email && (
            <p className="text-xs text-slate-500">{row.original.email}</p>
          )}
        </div>
      )
    },
    {
      accessorKey: 'state',
      header: 'State',
      cell: ({ getValue }) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {getValue() || 'Unknown'}
        </span>
      )
    },
    {
      accessorKey: 'orderCount',
      header: 'Orders',
      cell: ({ getValue }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {getValue()} orders
        </span>
      )
    },
    {
      accessorKey: 'totalSpent',
      header: 'Total Spent',
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
          title="Total Customers"
          value={formatNumber(customerData.stats?.totalCustomers || 0)}
          icon={UserGroupIcon}
          color="blue"
        />
        <StatCard
          title="Top Spender"
          value={formatCurrency(customerData.stats?.topSpender?.totalSpent || 0)}
          subtitle={customerData.stats?.topSpender?.name?.substring(0, 25) || '-'}
          icon={TrophyIcon}
          color="amber"
        />
        <StatCard
          title="Avg Orders/Customer"
          value={(customerData.stats?.avgOrdersPerCustomer || 0).toFixed(1)}
          icon={CurrencyDollarIcon}
          color="emerald"
        />
      </div>

      {/* Top Customers Chart */}
      <Card title="Top 10 Customers" subtitle="By number of orders">
        <BarChartComponent
          data={topCustomersChart}
          dataKey="count"
          nameKey="name"
          height={300}
          horizontal
        />
      </Card>

      {/* Customer Table */}
      <Card
        title="All Customers"
        subtitle={`${customerData.customers.length} customers found`}
      >
        <DataTable
          data={customerData.customers}
          columns={columns}
          pageSize={15}
        />
      </Card>
    </div>
  )
}
