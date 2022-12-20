import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';

import dapp from '../assets/dapp.svg'

import { loadTokensBalance } from '../store/interactions'

const Balance = () => {
  const dispatch = useDispatch()

  const account = useSelector(store => store.provider.account)
  const exchange = useSelector(store => store.exchange.contract)
  const tokens = useSelector(store => store.tokens.contracts)

  const tokenBalances = useSelector(store => store.tokens.balances)
  const exchangeBalances = useSelector(store => store.exchange.balances)

  useEffect(() => {
    if (account && exchange && tokens[0] && tokens[1]) {
      loadTokensBalance(account, exchange, tokens, dispatch)
    }
  }, [account, exchange, tokens])
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
          <p><small>Wallet</small><br />{tokenBalances && tokenBalances[0]}</p>
          <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[0]}</p>
        </div>

        <form>
          <label htmlFor="token0"></label>
          <input type="text" id='token0' placeholder='0.0000' />

          <button className='button' type='submit'>
            <span></span>
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
