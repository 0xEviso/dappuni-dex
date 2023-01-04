import { ethers } from "ethers"
import TOKEN_ABI from "../abis/Token.json"
import EXCHANGE_ABI from "../abis/Exchange.json"

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

// Load all past orders
export const loadAllOrders = async (provider, exchange, dispatch) => {
  let result
  const lastBlock = await provider.getBlockNumber()

  // Fetch canceled orders
  result = await exchange.queryFilter('Cancel', 0, lastBlock)
  const cancelledOrders = result.map(e => e.args)
  dispatch({ type: 'CANCELLED_ORDERS_LOADED', orders: cancelledOrders })

  // Fetch filled orders
  result = await exchange.queryFilter('Trade', 0, lastBlock)
  const filledOrders = result.map(e => e.args)
  dispatch({ type: 'FILLED_ORDERS_LOADED', orders: filledOrders })

  // Fetch all orders
  result = await exchange.queryFilter('Order', 0, lastBlock)
  const allOrders = result.map(e => e.args)
  dispatch({ type: 'ALL_ORDERS_LOADED', orders: allOrders })
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

export const loadTokensBalance = async (account, exchange, tokens, dispatch) => {
  // token1 balance in user wallet
  let balance = await tokens[0].balanceOf(account)
  balance = ethers.utils.formatUnits(balance, 18)
  dispatch({ type: 'TOKEN_1_BALANCE_LOADED', balance })

  // token1 balance in exchange belonging to user
  balance = await exchange.balanceOf(tokens[0].address, account)
  balance = ethers.utils.formatUnits(balance, 18)
  dispatch({ type: 'EXCHANGE_TOKEN_1_BALANCE_LOADED', balance })

  // token2 balance in user wallet
  balance = await tokens[1].balanceOf(account)
  balance = ethers.utils.formatUnits(balance, 18)
  dispatch({ type: 'TOKEN_2_BALANCE_LOADED', balance })

  // token2 balance in exchange belonging to user
  balance = await exchange.balanceOf(tokens[1].address, account)
  balance = ethers.utils.formatUnits(balance, 18)
  dispatch({ type: 'EXCHANGE_TOKEN_2_BALANCE_LOADED', balance })
}

export const subscribeToEvents = async (exchange, dispatch) => {
  const transferEventsHandler = async (
    tokenAddress,
    userAddress,
    amount,
    balance,
    event
  ) => {
    dispatch({ type: 'TRANSACTION_SUCCESS', event })
  }
  exchange.on('Deposit', transferEventsHandler);
  exchange.on('Withdrawal', transferEventsHandler);

  exchange.on('Order', (
    id,
    user,
    tokenGet,
    amountGet,
    tokenGive,
    amountGive,
    timestamp,
    event
  ) => {
    const order = event.args
    dispatch({ type: 'NEW_ORDER_SUCCESS', order, event })
  });

  exchange.on('Cancel', (
    id,
    user,
    tokenGet,
    amountGet,
    tokenGive,
    amountGive,
    timestamp,
    event
  ) => {
    const order = event.args
    dispatch({ type: 'CANCEL_ORDER_SUCCESS', order, event })
  });
}

export const transferTokens = async (provider, transferType, amount, exchange, token, dispatch) => {
  dispatch({ type: 'TRANSACTION_PENDING' })

  try {
    const signer = await provider.getSigner()

    let transferAmount = ethers.utils.parseUnits(amount, 18)
    let transaction

    // DEPOSIT
    if ('deposit' === transferType) {
      // Approve tokens
      transaction = await token.connect(signer)
        .approve(exchange.address, transferAmount)
      await transaction.wait()

      // Deposit tokens
      transaction = await exchange.connect(signer)
        .depositToken(token.address, transferAmount)
      await transaction.wait()
    } else {
      // WITHDRAWAL
      // withdraw from exchange contract
      transaction = await exchange.connect(signer)
        .withdrawToken(token.address, transferAmount)
      await transaction.wait()
    }
  } catch (error) {
    dispatch({ type: 'TRANSACTION_FAIL', error })
  }
}

export const makeOrder = async (order, exchange, tokens, provider, dispatch) => {
  dispatch({ type: 'NEW_ORDER_PENDING' })

  try {
    let tokenGet, amountGet, tokenGive, amountGive

    const signer = await provider.getSigner()

    if (order.isBuyMode === true) {
      tokenGet = tokens[0].address
      amountGet = ethers.utils.parseUnits(order.baseAmount, 18)
      tokenGive = tokens[1].address
      amountGive = ethers.utils.parseUnits(order.quoteAmount, 18)
    } else {
      tokenGet = tokens[1].address
      amountGet = ethers.utils.parseUnits(order.quoteAmount, 18)
      tokenGive = tokens[0].address
      amountGive = ethers.utils.parseUnits(order.baseAmount, 18)
    }

    // Create new order
    let transaction = await exchange.connect(signer)
      .makeOrder(tokenGet, amountGet, tokenGive, amountGive)
    await transaction.wait()
  } catch (error) {
    dispatch({ type: 'NEW_ORDER_FAIL', error })
  }
}

export const cancelOrder = async (order, exchange, provider, dispatch) => {
  dispatch({ type: 'CANCEL_ORDER_PENDING' })

  try {
    const signer = await provider.getSigner()
    // Cancel order
    let transaction = await exchange.connect(signer)
      .cancelOrder(order.id)
    await transaction.wait()
  } catch (error) {
    dispatch({ type: 'CANCEL_ORDER_FAIL', error })
  }
}
