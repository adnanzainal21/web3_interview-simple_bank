// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Bank{
    address public owner;
    uint256 private transactionCount;
    uint private customerCount;
    uint private pool;
    
    mapping(address => uint256) private balances;

    //deposit
    event Deposit(address indexed accountAddress, address owner, uint amount,uint256 timestamp);

    //exchange
    event Transfer(address from, address reciever, uint amount, string message, uint256 timestamp);

    constructor(){
        owner = msg.sender;
        transactionCount =0;
        customerCount = 0;
    }
    // interface property
    struct TransferInterface {
        address sender;
        address receiver;
        uint amount;
        string message;
        uint256 timestamp;
    }

    //save all transation to array of transaction filter by inerface
    TransferInterface[] transactions;


    // --- Bank Section ---

    // new user require to enroll before make ant transaction
    function enroll() public returns (uint) {
        address user = msg.sender;
        customerCount ++;
        return user.balance;
    }

    function deposit(uint amount) public payable{
        address user = msg.sender;
        balances[user] +=  amount;
        pool += amount;
        emit Deposit(user, owner, amount, block.timestamp);
        transactionCount ++;
    }

    function withdraw(uint amount, string memory message) public payable returns (uint remainingBal) {
        address user = msg.sender;
        require(balances[user] >= amount, "Balance is appropriate");

        balances[user] -= amount;
        pool -= amount;
        emit Transfer(owner ,user , amount, message = "Withdraw",block.timestamp);
 
        transactionCount ++;
        return balances[user];
    }

    function balance() public view returns (uint256) {
        address user = msg.sender;
        return balances[user];
    }


    //----Transacion section ---//

    //Exhacge ether to bank add message and value to blockchain
    function addToBlockchain(address payable receiver,uint amount, string memory message) public {
        transactionCount += 1;
        //push dump date not yet actaul data
        transactions.push(TransferInterface(msg.sender, receiver, amount, message, block.timestamp));
        
        // call Transfer event to really make transaction
        emit Transfer(msg.sender, receiver, amount, message, block.timestamp);
    }

    //public this function and return in typeof TransferStruct[] that stored on memeory
    function getAllTransactions() public view returns (TransferInterface[] memory) {
        return transactions;
    }

    // get all transaction that already made
    function getTransactionCount() public view returns (uint256) {
        return transactionCount;
    }

    function allBalancepool() public view returns (uint) {
        return pool;
    }

    fallback() external {
        revert();
    }

}