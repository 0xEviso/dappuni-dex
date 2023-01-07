import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import dapp from '../assets/dapp.svg'
import eth from '../assets/eth.svg'

import { loadTokensBalance, transferTokens } from '../store/interactions'

const Balance = () => {
  const dispatch = useDispatch()

  const account = useSelector(store => store.provider.account)
  const exchange = useSelector(store => store.exchange.contract)
  const tokens = useSelector(store => store.tokens.contracts)
  const provider = useSelector(store => store.provider.connection)

  const tokenSymbols = useSelector(store => store.tokens.symbols)
  const tokenBalances = useSelector(store => store.tokens.balances)
  const exchangeBalances = useSelector(store => store.exchange.balances)
  const txIsPending = useSelector(store => store.exchange.tx.InProgress)

  let [token1Amount, setToken1Amount] = useState(0)
  let [token2Amount, setToken2Amount] = useState(0)
  let [isDepositMode, setDepositMode] = useState(true)

  const submitHandler = (e, token) => {
    e.preventDefault()

    // check that user wallet is connected
    if (!account)
      return ;

    if (token.address === tokens[0].address) {
      // token 1 logic
      // if empty or 0 amount stop here
      if (0 === token1Amount)
        return
      if (true === isDepositMode) {
        // token 1 deposit
        transferTokens(provider, 'deposit', token1Amount, exchange, token, dispatch)
      } else {
        // token 1 withdrawal
        transferTokens(provider, 'withdrawal', token1Amount, exchange, token, dispatch)
      }
      setToken1Amount(0)
    } else {
      // token 2 logic
      // if empty or 0 amount stop here
      if (0 === token2Amount)
        return
      if (true === isDepositMode) {
        // token 2 deposit
        transferTokens(provider, 'deposit', token2Amount, exchange, token, dispatch)
      } else {
        // token 2 withdrawal
        transferTokens(provider, 'withdrawal', token2Amount, exchange, token, dispatch)
      }
      setToken2Amount(0)
    }
  }

  useEffect(() => {
    if (account && exchange && tokens[0] && tokens[1]) {
      loadTokensBalance(account, exchange, tokens, dispatch)
    }
  }, [account, exchange, tokens, dispatch, txIsPending])
  return (
    <div className='component exchange__transfers'>
      <div className='component__header flex-between'>
        <h2>Balance</h2>
        <div className='tabs'>
          <button
            className={isDepositMode? "tab tab--active" : "tab"}
            onClick={(e) => {setDepositMode(true)}}
          >
            Deposit
          </button>
          <button
            className={isDepositMode? "tab" : "tab tab--active"}
            onClick={(e) => {setDepositMode(false)}}
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (DApp) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>
          <p><small>Token</small><br /><img src={dapp} alt="Token Logo" />{tokenSymbols && tokenSymbols[0]}</p>
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

        <form onSubmit={(e) => submitHandler(e, tokens[0])}>
          <label htmlFor="token0"></label>
          <input
            type="number"
            id="token1"
            placeholder="0.00"
            value={token1Amount ? token1Amount : ''}
            onChange={(e) => setToken1Amount(e.target.value)}
          />

          <button className='button' type='submit'>
            {isDepositMode
              ? <span>Deposit</span>
              : <span>Withdraw</span>
            }
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (mETH) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>
          <p><small>Token</small><br /><img src={eth} alt="Token Logo" />{tokenSymbols && tokenSymbols[1]}</p>
          <p><small>Wallet</small><br />
            {(tokenBalances && tokenBalances[0]) ? (
              parseInt(tokenBalances[1]).toFixed(2)
            ):''}
          </p>
          <p><small>Exchange</small><br />
            {(exchangeBalances && exchangeBalances[1]) ? (
              parseInt(exchangeBalances[1]).toFixed(2)
            ):''}
          </p>
        </div>

        <form onSubmit={(e) => submitHandler(e, tokens[1])}>
          <label htmlFor="token1"></label>
          <input
            type="text"
            id="token1"
            placeholder="0.00"
            value={token2Amount ? token2Amount : ''}
            onChange={(e) => setToken2Amount(e.target.value)}
          />

          <button className='button' type='submit'>
            {isDepositMode
              ? <span>Deposit</span>
              : <span>Withdraw</span>
            }
          </button>
        </form>
      </div>

      <hr />
    </div>
  );
}

export default Balance;
