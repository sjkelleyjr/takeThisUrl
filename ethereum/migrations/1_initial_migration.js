const Migrations = artifacts.require("Migrations");
const Url = artifacts.require("./Url.sol");



module.exports = function (deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Url);
};
