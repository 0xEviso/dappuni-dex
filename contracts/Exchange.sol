// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;

    event Deposit(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _balance
    );

    event Withdrawal(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _balance
    );

    mapping(address => mapping(address => uint256)) public tokens;

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function depositToken(address _token, uint256 _amount) public {
        // Transfer tokens to exchange
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        // Update user balance
        tokens[_token][msg.sender] += _amount;
        // Emit an event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        // Ensure user has enough tokens to withdraw
        require(tokens[_token][msg.sender] >= _amount);
        // Transfer tokens to user
        Token(_token).transfer(msg.sender, _amount);
        // Update user balance
        tokens[_token][msg.sender] -= _amount;
        // Emit event
        emit Withdrawal(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function balanceOf(address _token, address _user)
        public
        view
        returns (uint256)
    {
        return tokens[_token][_user];
    }
}
