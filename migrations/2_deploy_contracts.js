
const ReserveTK1 = artifacts.require("Reserve");
const ReserveTK2 = artifacts.require("Reserve");
const Exchange = artifacts.require("Exchange");

module.exports = async function (deployer, network, accounts, web3) {
    await deployer.deploy(ReserveTK1, "Token 1", "TK1", 1, { from: accounts[0], gas: 3000000 });
    const instanceTK1 = await ReserveTK1.deployed();
    const tokenTK1Address = await instanceTK1.getTokenAddress();
    console.log(`.=.=.=.=.==.=.=.=.=.=.=. Token TK1 address: ${tokenTK1Address}`);
    const tokenTK1Rate = await instanceTK1.rate();
    console.log(`.=.=.=.=.==.=.=.=.=.=.=. Token TK1 rate: ${tokenTK1Rate}`);

    await deployer.deploy(ReserveTK2, "Token 2", "TK2", 2, { from: accounts[0], gas: 3000000 });
    const instanceTK2 = await ReserveTK2.deployed();
    const tokenTK2Address = await instanceTK2.getTokenAddress();
    console.log(`.=.=.=.=.==.=.=.=.=.=.=. Token TK2 address: ${tokenTK2Address}`);
    const tokenTK2Rate = await instanceTK2.rate();
    console.log(`.=.=.=.=.==.=.=.=.=.=.=. Token TK2 rate: ${tokenTK2Rate}`);

    await deployer.deploy(Exchange, { from: accounts[0], gas: 6000000 });
    const instanceEx = await Exchange.deployed();
    const ownerEx = await instanceEx.owner();
    console.log(`.=.=.=.=.==.=.=.=.=.=.=. Exchange owner: ${ownerEx}`);
};