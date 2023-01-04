import { useDispatch, useSelector } from "react-redux";
import { useState } from 'react';

import sortImage from '../assets/sort.svg'
import Banner from './Banner';

import { myOpenOrdersSelector, myTradesSelector } from "../store/selectors";
import { cancelOrder } from "../store/interactions";

const Transactions = () => {
  const dispatch = useDispatch ()

  const tokenSymbols = useSelector(store => store.tokens.symbols)
  const exchange = useSelector(store => store.exchange.contract)
  const provider = useSelector(store => store.provider.connection)

  const myOpenOrders = useSelector(myOpenOrdersSelector)
  const myTrades = useSelector(myTradesSelector)

  let [showOrders, setShowOrders] = useState(true)

  const cancelHandler = (order) => {
    cancelOrder(order, exchange, provider, dispatch)
  }

  return (
    <div className="component exchange__transactions">
      <div className='component__header flex-between'>
        <h2>{ showOrders ? 'My Orders' : 'My Trades' }</h2>

        <div className='tabs'>
          <button
            className={showOrders? "tab tab--active" : "tab"}
            onClick={(e) => {setShowOrders(true)}}
          >
            Orders
          </button>
          <button
            className={showOrders? "tab" : "tab tab--active"}
            onClick={(e) => {setShowOrders(false)}}
          >
            Trades
          </button>
        </div>
      </div>

      {showOrders ? (
        (myOpenOrders && myOpenOrders.length) ? (

          <table>
            <thead>
              <tr>
                <th>
                  {tokenSymbols && tokenSymbols[0]}
                  <img src={sortImage} alt="Sort" />
                </th>
                <th>
                  {tokenSymbols && tokenSymbols[0]}
                  /
                  {tokenSymbols && tokenSymbols[1]}
                  <img src={sortImage} alt="Sort" />
                </th>
                <th>
                </th>
              </tr>
            </thead>
            <tbody>

              {myOpenOrders.map((order, index) => {
                return (
                  <tr key={index}>
                    <td style={{color: order.buySell === 'buy' ? '#F45353' : '#25CE8F'}}>
                      {order.leftAmount}
                    </td>
                    <td>{order.price}</td>
                    <td>
                      <button
                        className="button--sm"
                        onClick={e => cancelHandler(order)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                )
              })}

            </tbody>
          </table>

        ) : (
          <Banner text='No Open Orders'/>
        )
      ) : (
        (myTrades && myTrades.length) ? (

          <table>
            <thead>
              <tr>
                <th>
                  {tokenSymbols && tokenSymbols[0]}
                  <img src={sortImage} alt="Sort" />
                </th>
                <th>
                  {tokenSymbols && tokenSymbols[0]}
                  /
                  {tokenSymbols && tokenSymbols[1]}
                  <img src={sortImage} alt="Sort" />
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>

              {myTrades.map((order, index) => {
                return (
                  <tr key={index}>
                    <td style={{color: order.buySell === 'buy' ? '#F45353' : '#25CE8F'}}>
                      {order.leftAmount}
                    </td>
                    <td>{order.price}</td>
                    <td></td>
                  </tr>
                )
              })}

            </tbody>
          </table>

        ) : (
          <Banner text='No Trades'/>
        )
      )}

    </div>
  )
}

export default Transactions;
