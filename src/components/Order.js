import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';

import { makeOrder } from '../store/interactions'

const Order = () => {
  const dispatch = useDispatch()

  const account = useSelector(store => store.provider.account)
  const exchange = useSelector(store => store.exchange.contract)
  const tokens = useSelector(store => store.tokens.contracts)
  const provider = useSelector(store => store.provider.connection)
  const tokenSymbols = useSelector(store => store.tokens.symbols)

  let [baseAmount, setBaseAmount] = useState(0)
  let [tokenPrice, setTokenPrice] = useState(0)
  let [quoteAmount, setQuoteAmount] = useState(0)
  let [isBuyMode, setIsBuyMode] = useState(true)

  useEffect(() => {
    if (!(baseAmount > 0 && tokenPrice > 0)) {
      setQuoteAmount(0)
      return
    }
    // Setting the quote amount estimate to the token amount * price
    // we use a library because of javascript broken decimal maths
    setQuoteAmount(
      new BigNumber(baseAmount).multipliedBy(tokenPrice).toString()
    )
  }, [baseAmount, tokenPrice])

  const submitHandler = (e) => {
    e.preventDefault()

    // check that user wallet is connected
    if (!account)
      return
    // check that token amount and price have been entered
    if (!(baseAmount > 0 && tokenPrice > 0))
      return

    makeOrder(
      { baseAmount, quoteAmount },
      exchange,
      tokens,
      provider,
      dispatch
    )
  }

  return (
    <div className="component exchange__orders">
      <div className='component__header flex-between'>
        <h2>New Order</h2>
        <div className='tabs'>
          <button
            className={isBuyMode? "tab tab--active" : "tab"}
            onClick={(e) => {setIsBuyMode(true)}}
          >
            Buy
          </button>
          <button
            className={isBuyMode? "tab" : "tab tab--active"}
            onClick={(e) => {setIsBuyMode(false)}}
          >
            Sell
          </button>
        </div>
      </div>

      <form onSubmit={submitHandler}>
        <label htmlFor="amount">{tokenSymbols && tokenSymbols[0]} Amount</label>
        <input
          type="text"
          id="amount"
          placeholder="0.00"
          value={baseAmount ? baseAmount : ''}
          onChange={(e) => setBaseAmount(e.target.value)}
        />
        <label htmlFor="amount">Price</label>
        <input
          type="text"
          id="price"
          placeholder="0.00"
          value={tokenPrice ? tokenPrice : ''}
          onChange={(e) => setTokenPrice(e.target.value)}
        />
        <label htmlFor="amount">{tokenSymbols && tokenSymbols[1]} Amount (est.)</label>
        <input
          type="text"
          id="quoteAmount"
          placeholder="0.00"
          value={quoteAmount ? quoteAmount : ''}
          disabled
        />

        <button className='button button--filled' type='submit'>
          {isBuyMode
            ? <span>Buy</span>
            : <span>Sell</span>
          }
        </button>
      </form>
    </div>
  );
}

export default Order;
