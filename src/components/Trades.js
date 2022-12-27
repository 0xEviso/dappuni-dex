import { useSelector } from "react-redux";

import sortImage from '../assets/sort.svg'

import { filledOrdersSelector } from "../store/selectors";

const Trades = () => {
  const tokenSymbols = useSelector(store => store.tokens.symbols)

  const filledOrders = useSelector(filledOrdersSelector)

  return (
    <div className="component exchange__trades">
      <div className='component__header flex-between'>
        <h2>Trades</h2>
      </div>

      {(filledOrders && filledOrders.length) ? (

        <table>
          <thead>
            <tr>
              <th>
                Time
                <img src={sortImage} alt="Sort" />
              </th>
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
            </tr>
          </thead>
          <tbody>

            {filledOrders.map((order, index) => {
              return (
                <tr key={index}>
                  <td>{order.formattedTimestamp}</td>
                  <td style={{color: order.buySell === 'buy' ? '#F45353' : '#25CE8F'}}>
                    {order.leftAmount}
                  </td>
                  <td>{order.price}</td>
                </tr>
              )
            })}

          </tbody>
        </table>

      ) : (
        <p className='flex-center'>No Trades</p>
      )}

    </div>
  );
}

export default Trades;
