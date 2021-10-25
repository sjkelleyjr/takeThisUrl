const truffleAssert = require('truffle-assertions');
const Url = artifacts.require("Url");

contract("Url", accounts => {

  it("should have an initial URL and max bid of 0", async function () {
    const url = await Url.deployed();

    const initialUrl = await url.url.call();
    const initialMaxBid = await url.maxBid.call();

    assert.equal(initialMaxBid, web3.utils.toWei('0', 'ether'), 'incorrect initial maxBid');
    assert.equal(initialUrl, 'https://console.substack.com/', 'incorrect initial URL');
  });

  it("should not be able to take the URL with a sufficient bid", async function () {
    const url = await Url.deployed();

    const zeroEther = web3.utils.toWei('0', 'ether');

    await truffleAssert.reverts(url.setThisUrl('TEST_URL', { from: accounts[1], value: zeroEther }),
      'msg.value must exceed previous max bid.');

    const currentlUrl = await url.url.call();
    const currentMaxBid = await url.maxBid.call();  

    assert.equal(currentlUrl, 'https://console.substack.com/')
    assert.equal(currentMaxBid, zeroEther);
  });

  it("should be able to take the URL", async function () {
    const url = await Url.deployed();

    const oneEther = web3.utils.toWei('1', 'ether');
    await url.setThisUrl('TEST_URL', { from: accounts[1], value: oneEther });

    const newUrl = await url.url.call();
    const newMaxBid = await url.maxBid.call();  

    assert.equal(newUrl, 'TEST_URL');
    assert.equal(newMaxBid, oneEther);
  });

  it("should only allow the owner to withdraw funds", async function () {
    const url = await Url.deployed();
    const ownerBalancePreWithdraw = await web3.eth.getBalance(accounts[0]);

    const twoEther = web3.utils.toWei('2', 'ether');
    const threeEther = web3.utils.toWei('3', 'ether');
    const zeroEther = web3.utils.toWei('0', 'ether');

    await url.setThisUrl('TEST_URL_2', { from: accounts[1], value: twoEther });

    const newUrl = await url.url.call();
    const newMaxBid = await url.maxBid.call();  

    const contractBalancePreWithdraw = await web3.eth.getBalance(url.address);

    await truffleAssert.reverts(url.withdraw({ from: accounts[1] }));
    await url.withdraw({ from: accounts[0] });

    const ownerBalancePostWithdraw = await web3.eth.getBalance(accounts[0]);
    const contractBalancePostWithdraw = await web3.eth.getBalance(url.address);
    const ownerBalanceDifference = (ownerBalancePostWithdraw - ownerBalancePreWithdraw).toString();

    assert.equal(newUrl, 'TEST_URL_2', 'expected a  new URL.');
    assert.equal(newMaxBid, twoEther, 'expected a new max bid of 2 ether.');
    assert.equal(contractBalancePreWithdraw, threeEther, 'expected the contract to have three ether pre-withdrawal');
    assert.equal(contractBalancePostWithdraw, zeroEther, 'expected the contract to have no ether after withdrawal');
    assert.isTrue(ownerBalanceDifference > twoEther, 'expected owner to have 2 more ether after withdrawal.');
    assert.isTrue(ownerBalanceDifference < threeEther, 'expected owner to have less than 3 ether due to gas costs.');
  });
});
