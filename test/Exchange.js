const { expect } = require('chai')
const { ethers } = require('hardhat')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Exchange', () => {
  let token1, token2, exchange, deployer, feeAccount, user1, user2, user3
  const feePercent = 10

  beforeEach(async () => {
    const Exchange = await ethers.getContractFactory('Exchange')
    const Token = await ethers.getContractFactory('Token')

    token1 = await Token.deploy('Dapp University', 'DAPP', '1000000')
    token2 = await Token.deploy('Mock Dai', 'mDAI', '1000000')

    accounts = await ethers.getSigners()
    deployer = accounts[0]
    feeAccount = accounts[1]
    user1 = accounts[2]
    user2 = accounts[3]
    user3 = accounts[4]

    // Give 1000 DAPP tokens to user1
    let transaction = await token1.connect(deployer)
      .transfer(user1.address, tokens(1000))
    let result = await transaction.wait()

    exchange = await Exchange.deploy(feeAccount.address, feePercent)
  })

  describe('Deployment', () => {

    it('tracks the fee account', async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address)
    })

    it('tracks the fee percent', async () => {
      expect(await exchange.feePercent()).to.equal(feePercent)
    })
  })

  describe('Depositing Tokens', () => {
    let transaction, result
    let amount = tokens(10)

    describe('Success', () => {
      beforeEach(async() => {
        transaction = await token1.connect(user1).approve(exchange.address, amount)
        result = await transaction.wait()
        transaction = await exchange.connect(user1).depositToken(token1.address, amount)
        result = await transaction.wait()
      })

      it('tracks the token deposit', async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(amount)
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
        expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
      })

      it('emits a Deposit event', async () => {
        const event = result.events[1] // 2 events are emitted
        expect(event.event).to.equal('Deposit')

        const args = event.args
        expect(args.token).to.equal(token1.address)
        expect(args.user).to.equal(user1.address)
        expect(args.amount).to.equal(amount)
        expect(args.balance).to.equal(amount)
      })
    })

    describe('Failure', () => {
      it('fails when no tokens are approved', async () => {
        await expect(
          exchange.connect(user1)
          .depositToken(token1.address, amount)
        ).to.be.reverted
      })
    })
  })

  describe('Withdrawing Tokens', () => {
    let transaction, result
    let amount = tokens(10)

    describe('Success', () => {
      beforeEach(async() => {
        transaction = await token1.connect(user1).approve(exchange.address, amount)
        result = await transaction.wait()
        transaction = await exchange.connect(user1).depositToken(token1.address, amount)
        result = await transaction.wait()
        transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
        result = await transaction.wait()
      })

      it('withdraws token funds', async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(0)
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(0)
        expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)
      })

      it('emits a Withdrawal event', async () => {
        const event = result.events[1] // 2 events are emitted
        expect(event.event).to.equal('Withdrawal')

        const args = event.args
        expect(args.token).to.equal(token1.address)
        expect(args.user).to.equal(user1.address)
        expect(args.amount).to.equal(amount)
        expect(args.balance).to.equal(0)
      })
    })

    describe('Failure', () => {
      it('fails for insufficient balance', async () => {
        await expect(
          exchange.connect(user1)
          .withdrawToken(token1.address, amount)
        ).to.be.reverted
      })
    })
  })

  describe('Checking Balances', () => {
    let transaction, result
    let amount = tokens(1)

    beforeEach(async() => {
      transaction = await token1.connect(user1).approve(exchange.address, amount)
      result = await transaction.wait()
      transaction = await exchange.connect(user1).depositToken(token1.address, amount)
      result = await transaction.wait()
    })

    it('returns user balance', async () => {
      expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
    })
  })

  describe('Making orders', async () => {
    let transaction, result
    let amount = tokens(1)

    describe('Success', async () => {
      beforeEach(async () => {
        // Approve tokens
        transaction = await token1.connect(user1).approve(exchange.address, amount)
        result = await transaction.wait()
        // Deposit
        transaction = await exchange.connect(user1).depositToken(token1.address, amount)
        result = await transaction.wait()
        // Make order
        transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)
        result = await transaction.wait()
      })

      it('tracks the newly created order', async () => {
        expect(await exchange.orderCount()).to.equal(1)
      })

      it('emits an Order event', async () => {
        const event = result.events[0]
        expect(event.event).to.equal('Order')

        const args = event.args
        expect(args.id).to.equal(1)
        expect(args.user).to.equal(user1.address)
        expect(args.tokenGet).to.equal(token2.address)
        expect(args.amountGet).to.equal(amount)
        expect(args.tokenGive).to.equal(token1.address)
        expect(args.amountGive).to.equal(amount)
        expect(args.timestamp).to.at.least(1)
      })
    })

    describe('Failure', async () => {
      it('Rejects with no balance', async () => {
        await expect(
          exchange.connect(user1)
          .makeOrder(token2.address, amount, token1.address, amount)
        ).to.be.reverted
      })
    })
  })

  describe('Order actions', async () => {
    let transaction, result

    beforeEach(async () => {
      // Approve DAPP tokens for user 1
      transaction = await token1.connect(user1)
        .approve(exchange.address, tokens(100))
      result = await transaction.wait()
      // Deposit DAPP tokens for user 1
      transaction = await exchange.connect(user1)
        .depositToken(token1.address, tokens(100))
      result = await transaction.wait()
      // Make order for user 1
      transaction = await exchange.connect(user1)
        .makeOrder(token2.address, tokens(10),
          token1.address, tokens(1))
      result = await transaction.wait()
    })

    describe('Cancelling orders', async () => {
      describe('Success', async () => {
        beforeEach(async () => {
          // Cancel order
          transaction = await exchange.connect(user1).cancelOrder(1)
          result = await transaction.wait()
        })

        it('updates canceled orders', async () => {
          expect(await exchange.orderCancelled(1)).to.equal(true)
        })

        it('emits a Cancel event', async () => {
          const event = result.events[0]
          expect(event.event).to.equal('Cancel')

          const args = event.args
          expect(args.id).to.equal(1)
          expect(args.user).to.equal(user1.address)
          expect(args.tokenGet).to.equal(token2.address)
          expect(args.amountGet).to.equal(tokens(10))
          expect(args.tokenGive).to.equal(token1.address)
          expect(args.amountGive).to.equal(tokens(1))
          expect(args.timestamp).to.at.least(1)
        })

      })

      describe('Failure', async () => {
        it('rejects invalid order ids', async () => {
          const invalidId = 999
          await expect(
            exchange.connect(user1)
            .cancelOrder(invalidId)
          ).to.be.reverted
        })

        it('rejects unauthorized cancelations', async () => {
          await expect(
            exchange.connect(user2) // different user
            .cancelOrder(1)
          ).to.be.reverted
        })
      })
    })

    describe('Filling orders', async () => {
      beforeEach(async () => {
        // Give 1000 mDAI tokens to user2
        transaction = await token2.connect(deployer)
          .transfer(user2.address, tokens(1000))
        result = await transaction.wait()
        // Approve mDAI tokens for user 2
        transaction = await token2.connect(user2)
          .approve(exchange.address, tokens(100))
        result = await transaction.wait()
        // Deposit mDAI tokens for user 2
        transaction = await exchange.connect(user2)
          .depositToken(token2.address, tokens(100))
        result = await transaction.wait()
      })

      describe('Success', async () => {
        beforeEach(async () => {
          // Fill order
          transaction = await exchange.connect(user2).fillOrder(1)
          result = await transaction.wait()
        })

        it('updates token balances', async () => {
          // BEFORE trade:
          // order 1 DAPP for 10 mDAI
          // fee 10%
          // user1 balances: 100 DAPP 0 mDAI
          // user2 balances: 0 DAPP 100 mDAI
          // feeAccount balance: 0 DAPP 0 mDAI
          // AFTER trade:
          // user1 balances: 99 DAPP 10 mDAI
          // user2 balances: 1 DAPP 89 mDAI
          // feeAccount balance: 0 DAPP 1 mDAI

          // check balances for user1
          expect(
            await exchange.balanceOf(token1.address, user1.address)
          ).to.equal(tokens(99))
          expect(
            await exchange.balanceOf(token2.address, user1.address)
          ).to.equal(tokens(10))
          // check balances for user2
          expect(
            await exchange.balanceOf(token1.address, user2.address)
          ).to.equal(tokens(1))
          expect(
            await exchange.balanceOf(token2.address, user2.address)
          ).to.equal(tokens(89))
          // check balances for feeAcount
          expect(
            await exchange.balanceOf(token1.address, feeAccount.address)
          ).to.equal(tokens(0))
          expect(
            await exchange.balanceOf(token2.address, feeAccount.address)
          ).to.equal(tokens(1))
        })

        it('updates filled orders', async () => {
          expect(await exchange.orderFilled(1)).to.equal(true)
        })

        it('emits a Trade event', async () => {
          const event = result.events[0]
          expect(event.event).to.equal('Trade')

          const args = event.args
          expect(args.id).to.equal(1)
          expect(args.maker).to.equal(user1.address)
          expect(args.taker).to.equal(user2.address)
          expect(args.tokenGet).to.equal(token2.address)
          expect(args.amountGet).to.equal(tokens(10))
          expect(args.tokenGive).to.equal(token1.address)
          expect(args.amountGive).to.equal(tokens(1))
          expect(args.timestamp).to.at.least(1)
        })
      })

      describe('Failure', async () => {
        it('rejects invalid order ids', async () => {
          const invalidId = 999
          await expect(
            exchange.connect(user2)
            .fillOrder(invalidId)
          ).to.be.reverted
        })

        it('rejects on insufficient balance', async () => {
          // Fill order
          await expect(
            exchange.connect(user3)
            .fillOrder(1)
          ).to.be.reverted
        })

        it('rejects if order already filled', async () => {
          // Fill order
          transaction = await exchange.connect(user2).fillOrder(1)
          result = await transaction.wait()
          // Try to Fill again
          await expect(
            exchange.connect(user2)
            .fillOrder(1)
          ).to.be.reverted
        })

        it('rejects if order cancelled', async () => {
          // Cancel order
          transaction = await exchange.connect(user1).cancelOrder(1)
          result = await transaction.wait()
          // Try to Fill
          await expect(
            exchange.connect(user2)
            .fillOrder(1)
          ).to.be.reverted
        })
      })
    })
  })
})
