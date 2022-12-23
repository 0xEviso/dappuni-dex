import { createSelector } from "reselect"
import BigNumber from 'bignumber.js'
import _ from "lodash"
import { ethers } from "ethers"

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

    // todo:
    // remove filled orders
    // remove canceled orders
    // bug on display between tokens (same amount twice)



    return openOrders
})
