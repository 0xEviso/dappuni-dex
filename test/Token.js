const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Token', () => {

    it('has correct name', async () => {
        // Fetch token from blockchain
        const Token = await ethers.getContractFactory('Token');
        let token = await Token.deploy();
        // Read token name
        const name = await token.name();
        // Check that name is correct
        expect(name).to.equal('Dapp University');
    });

    it('has correct symbol', async () => {
        // Fetch token from blockchain
        const Token = await ethers.getContractFactory('Token');
        let token = await Token.deploy();
        // Read token symbol
        const symbol = await token.symbol();
        // Check that symbol is correct
        expect(symbol).to.equal('DAPP');
    });
});
