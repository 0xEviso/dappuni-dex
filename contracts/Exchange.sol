// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;
    // mapping token => user => amount
    mapping(address => mapping(address => uint256)) public tokens;
    mapping (uint256 => _Order) public orders;
    mapping (uint256 => bool) public orderCancelled;
    mapping (uint256 => bool) public orderFilled;
    uint256 public orderCount = 0;

    event Deposit(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );
    event Withdrawal(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Trade(
        uint256 id,
        address maker,
        address taker,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

    struct _Order {
        uint256 id; // Unique Identifier for the order
        address user; // User who made order
        address tokenGet; // Address of the token they receive
        uint256 amountGet; // Amount they receive
        address tokenGive; // Address of the token they give
        uint256 amountGive; // Amount they give
        uint256 timestamp; // when order was created
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    //
    // DEPOSIT AND WITHDRAWAL
    //

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

    //
    // MAKE AND CANCEL ORDERS
    //

    // Token Give (the token they want to spend)
    // Token Get (the token they want to receive)
    function makeOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) public {
        // check that user has enough tokens
        require(balanceOf(_tokenGive, msg.sender) >= _amountGive);

        // Instantiate a new order
        orderCount++;
        orders[orderCount] = _Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );

        // Emit event
        emit Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }

    function cancelOrder(uint256 _orderId) public returns(bool) {
        // Fetch order
        _Order storage _order = orders[_orderId];

        // Check that order exists
        require(_order.id == _orderId);

        // Check that user has write access
        require(_order.user == msg.sender);

        // Cancel the order
        orderCancelled[_orderId] = true;

        // Emit event
        emit Cancel(
            _order.id,
            _order.user,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive,
            block.timestamp
        );

        return true;
    }

    function fillOrder(uint256 _orderId) public returns(bool) {
        // check not already filled
        require(!orderFilled[_orderId]);
        // check not cancelled
        require(!orderCancelled[_orderId]);

        _Order storage _order = orders[_orderId];

        uint256 _feeAmount = _order.amountGet * feePercent / 100;

        // Check that order exists
        require(_order.id == _orderId);

        // check users have enough balance
        require(tokens[_order.tokenGet][msg.sender] >=
            (_order.amountGet + _feeAmount));
        require(tokens[_order.tokenGive][_order.user] >=
            _order.amountGive);

        // debit tokenGive from maker account
        tokens[_order.tokenGive][_order.user] -= _order.amountGive;
        // credit tokenGive to taker account
        tokens[_order.tokenGive][msg.sender] += _order.amountGive;
        // credit tokenGet to maker account
        tokens[_order.tokenGet][_order.user] += _order.amountGet;
        // debit tokenGet + fee from taker account
        tokens[_order.tokenGet][msg.sender] -= (_order.amountGet + _feeAmount);
        // credit fee acount with tokenGet
        tokens[_order.tokenGet][feeAccount] += _feeAmount;

        // Record order filled
        orderFilled[_orderId] = true;

        emit Trade(
            _orderId,
            _order.user,
            msg.sender,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive,
            block.timestamp
        );

        return true;
    }
}
