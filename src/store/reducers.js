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
  symbols: []
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
    case 'TOKEN_2_LOADED':
      return {
        ...state,
        loaded: true,
        contracts: [...state.contracts, action.token2],
        symbols: [...state.symbols, action.symbol2],
      }
    default:
      return state
  }
}

export const exchange = (state = { loaded: false, contract: null }, action) => {
  switch (action.type) {
    case 'EXCHANGE_LOADED':
      return {
        ...state,
        loaded: true,
        contract: action.exchange,
      }
      default:
        return state
  }
}
