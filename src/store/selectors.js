import { createSelector } from "reselect"
import BigNumber from 'bignumber.js'
import _ from "lodash"
import { ethers } from "ethers"
import moment from "moment"

function filterPair(orders, token1, token2) {
  return orders.filter((order) => {
    // check if t1 is base and t2 is quote
    if (order.tokenGive === token1 && order.tokenGet === token2)
      return true
    // check if t2 is base and t1 is quote
    if (order.tokenGive === token2 && order.tokenGet === token1)
      return true
    return false
  })
}

function decorateOrders(orders, token1, token2) {
  let leftAmount, rightAmount, buySell

  return orders.map((order) => {
    if (order.tokenGet === token1) {
      leftAmount = ethers.utils.formatUnits(order.amountGet, 18)
      rightAmount = ethers.utils.formatUnits(order.amountGive, 18)
      buySell = 'buy'
    } else {
      leftAmount = ethers.utils.formatUnits(order.amountGive, 18)
      rightAmount = ethers.utils.formatUnits(order.amountGet, 18)
      buySell = 'sell'
    }

    return {
      ...order,
      leftAmount,
      rightAmount,
      buySell,
      price: new BigNumber(leftAmount).dividedBy(rightAmount).toFixed(4),
    }
  })
}

function sortAndGroupByBuySell(orders) {
  let sortedOrders = orders.sort((o1, o2) => {
    return o1.price > o2.price
  })
  return _.groupBy(sortedOrders, 'buySell')
}

function filterOpenOrders(openOrders, cancelledOrders, filledOrders) {
  // remove all elements that return true
  // it mutates the original array and return the removed elements
  _.remove(openOrders, (order) => {
    // if the current order id is found in cancelledOrders > remove
    if (_.findIndex(cancelledOrders, { 'id': order.id }) != -1)
      return true
    // if the current order id is found in cancelledOrders > remove
    if (_.findIndex(filledOrders, { 'id': order.id }) != -1)
      return true
    // current order hasnt been found, then is still open
    return false
  })

  return openOrders
}

export const orderBookSelector = createSelector(
  store => store.exchange.cancelled.orders,
  store => store.exchange.filled.orders,
  store => store.exchange.all.orders,
  store => store.tokens.contracts,
  (cancelledOrders, filledOrders, allOrders, tokens) => {
    // check that orders have loaded
    if (!(
      cancelledOrders.length &&
      filledOrders.length &&
      allOrders.length
    ))
      return
    // check that both tokens from the token pair have loaded
    if (!(tokens && tokens[1]))
      return

    let token1 = tokens[0].address
    let token2 = tokens[1].address

    // filter the orders to only orders that have
    // token1&2 as base/quote or quote/base
    let openOrders = filterPair(allOrders, token1, token2)

    // remove all cancelled and filled orders from the list
    openOrders = filterOpenOrders(openOrders, cancelledOrders, filledOrders)

    // add extra fields for easier comparisons and display
    openOrders = decorateOrders(openOrders, token1, token2)

    // sort orders by price and group them into 2 lists
    openOrders = sortAndGroupByBuySell(openOrders)

    return openOrders
})

export const priceChartSelector = createSelector(
  store => store.exchange.filled.orders,
  store => store.tokens.contracts,
  (filledOrders, tokens) => {
    // check that both tokens from the token pair have loaded
    if (!(tokens && tokens[1]))
      return

    let token1 = tokens[0].address
    let token2 = tokens[1].address

    // filter the orders to only orders that have
    // token1&2 as base/quote or quote/base
    let orders = filterPair(filledOrders, token1, token2)


    // Sort orders by date ascending to compare history
    orders = orders.sort((a, b) => a.timestamp - b.timestamp)

    // add extra fields for easier comparisons and display
    orders = decorateOrders(orders, token1, token2)

    // Get last 2 order for final price & price change
    let secondLastOrder, lastOrder
    let secondLastOrder2, lastOrder2
    [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)
    [secondLastOrder2, lastOrder2] = orders.slice(-2)

    // get last order price
    const lastPrice = _.get(lastOrder, 'price', 0)

    // get second last order price
    const secondLastPrice = _.get(secondLastOrder, 'price', 0)

    return ({
      lastPrice,
      lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
      series: [{
        data: buildGraphData(orders)
      }]
    })

  }
)

const buildGraphData = (orders) => {
  // Group the orders by hour for the graph
  orders = _.groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())

  // Get each hour where data exists
  const hours = Object.keys(orders)

  // Build the graph series
  const graphData = hours.map((hour) => {
    // Fetch all orders from current hour
    const group = orders[hour]

    // Calculate price values: open, high, low, close
    const open = group[0] // first order
    const high = _.maxBy(group, 'price') // high price
    const low = _.minBy(group, 'price') // low price
    const close = group[group.length - 1] // last order

    return({
      x: new Date(hour),
      y: [open.price, high.price, low.price, close.price]
    })
  })

  return graphData
}
