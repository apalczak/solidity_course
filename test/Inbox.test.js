const assert = require("assert");
const genache = require("ganache-cli");
const Web3 = require("web3");

const { abi, evm } = require("../compileInbox");

const web3 = new Web3(genache.provider());

describe("Inbox", () => {
    const INITIAL_STRING = "Hello World!";
    const MESSAGE_TO_CHANGE = "Hi there!";

    let accounts;
    let inbox;

    beforeEach(async () => {
        accounts = await web3.eth.getAccounts();
        inbox = await new web3.eth.Contract(abi)
            .deploy({
                data: evm.bytecode.object,
                arguments: [INITIAL_STRING],
            })
            .send({ from: accounts[0], gas: "1000000" });
    });

    it("deploys a contract", () => {
        assert.ok(inbox.options.address);
    });

    it("has a default message", async () => {
        const message = await inbox.methods.message().call();
        assert.equal(message, INITIAL_STRING);
    });

    it("is able to set new message", async () => {
        await inbox.methods
            .setMessage(MESSAGE_TO_CHANGE)
            .send({ from: accounts[0] });
        const message = await inbox.methods.message().call();
        assert.equal(message, MESSAGE_TO_CHANGE);
    });
});
