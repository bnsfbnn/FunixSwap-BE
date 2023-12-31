
const ReserveTK1 = artifacts.require("Reserve");
const ReserveTK2 = artifacts.require("Reserve");
const Exchange = artifacts.require("Exchange");
const Token = artifacts.require("BasicToken");
const web3Utils = require('web3-utils');
module.exports = async function (deployer, network, accounts, web3) {
    await deployer.deploy(ReserveTK1, "Token 1", "TK1", 2, { from: accounts[0], gas: 2000000 });
    const instanceTK1Reserve = await ReserveTK1.deployed();
    const tokenTK1Address = await instanceTK1Reserve.getTokenAddress();
    const tokenTK1ReserveAddress = instanceTK1Reserve.address;
    await deployer.deploy(ReserveTK2, "Token 2", "TK2", 4, { from: accounts[0], gas: 2000000 });
    const instanceTK2Reserve = await ReserveTK2.deployed();
    const tokenTK2Address = await instanceTK2Reserve.getTokenAddress();
    const tokenTK2ReserveAddress = instanceTK2Reserve.address;
    await deployer.deploy(Exchange, { from: accounts[0], gas: 3000000 });
    const instanceEx = await Exchange.deployed();
    await instanceEx.addReserve(tokenTK1ReserveAddress);
    await instanceEx.addReserve(tokenTK2ReserveAddress);
    await instanceEx.buyToken(tokenTK1Address, { from: accounts[0], value: web3Utils.toWei("100", 'ether') });
    await instanceEx.buyToken(tokenTK2Address, { from: accounts[0], value: web3Utils.toWei("100", 'ether') });
    //const instanceTK1Token = await Token.at(tokenTK1Address);
    //const numberToken = await instanceTK1Token.balanceOf(tokenTK1ReserveAddress);
    console.log(`.=.=.=.=.==.=.=.=.=.=.=. Token TK1 Address: ${tokenTK1Address}`);
    console.log(`.=.=.=.=.==.=.=.=.=.=.=. Token TK2 Address: ${tokenTK2Address}`);
    console.log(`.=.=.=.=.==.=.=.=.=.=.=. Token TK1 Reserve Address: ${tokenTK1ReserveAddress}`);
    console.log(`.=.=.=.=.==.=.=.=.=.=.=. Token TK2 Reserve Address: ${tokenTK2ReserveAddress}`);
    console.log(`.=.=.=.=.==.=.=.=.=.=.=. Exchange Address: ${instanceEx.address}`);
    //console.log(`.=.=.=.=.==.=.=.=.=.=.=. Token Numbers: ${numberToken} of ${tokenTK1ReserveAddress}`);
};
