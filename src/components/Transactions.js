import { useSelector } from "react-redux";

import sortImage from '../assets/sort.svg'

import { myOpenOrdersSelector } from "../store/selectors";

const Transactions = () => {
  const tokenSymbols = useSelector(store => store.tokens.symbols)

  const myOpenOrders = useSelector(myOpenOrdersSelector)

  return (
    <div className="component exchange__transactions">
      <div>
        <div className='component__header flex-between'>
          <h2>My Orders</h2>
        </div>

        {(myOpenOrders && myOpenOrders.length) ? (

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

              {myOpenOrders.map((order, index) => {
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
          <p className='flex-center'>No Orders</p>
        )}

      </div>


      {/* <div> */}
        {/* <div className='component__header flex-between'> */}
          {/* <h2>My Transactions</h2> */}

          {/* <div className='tabs'> */}
            {/* <button className='tab tab--active'>Orders</button> */}
            {/* <button className='tab'>Trades</button> */}
          {/* </div> */}
        {/* </div> */}

        {/* <table> */}
          {/* <thead> */}
            {/* <tr> */}
              {/* <th></th> */}
              {/* <th></th> */}
              {/* <th></th> */}
            {/* </tr> */}
          {/* </thead> */}
          {/* <tbody> */}

            {/* <tr> */}
              {/* <td></td> */}
              {/* <td></td> */}
              {/* <td></td> */}
            {/* </tr> */}

          {/* </tbody> */}
        {/* </table> */}

      {/* </div> */}
    </div>
  )
}

export default Transactions;
