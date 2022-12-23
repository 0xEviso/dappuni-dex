import _ from "lodash"

export const provider = (state = {}, action) => {
  switch (action.type) {
    case 'PROVIDER_LOADED':
      return {
        ...state,
        connection: action.connection
      }
    case 'NETWORK_LOADED':
      return {
        ...state,
        chainId: action.chainId
      }
    case 'ACCOUNT_LOADED':
      return {
        ...state,
        account: action.account
      }
    case 'ETHER_BALANCE_LOADED':
      return {
        ...state,
        balance: action.balance
      }
    default:
      return state
  }
}

const TOKENS_DEFAULT_STATE = {
  loaded: false,
  contracts: [],
  symbols: [],
  balances: [],
}
export const tokens = (state = TOKENS_DEFAULT_STATE, action) => {
  switch (action.type) {
    case 'TOKEN_1_LOADED':
      return {
        ...state,
        loaded: true,
        contracts: [action.token1],
        symbols: [action.symbol1],
      }
    case 'TOKEN_1_BALANCE_LOADED':
      return {
        ...state,
        balances: [action.balance],
      }
    case 'TOKEN_2_LOADED':
      return {
        ...state,
        loaded: true,
        contracts: [...state.contracts, action.token2],
        symbols: [...state.symbols, action.symbol2],
      }
    case 'TOKEN_2_BALANCE_LOADED':
      return {
        ...state,
        balances: [...state.balances, action.balance],
      }
    default:
      return state
  }
}

const EXCHANGE_DEFAULT_STATE = {
  loaded: false,
  contract: null,
  balances: [],
  transferInProgress: false,
  all: {
    loaded: false,
    orderInProgress: false,
    orders: [],
  },
  filled: {
    loaded: false,
    orders: [],
  },
  cancelled: {
    loaded: false,
    orders: [],
  },
}
export const exchange = (state = EXCHANGE_DEFAULT_STATE, action) => {
  switch (action.type) {
    // EXCHANGE LOADING
    case 'EXCHANGE_LOADED':
      return {
        ...state,
        loaded: true,
        contract: action.exchange,
      }

    // TOKEN PAIR LOADING
    case 'EXCHANGE_TOKEN_1_BALANCE_LOADED':
      return {
        ...state,
        balances: [action.balance],
      }
    case 'EXCHANGE_TOKEN_2_BALANCE_LOADED':
      return {
        ...state,
        balances: [...state.balances, action.balance],
      }

    // DEPOSIT / WITHDRAWAL
    case 'TRANSACTION_PENDING':
      return {
        ...state,
        balances: [...state.balances, action.balance],
        transferInProgress: true,
      }
    case 'TRANSACTION_FAIL':
      return {
        ...state,
        balances: [...state.balances, action.balance],
        transferInProgress: false,
      }
    case 'TRANSACTION_SUCCESS':
      return {
        ...state,
        balances: [...state.balances, action.balance],
        transferInProgress: false,
      }

    // ALL ORDERS LOADING
    case 'CANCELLED_ORDERS_LOADED':
      return {
        ...state,
        cancelled: {
          ...state.cancelled,
          orders: action.orders,
          loaded: true,
        }
      }
    case 'FILLED_ORDERS_LOADED':
      return {
        ...state,
        filled: {
          ...state.filled,
          orders: action.orders,
          loaded: true,
        }
      }
    case 'ALL_ORDERS_LOADED':
      return {
        ...state,
        all: {
          ...state.all,
          orders: action.orders,
          loaded: true,
        }
      }

    // NEW ORDER CREATION
    case 'NEW_ORDER_PENDING':
      return {
        ...state,
        all: {
          ...state.all,
          orderInProgress: true,
        },
      }
    case 'NEW_ORDER_FAIL':
      return {
        ...state,
        all: {
          ...state.all,
          orderInProgress: false,
        },
      }
    case 'NEW_ORDER_SUCCESS':
      // DEDUP checking if the new order is already in the orders array
      // sometimes the event is fired multiple times
      let orders
      if (-1 === _.findIndex(orders, { 'id': action.order.id })) {
        // recreating a new array here is important so that reduc knows
        // that the data changed. Using .push() for example would not work
        orders = [...state.all.orders, action.order]
      } else {
        orders = state.all.orders
      }

      return {
        ...state,
        all: {
          ...state.all,
          orderInProgress: false,
          orders,
        },
      }
    default:
      return state
  }
}
