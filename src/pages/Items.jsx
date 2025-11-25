import { useMemo } from 'react'
import { useOrders } from '../hooks/useOrders'
import { useFilterStore } from '../store/filterStore'
import { filterOrders, calculateTopItems, calculateTopBrands } from '../utils/analytics'
import { formatCurrency, formatNumber } from '../utils/formatters'
import Card from '../components/common/Card'
import StatCard from '../components/common/StatCard'
import FilterPanel from '../components/common/FilterPanel'
import LoadingSpinner from '../components/common/LoadingSpinner'
import DataTable from '../components/charts/DataTable'
import BarChartComponent from '../components/charts/BarChartComponent'
import PieChartComponent from '../components/charts/PieChartComponent'
import { CubeIcon, TagIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function Items() {
  const { orders, metadata, loading, error } = useOrders()
  const filters = useFilterStore()

  const filteredOrders = useMemo(() => {
    if (!orders) return []
    return filterOrders(orders, filters)
  }, [orders, filters])

  // Calculate item analytics
  const itemData = useMemo(() => {
    if (!filteredOrders.length) return { items: [], stats: null }

    const itemMap = {}

    filteredOrders.forEach(order => {
      const item = order.itemName
      if (!item) return

      const cleanItem = item.split('\n')[0].replace(/^-/, '').trim()
      if (!cleanItem) return

      if (!itemMap[cleanItem]) {
        itemMap[cleanItem] = {
          name: cleanItem,
          brand: order.itemBrand,
          orderCount: 0,
          totalRevenue: 0,
          customers: new Set()
        }
      }

      itemMap[cleanItem].orderCount += 1
      itemMap[cleanItem].totalRevenue += order.orderTotal || 0
      if (order.customerName) itemMap[cleanItem].customers.add(order.customerName)
    })

    const items = Object.values(itemMap).map(item => ({
      ...item,
      customerCount: item.customers.size,
      avgRevenue: item.orderCount > 0 ? item.totalRevenue / item.orderCount : 0
    })).sort((a, b) => b.orderCount - a.orderCount)

    const totalItems = items.length
    const topItem = items[0] || { name: '-', orderCount: 0 }
    const totalItemRevenue = items.reduce((sum, item) => sum + item.totalRevenue, 0)

    return {
      items,
      stats: {
        totalItems,
        topItem,
        totalItemRevenue
      }
    }
  }, [filteredOrders])

  const topItems = useMemo(() => calculateTopItems(filteredOrders, 10), [filteredOrders])
  const topBrands = useMemo(() => calculateTopBrands(filteredOrders, 10), [filteredOrders])

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Item Name',
      cell: ({ getValue }) => (
        <span className="font-medium text-slate-900 text-sm" title={getValue()}>
          {getValue()?.length > 50 ? getValue().substring(0, 50) + '...' : getValue()}
        </span>
      )
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
      cell: ({ getValue }) => {
        const brand = getValue()
        if (!brand || brand === '-') return '-'
        const cleanBrand = brand.split('\n')[0].replace(/^-/, '').trim()
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {cleanBrand.length > 20 ? cleanBrand.substring(0, 20) + '...' : cleanBrand}
          </span>
        )
      }
    },
    {
      accessorKey: 'orderCount',
      header: 'Orders',
      cell: ({ getValue }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {formatNumber(getValue())}
        </span>
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
      accessorKey: 'totalRevenue',
      header: 'Total Revenue',
      cell: ({ getValue }) => (
        <span className="text-sm font-semibold text-slate-900">
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
          title="Unique Items"
          value={formatNumber(itemData.stats?.totalItems || 0)}
          icon={CubeIcon}
          color="blue"
        />
        <StatCard
          title="Top Item Orders"
          value={formatNumber(itemData.stats?.topItem?.orderCount || 0)}
          subtitle={itemData.stats?.topItem?.name?.substring(0, 30) || '-'}
          icon={SparklesIcon}
          color="pink"
        />
        <StatCard
          title="Total Brands"
          value={formatNumber(metadata?.brands?.length || 0)}
          icon={TagIcon}
          color="emerald"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Top 10 Items" subtitle="By order frequency">
          <BarChartComponent
            data={topItems}
            dataKey="count"
            nameKey="name"
            height={350}
            horizontal
          />
        </Card>

        <Card title="Top 10 Brands" subtitle="By order count">
          <PieChartComponent
            data={topBrands}
            dataKey="count"
            nameKey="name"
            height={350}
          />
        </Card>
      </div>

      {/* Items Table */}
      <Card
        title="All Items"
        subtitle={`${itemData.items.length} items found`}
      >
        <DataTable
          data={itemData.items}
          columns={columns}
          pageSize={15}
        />
      </Card>
    </div>
  )
}
