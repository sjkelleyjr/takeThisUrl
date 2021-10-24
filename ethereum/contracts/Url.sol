// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Url {

  string public url = "https://console.substack.com/";
  uint256 public maxBid = 0 ether;

  constructor() public { }

  function takeThisUrl(string memory newUrl) public payable {
    require(msg.value > maxBid, "msg.value must exceed previous max bid.");
    maxBid = msg.value;
    url = newUrl;
  }

  // TODO: write the withdrawal code to access the ether (need to import Owner and use onlyOwner)
}
