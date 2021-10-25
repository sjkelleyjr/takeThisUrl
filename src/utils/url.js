/***
 * The following contract address and ABI are for a deployment of the Lottery contract made to the
 * Ganache Test Network. The contract itself was compiled using version 0.8.5 of the Solidity
 * compiler.
 *
 * NOTE: Update the contractAddress and abi variables to those for your own deployed contract.
 */

export const contractAddress = "0x63fe561F3b36582B6D55656b7EccE6c4eD6b6075";

export const abi = [
  {
    "inputs": [],
    "name": "maxBid",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "url",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "newUrl",
        "type": "string"
      }
    ],
    "name": "setThisUrl",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];
