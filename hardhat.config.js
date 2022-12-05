require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// From https://hardhat.org/hardhat-runner/docs/advanced/create-task
// example usage: "npx hardhat balance --account 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs) => {
    const balance = await ethers.provider.getBalance(taskArgs.account);

    console.log(ethers.utils.formatEther(balance), "ETH");
  });

/** @type import('hardhat/config').HardhatUserConfig */
// Help: https://hardhat.org/hardhat-runner/docs/config
module.exports = {
  solidity: "0.8.17",
  networks: {
    localhost: {},
  },
};
