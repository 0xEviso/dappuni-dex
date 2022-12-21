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
}
export const exchange = (state = EXCHANGE_DEFAULT_STATE, action) => {
  switch (action.type) {
    case 'EXCHANGE_LOADED':
      return {
        ...state,
        loaded: true,
        contract: action.exchange,
      }
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
    default:
      return state
  }
}
