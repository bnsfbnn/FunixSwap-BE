let Token = artifacts.require('BasicToken');
let Reserve = artifacts.require('Reserve');
let Exchange = artifacts.require('Exchange');

contract('Exchange Test. Deployment No_1.', function (accounts) {
    // Reserve
    // Constructor
    it('TC1. Reserve. Constructor.', async () => {
        var reserveTK1 = await Reserve.new("Token1", "TK1", 2, { from: accounts[0] });

        var tokenAddressTK1 = await reserveTK1.getTokenAddress();
        var rate = await reserveTK1.rate();
        var owner = await reserveTK1.owner();

        assert(tokenAddressTK1 != "");
        assert(reserveTK1.address != "");
        assert.equal(rate, 2, "FAIL");
        assert.equal(owner, accounts[0], "FAIL");
    });

    // Setters
    it("TC2. Reserve. Function 'setRate'.", async () => {
        const initRate = 2;
        const newRate = 3;
        var reserveTK1 = await Reserve.new("Token1", "TK1", initRate, { from: accounts[0] });
        // Khu vực gọi hàm cần test và theo dõi trạng thái contract
        // Trước khi gọi function
        var actualInitRate = await reserveTK1.rate();
        assert.equal(actualInitRate, initRate, "FAIL");
        // Gọi function
        await reserveTK1.setRate(newRate, { from: accounts[0] });
        // Sau khi gọi function
        var actualNewRate = await reserveTK1.rate();
        assert.equal(actualNewRate, newRate, "FAIL");
    });

    // Other functions
    it("TC3. Reserve. Function 'buy'.", async () => {
        // Khởi tạo contracts
        const reserveTK1 = await Reserve.new("Token1", "TK1", 2, { from: accounts[0] });
        const tokenTK1 = await Token.at(await reserveTK1.getTokenAddress());
        // Chuẩn bị
        const initBalance = await tokenTK1.balanceOf(accounts[1]);
        // Gọi function
        await reserveTK1.buy({ from: accounts[1], value: web3.utils.toWei("1", 'ether') });
        // Sau khi gọi function
        const newBalance = await tokenTK1.balanceOf(accounts[1]);

        assert.equal(newBalance, (initBalance * 1 + web3.utils.toWei("2", 'ether') * 1), "FAIL");
    });

    it("TC4. Reserve. Functions 'sell'.", async () => {
        // Khởi tạo contracts
        const reserveTK1 = await Reserve.new("Token1", "TK1", 2, { from: accounts[0] });
        const tokenTK1 = await Token.at(await reserveTK1.getTokenAddress());

        // Chuẩn bị
        await reserveTK1.buy({ from: accounts[1], value: web3.utils.toWei("1", 'ether') });

        const initBalance = await tokenTK1.balanceOf(accounts[1]);
        // Gọi function
        await tokenTK1.approve(reserveTK1.address, web3.utils.toWei("2", 'ether'), { from: accounts[1] });

        const sellAmount = web3.utils.toWei("1", 'ether');
        await reserveTK1.sell(sellAmount, { from: accounts[1] });
        // Sau khi gọi function
        const newBalance = await tokenTK1.balanceOf(accounts[1]);

        assert.equal(newBalance, initBalance * 1 - sellAmount * 1, "FAIL");
    });

    // Exchange
    // Constructor
    it('TC5. Exchange. Constructor.', async () => {
        var exchange = await Exchange.new({ from: accounts[0] });
        assert(exchange.address != "");
    });

    it("TC6. Exchange. Function 'addReserve' and 'getListOfSupportedTokens'.", async () => {
        // Khởi tạo contracts
        const reserveTK1 = await Reserve.new("Token1", "TK1", 2, { from: accounts[0] });
        const tokenTK1 = await Token.at(await reserveTK1.getTokenAddress());

        const reserveTK2 = await Reserve.new("Token2", "TK2", 1, { from: accounts[0] });
        const tokenME = await Token.at(await reserveTK2.getTokenAddress());

        var exchange = await Exchange.new({ from: accounts[0] });

        // Kết nối contracts
        await exchange.addReserve(reserveTK1.address, { from: accounts[0] });
        await exchange.addReserve(reserveTK2.address, { from: accounts[0] });

        var listSupportedTokens = await exchange.getListOfSupportedTokens();
        assert.equal(listSupportedTokens[0], tokenTK1.address, "FAIL");
        assert.equal(listSupportedTokens[1], tokenME.address, "FAIL");
    });

    it("TC7. Exchange. Function 'removeReserve'.", async () => {
        // Khởi tạo contracts
        const reserveTK1 = await Reserve.new("Token1", "TK1", 2, { from: accounts[0] });
        const tokenTK1 = await Token.at(await reserveTK1.getTokenAddress());

        const reserveTK2 = await Reserve.new("Token2", "TK2", 1, { from: accounts[0] });
        const tokenME = await Token.at(await reserveTK2.getTokenAddress());

        var exchange = await Exchange.new({ from: accounts[0] });

        // Kết nối contracts
        await exchange.addReserve(reserveTK1.address, { from: accounts[0] });
        await exchange.addReserve(reserveTK2.address, { from: accounts[0] });

        await exchange.removeReserve(tokenTK1.address);

        var listSupportedTokens = await exchange.getListOfSupportedTokens();


        assert.equal(listSupportedTokens.length, 1, "FAIL");
        assert.equal(listSupportedTokens[0], tokenME.address, "FAIL");
    });

    it("TC8. Exchange. Function 'getExchangeRate'.", async () => {
        // Khởi tạo contracts
        const reserveTK1 = await Reserve.new("Token1", "TK1", 2, { from: accounts[0] });
        const tokenTK1 = await Token.at(await reserveTK1.getTokenAddress());

        const reserveTK2 = await Reserve.new("Token2", "TK2", 1, { from: accounts[0] });
        const tokenME = await Token.at(await reserveTK2.getTokenAddress());

        var exchange = await Exchange.new({ from: accounts[0] });

        // Kết nối contracts
        await exchange.addReserve(reserveTK1.address, { from: accounts[0] });
        await exchange.addReserve(reserveTK2.address, { from: accounts[0] });

        // Chuẩn bị
        var receivedAmount = await exchange.getExchangeRate(tokenME.address, tokenTK1.address, "1");
        assert.equal(receivedAmount, 2, "FAIL");
    });

    it("TC9. Exchange. Function 'buyToken'.", async () => {
        // Khởi tạo contracts
        const reserveTK1 = await Reserve.new("Token1", "TK1", 2, { from: accounts[0] });
        const tokenTK1 = await Token.at(await reserveTK1.getTokenAddress());

        const reserveTK2 = await Reserve.new("Token2", "TK2", 1, { from: accounts[0] });
        const tokenME = await Token.at(await reserveTK2.getTokenAddress());

        var exchange = await Exchange.new({ from: accounts[0] });

        // Kết nối contracts
        await exchange.addReserve(reserveTK1.address, { from: accounts[0] });
        await exchange.addReserve(reserveTK2.address, { from: accounts[0] });

        // Chuẩn bị
        const initBalance = await tokenME.balanceOf(exchange.address);
        await exchange.buyToken(tokenME.address, { from: accounts[0], value: web3.utils.toWei("5", 'ether') });
        const newBalance = await tokenME.balanceOf(exchange.address);

        assert.equal(newBalance, initBalance * 1 + web3.utils.toWei("5", 'ether') * 1, "FAIL");
    });

    it("TC10. Exchange. Function 'exchangeEthToToken'.", async () => {
        // Khởi tạo contracts
        const reserveTK1 = await Reserve.new("Token1", "TK1", 2, { from: accounts[0] });
        const tokenTK1 = await Token.at(await reserveTK1.getTokenAddress());

        var exchange = await Exchange.new({ from: accounts[0] });

        // Kết nối contracts
        await exchange.addReserve(reserveTK1.address, { from: accounts[0] });

        // Chuẩn bị
        await exchange.buyToken(tokenTK1.address, { from: accounts[0], value: web3.utils.toWei("1", 'ether') });

        const initSWA = await tokenTK1.balanceOf(accounts[1]);

        //mua 1 TK1
        await exchange.exchangeEthToToken(tokenTK1.address, { from: accounts[1], value: web3.utils.toWei("0.5", 'ether') });

        const newSWA = await tokenTK1.balanceOf(accounts[1]);

        //ví sẽ thêm 1 TK1
        assert.equal(newSWA, initSWA * 1 + web3.utils.toWei("1", 'ether') * 1, "FAIL");
    });

    it("TC11. Exchange. Function 'exchange'.", async () => {
        // Khởi tạo contracts
        const reserveTK1 = await Reserve.new("Token1", "TK1", 2, { from: accounts[0] });
        const tokenTK1 = await Token.at(await reserveTK1.getTokenAddress());

        const reserveTK2 = await Reserve.new("Token2", "TK2", 1, { from: accounts[0] });
        const tokenME = await Token.at(await reserveTK2.getTokenAddress());

        var exchange = await Exchange.new({ from: accounts[0] });

        // Kết nối contracts
        await exchange.addReserve(reserveTK1.address, { from: accounts[0] });
        await exchange.addReserve(reserveTK2.address, { from: accounts[0] });

        // Chuẩn bị
        await exchange.buyToken(tokenME.address, { from: accounts[0], value: web3.utils.toWei("2", 'ether') });
        await exchange.buyToken(tokenTK1.address, { from: accounts[0], value: web3.utils.toWei("1", 'ether') });

        //đưa 1 TK2 cho account 1
        await exchange.exchangeEthToToken(tokenME.address, { from: accounts[1], value: web3.utils.toWei("1", 'ether') });
        const initME = await tokenME.balanceOf(accounts[1]);
        const initSWA = await tokenTK1.balanceOf(accounts[1]);

        //call exchange, đổi 1 TK2 lấy 2 TK1
        await tokenME.approve(exchange.address, web3.utils.toWei("1", 'ether'), { from: accounts[1] });
        await exchange.exchange(tokenME.address, tokenTK1.address, web3.utils.toWei("1", 'ether'), { from: accounts[1] });

        const newME = await tokenME.balanceOf(accounts[1]);
        const newSWA = await tokenTK1.balanceOf(accounts[1]);

        //ví sẽ giảm 1 TK2 và thêm 2 TK1
        assert.equal(newME, initME * 1 - web3.utils.toWei("1", 'ether') * 1, "FAIL");
        assert.equal(newSWA, initSWA * 1 + web3.utils.toWei("2", 'ether') * 1, "FAIL");
    });

    it("TC12. Exchange. Function 'exchangeTokenToEth'.", async () => {
        // Khởi tạo contracts
        const reserveTK1 = await Reserve.new("Token1", "TK1", 2, { from: accounts[0] });
        const tokenTK1 = await Token.at(await reserveTK1.getTokenAddress());

        var exchange = await Exchange.new({ from: accounts[0] });

        // Kết nối contracts
        await exchange.addReserve(reserveTK1.address, { from: accounts[0] });
        // Bơm cho exchange ít gas nè
        await web3.eth.sendTransaction({ from: accounts[0], to: exchange.address, value: web3.utils.toWei("0.001", 'ether') })

        //đưa 1 TK1 cho account 1
        await exchange.exchangeEthToToken(tokenTK1.address, { from: accounts[1], value: web3.utils.toWei("0.5", 'ether') });
        const initSWA = await tokenTK1.balanceOf(accounts[1]);
        const initBalance = await web3.eth.getBalance(accounts[1]);

        //đổi 1 TK1 lấy 0.5 ETH
        await tokenTK1.approve(exchange.address, web3.utils.toWei("1", 'ether'), { from: accounts[1] });
        await exchange.exchangeTokenToEth(tokenTK1.address, web3.utils.toWei("1", 'ether'), { from: accounts[1] });

        const newSWA = await tokenTK1.balanceOf(accounts[1]);
        const newBalance = await web3.eth.getBalance(accounts[1]);

        //ví sẽ giảm 1 TK1, nhận lại 0.5 ETH
        assert.equal(newSWA, initSWA * 1 - web3.utils.toWei("1", 'ether') * 1, "FAIL");
        assert(newBalance > (initBalance), "FAIL");
    });
});