import { useMemo } from 'react'
import { useOrders } from '../hooks/useOrders'
import { useFilterStore } from '../store/filterStore'
import { filterOrders } from '../utils/analytics'
import { formatCurrency, formatDate } from '../utils/formatters'
import Card from '../components/common/Card'
import FilterPanel from '../components/common/FilterPanel'
import LoadingSpinner from '../components/common/LoadingSpinner'
import DataTable from '../components/charts/DataTable'

export default function Orders() {
  const { orders, metadata, loading, error } = useOrders()
  const filters = useFilterStore()

  const filteredOrders = useMemo(() => {
    if (!orders) return []
    return filterOrders(orders, filters)
  }, [orders, filters])

  const columns = useMemo(() => [
    {
      accessorKey: 'orderNo',
      header: 'Order No',
      cell: ({ getValue }) => (
        <span className="font-mono text-sm font-medium text-blue-600">
          #{getValue()}
        </span>
      )
    },
    {
      accessorKey: 'orderDate',
      header: 'Date',
      cell: ({ getValue }) => (
        <span className="text-sm text-slate-600">{formatDate(getValue())}</span>
      )
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ getValue }) => (
        <span className="text-sm font-medium text-slate-900">
          {getValue()?.length > 30 ? getValue().substring(0, 30) + '...' : getValue() || '-'}
        </span>
      )
    },
    {
      accessorKey: 'itemName',
      header: 'Item',
      cell: ({ getValue }) => {
        const value = getValue()
        if (!value) return '-'
        const cleanValue = value.split('\n')[0].replace(/^-/, '').trim()
        return (
          <span className="text-sm text-slate-600" title={value}>
            {cleanValue.length > 40 ? cleanValue.substring(0, 40) + '...' : cleanValue}
          </span>
        )
      }
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
      accessorKey: 'orderTotal',
      header: 'Total',
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

      <Card
        title="All Orders"
        subtitle={`${filteredOrders.length.toLocaleString()} records found`}
      >
        <DataTable
          data={filteredOrders}
          columns={columns}
          pageSize={15}
        />
      </Card>
    </div>
  )
}
