export function calculateTopItems(orders, limit = 10) {
  const itemCounts = {}
  const itemRevenue = {}

  orders.forEach(order => {
    const item = order.itemName
    if (!item) return

    // Clean item name (take first item if multiple)
    const cleanItem = item.split('\n')[0].replace(/^-/, '').trim()
    if (!cleanItem) return

    itemCounts[cleanItem] = (itemCounts[cleanItem] || 0) + 1
    itemRevenue[cleanItem] = (itemRevenue[cleanItem] || 0) + (order.orderTotal || 0)
  })

  return Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({
      name: name.length > 40 ? name.substring(0, 40) + '...' : name,
      fullName: name,
      count,
      revenue: itemRevenue[name] || 0
    }))
}

export function calculateTopBrands(orders, limit = 10) {
  const brandCounts = {}
  const brandRevenue = {}

  orders.forEach(order => {
    const brand = order.itemBrand
    if (!brand || brand === '-' || brand.includes('\n')) return

    const cleanBrand = brand.trim()
    if (!cleanBrand) return

    brandCounts[cleanBrand] = (brandCounts[cleanBrand] || 0) + 1
    brandRevenue[cleanBrand] = (brandRevenue[cleanBrand] || 0) + (order.orderTotal || 0)
  })

  return Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({
      name,
      count,
      revenue: brandRevenue[name] || 0
    }))
}

export function calculateTopCustomers(orders, limit = 10) {
  const customerOrders = {}
  const customerRevenue = {}
  const customerEmails = {}

  orders.forEach(order => {
    const customer = order.customerName
    if (!customer) return

    if (!customerOrders[customer]) {
      customerOrders[customer] = new Set()
      customerRevenue[customer] = 0
      customerEmails[customer] = order.email
    }

    customerOrders[customer].add(order.orderNo)
    customerRevenue[customer] += order.orderTotal || 0
  })

  return Object.entries(customerOrders)
    .map(([name, orderSet]) => ({
      name: name.length > 35 ? name.substring(0, 35) + '...' : name,
      fullName: name,
      orderCount: orderSet.size,
      totalSpent: customerRevenue[name],
      email: customerEmails[name]
    }))
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, limit)
}

export function calculateOrdersByState(orders) {
  const stateCounts = {}
  const stateRevenue = {}

  orders.forEach(order => {
    const state = order.state || 'Unknown'
    stateCounts[state] = (stateCounts[state] || 0) + 1
    stateRevenue[state] = (stateRevenue[state] || 0) + (order.orderTotal || 0)
  })

  return Object.entries(stateCounts)
    .map(([state, count]) => ({
      state,
      count,
      revenue: stateRevenue[state] || 0
    }))
    .sort((a, b) => b.count - a.count)
}

export function calculateMonthlyTrend(orders) {
  const monthly = {}

  orders.forEach(order => {
    if (!order.orderYear || !order.orderMonth) return

    const key = `${order.orderYear}-${String(order.orderMonth).padStart(2, '0')}`

    if (!monthly[key]) {
      monthly[key] = { orderCount: 0, revenue: 0, uniqueOrders: new Set() }
    }

    monthly[key].uniqueOrders.add(order.orderNo)
    monthly[key].revenue += order.orderTotal || 0
  })

  return Object.entries(monthly)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, data]) => ({
      month,
      label: formatMonthLabel(month),
      orders: data.uniqueOrders.size,
      revenue: data.revenue
    }))
}

function formatMonthLabel(monthStr) {
  const [year, month] = monthStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(month) - 1]} ${year.slice(2)}`
}

export function calculateOverviewStats(orders, metadata) {
  const uniqueOrders = new Set(orders.map(o => o.orderNo)).size
  const totalRevenue = orders.reduce((sum, o) => sum + (o.orderTotal || 0), 0) / (orders.length / uniqueOrders)
  const uniqueCustomers = new Set(orders.map(o => o.customerName).filter(Boolean)).size
  const avgOrderValue = uniqueOrders > 0 ? totalRevenue / uniqueOrders : 0

  return {
    totalOrders: uniqueOrders,
    totalRevenue: totalRevenue,
    uniqueCustomers,
    avgOrderValue
  }
}

export function filterOrders(orders, filters) {
  return orders.filter(order => {
    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
      const orderBrand = (order.itemBrand || '').trim()
      if (!filters.brands.some(b => orderBrand.includes(b))) {
        return false
      }
    }

    // State filter
    if (filters.states && filters.states.length > 0) {
      if (!filters.states.includes(order.state)) {
        return false
      }
    }

    // Date range filter
    if (filters.dateRange) {
      if (filters.dateRange.start && order.orderDate < filters.dateRange.start) {
        return false
      }
      if (filters.dateRange.end && order.orderDate > filters.dateRange.end) {
        return false
      }
    }

    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase()
      const searchableFields = [
        order.itemName,
        order.customerName,
        order.orderNo,
        order.itemBrand,
        order.state
      ].filter(Boolean).join(' ').toLowerCase()

      if (!searchableFields.includes(searchLower)) {
        return false
      }
    }

    return true
  })
}
