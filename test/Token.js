const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n, 'ether');
};

describe('Token', () => {
    let token, accounts, deployer, receiver;

    before(async () => {
        // Fetch token from blockchain
        const Token = await ethers.getContractFactory('Token');
        token = await Token.deploy('Dapp University', 'DAPP', '1000000');

        accounts = await ethers.getSigners();
        deployer = accounts[0];
        receiver = accounts[1];
    });

    describe('Deployment', () => {
        const name = 'Dapp University';
        const symbol = 'DAPP';
        const totalSupply = '1000000';

        it('has correct name', async () => {
            expect(await token.name()).to.equal(name);
        });

        it('has correct symbol', async () => {
            expect(await token.symbol()).to.equal(symbol);
        });

        it('has correct decimals', async () => {
            expect(await token.decimals()).to.equal(18);
        });

        it('has correct total supply', async () => {
            expect(await token.totalSupply()).to.equal(tokens(totalSupply));
        });

        it('assigns total supply to deployer', async () => {
            expect(await token.balanceOf(deployer.address)).to.equal(tokens(totalSupply));
        });
    });

    describe('Sending Tokens', () => {
        let balanceOfDeployer, balanceOfReceiver;
        let amount, transaction, result;

        describe('Success', () => {
            before(async () => {
                balanceOfDeployer = await token.balanceOf(deployer.address);
                balanceOfReceiver = await token.balanceOf(receiver.address);

                amount = tokens('2');
                transaction = await token.connect(deployer).transfer(receiver.address, amount);
                result = await transaction.wait();
            });

            it('transfers token balances', async () => {
                expect(await token.balanceOf(deployer.address)).to.equal(balanceOfDeployer.sub(amount));
                expect(await token.balanceOf(receiver.address)).to.equal(balanceOfReceiver.add(amount));
            });

            it('emits a transfer event', async () => {
                const event = result.events[0];
                expect(event.event).to.equal('Transfer');

                const args = event.args;
                expect(args._from).to.equal(deployer.address);
                expect(args._to).to.equal(receiver.address);
                expect(args._value).to.equal(amount);
            });
        });

        describe('Failure', () => {
            it('rejects insufficient balance', async () => {
                const invalidAmount = tokens('100000000'); // 100M

                await expect(
                    token.connect(deployer)
                    .transfer(receiver.address, invalidAmount)
                ).to.be.reverted;
            });

            it('rejects invalid recipient', async () => {
                const amount = tokens('2');
                const invalidAddress = '0x0000000000000000000000000000000000000000';

                await expect(
                    token.connect(deployer)
                    .transfer(invalidAddress, amount)
                ).to.be.reverted;
            });
        });
    });
});
