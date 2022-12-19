import { ethers } from "ethers"
import TOKEN_ABI from "../abis/Token.json"
import EXCHANGE_ABI from "../abis/Exchange.json"
import { provider } from "./reducers"

export const loadProvider = (dispatch) => {
  // Connect ethers to local blockchain
  const connection = new ethers.providers.Web3Provider(window.ethereum)
  dispatch({ type: 'PROVIDER_LOADED', connection })

  return connection
}

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork()
  dispatch({ type: 'NETWORK_LOADED', chainId })

  return chainId
}

export const loadAccount = async (provider, dispatch) => {
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  })
  const account = ethers.utils.getAddress(accounts[0])
  dispatch({ type: 'ACCOUNT_LOADED', account })

  let balance = await provider.getBalance(account)
  balance = ethers.utils.formatEther(balance)
  dispatch({ type: 'ETHER_BALANCE_LOADED', balance })

  return { account, balance }
}

// Token Smart Contract
export const loadTokens = async (provider, addresses, dispatch) => {
  const token1 = new ethers.Contract(addresses[0], TOKEN_ABI, provider)
  const symbol1 = await token1.symbol()
  dispatch({ type: 'TOKEN_1_LOADED', token1, symbol1 })

  const token2 = new ethers.Contract(addresses[1], TOKEN_ABI, provider)
  const symbol2 = await token2.symbol()
  dispatch({ type: 'TOKEN_2_LOADED', token2, symbol2 })

  return { token1, token2 }
}

// Exchange Smart Contract
export const loadExchange = async (provider, address, dispatch) => {
  const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider)
  dispatch({ type: 'EXCHANGE_LOADED', exchange })

  return exchange
}
