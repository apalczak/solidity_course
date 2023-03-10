const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");

const { abi, evm } = require("../compileLottery");

const web3 = new Web3(ganache.provider());

describe("Lottery contract", () => {
    let lottery;
    let accounts = [];

    beforeEach(async () => {
        accounts = await web3.eth.getAccounts();
        lottery = await new web3.eth.Contract(abi)
            .deploy({
                data: evm.bytecode.object,
            })
            .send({ from: accounts[0], gas: "1000000" });
    });

    it("deploys a contract", () => {
        assert.ok(lottery.options.address);
    });

    it("allows one account to enter", async () => {
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei("0.01", "ether"),
        });
        const players = await lottery.methods
            .getPlayers()
            .call({ from: accounts[0] });
        assert.equal(accounts[1], players[0]);
        assert.equal(1, players.length);
    });

    it("allows multiple accounts to enter", async () => {
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei("0.01", "ether"),
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei("0.01", "ether"),
        });
        const players = await lottery.methods
            .getPlayers()
            .call({ from: accounts[0] });
        assert.equal(accounts[1], players[0]);
        assert.equal(accounts[2], players[1]);
        assert.equal(2, players.length);
    });

    it("requires an exact amout of ether to enter", async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[1],
                value: web3.utils.toWei("0.009", "ether"),
            });
            throw false;
        } catch (err) {
            assert.ok(err);
        }
    });

    it("only manager can call pickWinner", async () => {
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei("0.01", "ether"),
        });

        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1],
            });
            throw false;
        } catch (err) {
            assert(err);
        }
    });

    it("sends money to the winner and resets the player array", async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei("0.01", "ether"),
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);

        await lottery.methods.pickWinner().send({
            from: accounts[0],
        });

        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;
        assert(difference > web3.utils.toWei("0.008", "ether"));

        const players = await lottery.methods
            .getPlayers()
            .call({ from: accounts[0] });
        assert.equal(0, players.length);
    });
});
