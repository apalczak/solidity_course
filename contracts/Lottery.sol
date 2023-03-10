//SPDX-License-Identifer: MIT

pragma solidity ^0.8.9;

contract Lottery {
    address public manager;
    address[] public players;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value == .01 ether);
        players.push(msg.sender);
    }

    function pseudoRandom() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }

    function checkBalance() public view returns (uint) {
        return address(this).balance;
    }

    function pickWinner() public onlyManagerCanCall {
        uint index = pseudoRandom() % players.length;
        payable(players[index]).transfer(address(this).balance);
        players = new address[](0);
    }

    modifier onlyManagerCanCall() {
        require(msg.sender == manager);
        _;
    }

    function getPlayers() public view returns (address[] memory){
        return players;
        }

}