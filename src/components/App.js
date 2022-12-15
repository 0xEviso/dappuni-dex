import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TOKEN_ABI from '../abis/Token.json';
import config from '../config.json';
import '../App.css';

function App() {

  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })
    console.log(`account0 address: ${accounts[0]}`)

    // Connect ethers to local blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const { chainId } = await provider.getNetwork();
    console.log(`chainId: ${chainId}`)

    // Token Smart Contract
    const token = new ethers.Contract(config[chainId].mDAI.address, TOKEN_ABI, provider)
    console.log(`token.address: ${token.address}`)

    const symbol = await token.symbol()
    console.log(`symbol: ${symbol}`)
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
  );
}

export default App;
