// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Reserve.sol";
import "./IERC20.sol";

contract Exchange {
 
    mapping(address => address) token_reserve_map;
    address[] tokenAddresses;
    string[] tokenSymbols;
    string[] tokenNames;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
    }

    function checkEthBalance() public view returns(uint256){
        return (payable(address(this))).balance;
    }

    function getListOfSupportedTokens() public view returns (address[] memory) {
        return tokenAddresses;
    }

    function getExchangeRate(
        address srcToken,
        address destToken,
        uint256 amount
    ) public view returns (uint256) {
        uint256 sourceRate = 1;
        if (srcToken != address(0)) {
            sourceRate = Reserve(token_reserve_map[srcToken]).rate();
        }

        uint256 destinationRate = 1;
        if (destToken != address(0)) {
            destinationRate = Reserve(token_reserve_map[destToken]).rate();
        }

        return (amount * destinationRate) / sourceRate;
    }

    function exchange(address srcTokenAddress, address destTokenAddress, uint256 srcAmount) public returns (uint256) {
        Reserve srcReserve = Reserve(token_reserve_map[srcTokenAddress]);
        Reserve destReserve = Reserve(token_reserve_map[destTokenAddress]);
        BasicToken srcToken = srcReserve.token();
        BasicToken destToken = destReserve.token();

        require(srcAmount > 0, "Exchange: You need to trade at least some tokens");
        require(srcToken.allowance(msg.sender, address(this)) >= srcAmount, "Exchange: Check the token allowance");

        uint256 exchangeAmount = getExchangeRate(srcTokenAddress, destTokenAddress, srcAmount);

        require(srcToken.balanceOf(msg.sender) >= srcAmount, "Exchange: sender doesn't have enough Tokens");
        require(destToken.balanceOf(address(this)) >= exchangeAmount, "Exchange: currently this Exchange doesnt have enough destination Token");

        srcToken.transferFrom(msg.sender, address(this), srcAmount);

        destToken.transfer(msg.sender, exchangeAmount);

        return exchangeAmount;
    }

    function exchangeEthToToken(address destTokenAddress) public payable returns (uint256) {
        Reserve destReserve = Reserve(token_reserve_map[destTokenAddress]);
        BasicToken destToken = destReserve.token();

        require(destReserve.buy{value: msg.value}(), "Exchange: failed to buy dest token");
        

        uint256 exchangeAmount = mul(msg.value, destReserve.rate());

        destToken.transfer(msg.sender, exchangeAmount);

        return exchangeAmount;
    }

    function exchangeTokenToEth(address srcTokenAddress, uint256 amount) public returns (uint256) {
        Reserve srcReserve = Reserve(token_reserve_map[srcTokenAddress]);
        BasicToken srcToken = srcReserve.token();

        srcToken.transferFrom(msg.sender, address(this), amount);

        srcToken.approve(token_reserve_map[srcTokenAddress], 10e18);
        require(srcReserve.sell(amount), "Exchange: failed to sell src token");

        payable(msg.sender).transfer(amount / srcReserve.rate());

        return amount / srcReserve.rate();
    }

    function addReserve(Reserve newReserve) public onlyOwner {
        // get token
        BasicToken token = newReserve.token();
        address tokenAddress = address(token);
        string memory symbol = token.symbol();
        string memory name = token.name();

        // Validate new token: new token must not exist in tokenAddresses
        for (uint8 index = 0; index < tokenAddresses.length; index++) {
            require(tokenAddress != tokenAddresses[index]);
            require(!equal(token.symbol(), tokenSymbols[index]));
            require(!equal(name, tokenNames[index]));
        }
        
        // mapping token to reserve
        token_reserve_map[tokenAddress] = address(newReserve);
        // add token to list of tokens (Using in getting list of supported token)
        tokenAddresses.push(tokenAddress);
        tokenSymbols.push(symbol);
        tokenNames.push(name);
    }

    function buyToken(address tokenAddress) public payable onlyOwner {
        Reserve reserve = Reserve(token_reserve_map[tokenAddress]);
        reserve.buy{value: msg.value}();
    }

    // // Remove reserve
    function removeReserve(address tokenAddress) public onlyOwner {
        for (uint8 index = 0; index < tokenAddresses.length; index++) {
            if (tokenAddress == tokenAddresses[index]) {
                removeReserveData(index);
                break;
            }
        }
        delete token_reserve_map[tokenAddress];
    }

    function removeReserveData(uint256 index) private {
            // Đẩy các phần tử phía sau lên phía trước 1 đơn vị
            for (uint i = index; i < tokenAddresses.length-1; i++){
                tokenAddresses[i] = tokenAddresses[i+1];
                tokenSymbols[i] = tokenSymbols[i+1];
                tokenNames[i] = tokenNames[i+1];
            }
            // Xóa bỏ phần tử cuối cùng
            tokenAddresses.pop();
            tokenSymbols.pop();
            tokenNames.pop();
        }


    function compare(string memory _a, string memory _b) private pure returns (int) {
        bytes memory a = bytes(_a);
        bytes memory b = bytes(_b);
        uint minLength = a.length;
        if (b.length < minLength) minLength = b.length;
        //@todo unroll the loop into increments of 32 and do full 32 byte comparisons
        for (uint i = 0; i < minLength; i ++)
            if (a[i] < b[i])
                return -1;
            else if (a[i] > b[i])
                return 1;
        if (a.length < b.length)
            return -1;
        else if (a.length > b.length)
            return 1;
        else
            return 0;
    }
    /// @dev Compares two strings and returns true iff they are equal.
    function equal(string memory _a, string memory _b) private pure returns (bool) {
        return compare(_a, _b) == 0;
    }
    function mul(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x, "ds-math-mul-overflow");
    }
}
