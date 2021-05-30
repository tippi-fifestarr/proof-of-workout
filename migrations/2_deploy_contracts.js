const BCBC = artifacts.require("BCBC");

module.exports = function(deployer) {
  deployer.deploy(BCBC, "Hello World Block Chain Body Challenge");
};
// 0xD1c27467d9fFbD5CE66cb23fd2250F5Cdc763f0f on matic
