// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat")
const config = require('../src/config.json')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {
  // Fetch accounts
  const accounts = await hre.ethers.getSigners()
  const deployer = accounts[0]
  const feeAccount = accounts[1]
  const user1 = accounts[2]
  const user2 = accounts[3]

  // Fetch network
  const { chainId } = await ethers.provider.getNetwork()
  console.log("Using chainId:", chainId)

  // Fetch deployed tokens
  const DApp = await hre.ethers
    .getContractAt('Token', config[chainId].DApp.address)
  console.log(`DAPP token fetched: ${DApp.address}`)

  const mDAI = await hre.ethers
    .getContractAt('Token', config[chainId].mDAI.address)
  console.log(`mDAI token fetched: ${mDAI.address}`)

  const mETH = await hre.ethers
    .getContractAt('Token', config[chainId].mETH.address)
  console.log(`mETH token fetched: ${mETH.address}`)

  // Fetch the deployed exchange
  const exchange = await hre.ethers
    .getContractAt('Exchange', config[chainId].exchange.address)
  console.log(`exchange fetched: ${exchange.address}`)

  //
  // Seed user accounts
  //

  let transaction, result
  let amount = tokens(10000)

  // Give DAPP tokens to user1
  transaction = await DApp.connect(deployer)
    .transfer(user1.address, amount)
  result = await transaction.wait()
  console.log(`Transferred ${amount} DAPP tokens to ${user1.address}`)

  // Approve DAPP tokens for user 1
  transaction = await DApp.connect(user1)
    .approve(exchange.address, amount)
  result = await transaction.wait()
  console.log(`Approved ${amount} DAPP tokens from ${user1.address}`)

  // Deposit DAPP tokens for user 1
  transaction = await exchange.connect(user1)
    .depositToken(DApp.address, amount)
  result = await transaction.wait()
  console.log(`Deposited ${amount} DAPP tokens from ${user1.address}`)

  // Give mDai tokens to user2
  transaction = await mDAI.connect(deployer)
    .transfer(user2.address, amount)
  result = await transaction.wait()
  console.log(`Transferred ${amount} mDAI tokens to ${user2.address}`)

  // Approve mDai tokens for user 2
  transaction = await mDAI.connect(user2)
    .approve(exchange.address, amount)
  result = await transaction.wait()
  console.log(`Approved ${amount} mDAI tokens from ${user2.address}`)

  // Deposit mDai tokens for user 2
  transaction = await exchange.connect(user2)
    .depositToken(mDAI.address, amount)
  result = await transaction.wait()
  console.log(`Deposited ${amount} mDAI tokens from ${user2.address}`)

  // Give mETH tokens to user2
  transaction = await mETH.connect(deployer)
    .transfer(user2.address, amount)
  result = await transaction.wait()
  console.log(`Transferred ${amount} mETH tokens to ${user2.address}`)

  // Approve mETH tokens for user 2
  transaction = await mETH.connect(user2)
    .approve(exchange.address, amount)
  result = await transaction.wait()
  console.log(`Approved ${amount} mETH tokens from ${user2.address}`)

  // Deposit mETH tokens for user 2
  transaction = await exchange.connect(user2)
    .depositToken(mETH.address, amount)
  result = await transaction.wait()
  console.log(`Deposited ${amount} mETH tokens from ${user2.address}`)


  //
  // Seed a cancelled order
  //

  let orderId

  // Make order from user 1
  transaction = await exchange.connect(user1)
    .makeOrder(mDAI.address, tokens(10), DApp.address, tokens(1))
  result = await transaction.wait()
  console.log(`1. Made order from ${user1.address}`)

  // User 1 cancels order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).cancelOrder(orderId)
  result = await transaction.wait()
  console.log(`Cancelled order from ${user1.address}\n`)

  // Wait 1 second
  await wait(1)

  //
  // Seed filled orders
  //

  // User 1 makes order
  transaction = await exchange.connect(user1)
    .makeOrder(mDAI.address, tokens(10), DApp.address, tokens(1))
  result = await transaction.wait()
  console.log(`2. Made order from ${user1.address}`)

  // User 2 fills order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // Wait 1 second
  await wait(1)

  // User 1 makes another order
  transaction = await exchange.connect(user1)
    .makeOrder(mETH.address, tokens(50), DApp.address, tokens(15))
  result = await transaction.wait()
  console.log(`3. Made order from ${user1.address}`)

  // User 2 fills another order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // Wait 1 second
  await wait(1)

  // User 1 makes final order
  transaction = await exchange.connect(user1)
    .makeOrder(mETH.address, tokens(200), DApp.address, tokens(20))
  result = await transaction.wait()
  console.log(`4. Made order from ${user1.address}`)

  // User 2 fills final order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // Wait 1 second
  await wait(1)

  //
  // Seed Open orders
  //

  // User 1 makes 10 orders
  for(let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user1)
      .makeOrder(mETH.address, tokens(10 * i), DApp.address, tokens(10))
    result = await transaction.wait()

    console.log(`5. Made order from ${user1.address}`)

    // Wait 1 second
    await wait(1)
  }

  // User 2 makes 10 orders
  for (let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user2)
      .makeOrder(DApp.address, tokens(10), mETH.address, tokens(10 * i))
    result = await transaction.wait()

    console.log(`6. Made order from ${user2.address}`)

    // Wait 1 second
    await wait(1)
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
