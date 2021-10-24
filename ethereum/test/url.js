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

    await truffleAssert.reverts(url.takeThisUrl('TEST_URL', { from: accounts[0], value: zeroEther }),
      'msg.value must exceed previous max bid.');

    const currentlUrl = await url.url.call();
    const currentMaxBid = await url.maxBid.call();  

    assert.equal(currentlUrl, 'https://console.substack.com/')
    assert.equal(currentMaxBid, zeroEther);
  });

  it("should be able to take the URL", async function () {
    const url = await Url.deployed();

    const oneEther = web3.utils.toWei('1', 'ether');
    await url.takeThisUrl('TEST_URL', { from: accounts[0], value: oneEther });

    const newUrl = await url.url.call();
    const newMaxBid = await url.maxBid.call();  

    assert.equal(newUrl, 'TEST_URL');
    assert.equal(newMaxBid, oneEther);
  });

});
