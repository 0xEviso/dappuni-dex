import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import config from '../config.json'

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadToken
} from '../store/interactions'

function App() {
  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    // Connect ethers to local blockchain
    await loadAccount(dispatch)
    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)

    // Token Smart Contract
    await loadToken(provider, config[chainId].mDAI.address, dispatch)
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
