// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IERC20.sol";

contract Reserve {

    event Bought(uint256 amount);
    event Sold(uint256 amount);

    address public owner;
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    BasicToken public token;
    uint public rate = 1;

    constructor(string memory _name, string memory _symbol, uint256 _rate) {
        owner = msg.sender;

        token = new BasicToken(_name, _symbol);
        rate = _rate;
    }

    function buy() payable public returns (bool) {
        uint256 amountTobuy = msg.value * rate;

        require(amountTobuy > 0, "Reserve: You need to send some ether");
        require(amountTobuy <= token.balanceOf(address(this)), "Reserve: Not enough tokens in the reserve");

        token.transfer(msg.sender, amountTobuy);
        emit Bought(amountTobuy);

        return true;
    }

    function sell(uint256 amount) public returns (bool) {
        require(amount > 0, "Reserve: You need to sell at least some tokens");
        uint256 allowance = token.allowance(msg.sender, address(this));
        require(allowance >= amount, "Reserve: Check the token allowance");
        token.transferFrom(msg.sender, address(this), amount);
        payable(msg.sender).transfer(amount/rate);
        emit Sold(amount);

        return true;
    }

    function getTokenAddress() public view returns (address){
        return address(token);
    }

    function setRate(uint256 newRate) public onlyOwner {
        require(newRate > 0, "rate must greater than 0");

        rate = newRate;
    }
}