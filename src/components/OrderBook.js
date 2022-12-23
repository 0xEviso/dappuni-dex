import { useSelector } from "react-redux";

import sortImage from '../assets/sort.svg'

import { orderBookSelector } from "../store/selectors";

const OrderBook = () => {
  const tokenSymbols = useSelector(store => store.tokens.symbols)

  const openOrders = useSelector(orderBookSelector)

  return (
    <div className="component exchange__orderbook">
      <div className='component__header flex-between'>
        <h2>Order Book</h2>
      </div>

      <div className="flex">

        {(openOrders && openOrders.sell && openOrders.sell.length) ? (

          <table className='exchange__orderbook--sell'>
            <caption>Selling</caption>
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
                      {tokenSymbols && tokenSymbols[1]}
                      <img src={sortImage} alt="Sort" />
                    </th>
                  </tr>
              </thead>
              <tbody>

                {openOrders.sell.map((order, index) => {
                  return (
                    <tr key={index}>
                      <td>{order.leftAmount}</td>
                      <td style={{color:'#F45353'}}>{order.price}</td>
                      <td>{order.rightAmount}</td>
                    </tr>
                  )
                })}

              </tbody>
          </table>

        ) : (
          <p className='flex-center'>No Sell Orders</p>
        )}

        <div className='divider'></div>

        {(openOrders && openOrders.buy && openOrders.buy.length) ? (

          <table className='exchange__orderbook--buy'>
            <caption>Buying</caption>
            <thead>
              <tr>
              <th>
                {tokenSymbols && tokenSymbols[1]}
                <img src={sortImage} alt="Sort" />
              </th>
                <th>
                  {tokenSymbols && tokenSymbols[1]}
                  /
                  {tokenSymbols && tokenSymbols[0]}
                  <img src={sortImage} alt="Sort" />
                </th>
                <th>
                  {tokenSymbols && tokenSymbols[0]}
                  <img src={sortImage} alt="Sort" />
                </th>
              </tr>
            </thead>
            <tbody>

              {openOrders.buy.map((order, index) => {
                return (
                  <tr key={index}>
                    <td>{order.leftAmount}</td>
                    <td style={{color:'#25CE8F'}}>{order.price}</td>
                    <td>{order.rightAmount}</td>
                  </tr>
                )
              })}

          </tbody>
        </table>

        ) : (
          <p className='flex-center'>No Buy Orders</p>
        )}

      </div>
    </div>
  );
}

export default OrderBook;
