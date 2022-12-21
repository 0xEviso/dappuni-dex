import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import dapp from '../assets/dapp.svg'

import { loadTokensBalance, depositTokens } from '../store/interactions'

const Balance = () => {
  const dispatch = useDispatch()

  const account = useSelector(store => store.provider.account)
  const exchange = useSelector(store => store.exchange.contract)
  const tokens = useSelector(store => store.tokens.contracts)
  const provider = useSelector(store => store.provider.connection)

  const tokenBalances = useSelector(store => store.tokens.balances)
  const exchangeBalances = useSelector(store => store.exchange.balances)
  const txIsPending = useSelector(store => store.exchange.transaction.isPending)

  let [token1DepositAmount, setToken1DepositAmount] = useState(0)

  const handleChange = (event) => {
    setToken1DepositAmount(event.target.value)
  }

  const submitHandlerFactory = (token) => {
    return (e) => {
      e.preventDefault()

      // Check that something has been entered in the input
      if (0 === token1DepositAmount)
        return ;
        // check that user wallet is connected
      if (!account)
        return ;

      depositTokens(provider, token1DepositAmount, exchange, token, dispatch)

      setToken1DepositAmount(0)
    }
  }

  useEffect(() => {
    if (account && exchange && tokens[0] && tokens[1]) {
      loadTokensBalance(account, exchange, tokens, dispatch)
    }
  }, [account, exchange, tokens, txIsPending])
  return (
    <div className='component exchange__transfers'>
      <div className='component__header flex-between'>
        <h2>Balance</h2>
        <div className='tabs'>
          <button className='tab tab--active'>Deposit</button>
          <button className='tab'>Withdraw</button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (DApp) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>
          <p><small>Token</small><br /><img src={dapp} alt="Token Logo" />DApp</p>
          <p><small>Wallet</small><br />
            {(tokenBalances && tokenBalances[0]) ? (
              parseInt(tokenBalances[0]).toFixed(2)
            ):''}
          </p>
          <p><small>Exchange</small><br />
            {(exchangeBalances && exchangeBalances[0]) ? (
              parseInt(exchangeBalances[0]).toFixed(2)
            ):''}
          </p>
        </div>

        <form onSubmit={submitHandlerFactory(tokens[0])}>
          <label htmlFor="token0"></label>
          <input
            type="text"
            id='token0'
            placeholder='0.0000'
            value={token1DepositAmount ? token1DepositAmount : ''}
            onChange={handleChange}
          />

          <button className='button' type='submit'>
            <span>Deposit</span>
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (mETH) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>

        </div>

        <form>
          <label htmlFor="token1"></label>
          <input type="text" id='token1' placeholder='0.0000'/>

          <button className='button' type='submit'>
            <span></span>
          </button>
        </form>
      </div>

      <hr />
    </div>
  );
}

export default Balance;
