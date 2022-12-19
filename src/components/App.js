import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import config from '../config.json'

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange
} from '../store/interactions'

function App() {
  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    // Connect ethers to local blockchain
    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)

    // Load Account infos
    await loadAccount(provider, dispatch)

    // Token Smart Contract
    await loadTokens(
      provider,
      [ config[chainId].mDAI.address, config[chainId].mETH.address ],
      dispatch
    )
    // Exchange Smart Contract
    await loadExchange(provider, config[chainId].exchange.address, dispatch)
  }

  // https://reactjs.org/docs/hooks-effect.html
  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  )
}

export default App
