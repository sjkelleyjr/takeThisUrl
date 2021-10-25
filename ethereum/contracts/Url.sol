// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";


contract Url is Ownable {

  string public url = "https://console.substack.com/";
  uint256 public maxBid = 0 ether;

  function setThisUrl(string memory newUrl) public payable {
    require(msg.value > maxBid, "msg.value must exceed previous max bid.");
    maxBid = msg.value;
    url = newUrl;
  }

  function withdraw() public onlyOwner {
    payable(owner()).transfer(address(this).balance);
  }
}
