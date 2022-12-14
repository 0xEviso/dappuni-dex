// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat")

async function main() {
  console.log("Preparing deployment...")

  // Fetch contracts to deploy
  const Token = await hre.ethers.getContractFactory("Token")
  const Exchange = await hre.ethers.getContractFactory("Exchange")

  // Fetch accounts
  const accounts = await hre.ethers.getSigners()

  console.log(`Accounts fetched:
    ${accounts[0].address}
    ${accounts[1].address}`)

  const dapp = await Token.deploy('Dapp University', 'DAPP', '1000000')
  await dapp.deployed()
  console.log(`DAPP deployed at ${dapp.address}`)

  const mdai = await Token.deploy('Mock DAI', 'mDAI', '1000000')
  await mdai.deployed()
  console.log(`mDAI deployed at ${mdai.address}`)

  const meth = await Token.deploy('Mock Ethereum', 'mETH', '1000000')
  await meth.deployed()
  console.log(`mETH deployed at ${meth.address}`)

  const exchange = await Exchange.deploy(accounts[1].address, 10)
  await exchange.deployed()
  console.log(`Exchange deployed at ${exchange.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
