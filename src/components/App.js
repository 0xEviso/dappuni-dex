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

import Navbar from './Navbar'
import Markets from './Markets'
import Balance from './Balance'

function App() {
  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    // Connect ethers to local blockchain
    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)

    // Reload page when network is changed
    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

     // This checks if the browser has a web3 account that was previously
    // connected without triggering the wallet login popup
    // if the wallet was previously connected, we can silently load the account
    const accounts = await window.ethereum.request({
      method: 'eth_accounts'
    })
    if (accounts && accounts.length)
      await loadAccount(provider, dispatch)

    // Reload Account infos on change
    window.ethereum.on('accountsChanged', (accounts) => {
      loadAccount(provider, dispatch)
    })

    // check that we have config settings for selected chain id
    if (config[chainId] && config[chainId].exchange) {
      // Token Smart Contract
      await loadTokens(
        provider,
        [ config[chainId].DApp.address, config[chainId].mETH.address ],
        dispatch
      )
      // Exchange Smart Contract
      await loadExchange(provider, config[chainId].exchange.address, dispatch)
    }
  }

  // https://reactjs.org/docs/hooks-effect.html
  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets />

          <Balance />

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
