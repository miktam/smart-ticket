pragma solidity ^0.4.23;

import "../math/SafeMath.sol";
import "../ownership/Ownable.sol";


/**
 * @title Ticket
 * @dev Base contract supporting smart tickets
 */
contract TicketManager is Ownable {
  using SafeMath for uint256;

  enum State { Granted, InUse, Used }

  struct App {
    string id;
    string key;
  }

  struct Ticket {
    address issuer;       // ticket issuer
    address holder;       // token holder
    uint256 validInMinutes; // time validity of the ticket
    string appId;          
    string appKey;
  }

  mapping(uint => Ticket) public ticketsHolder;
  uint256 public ticketsIssued = 0;

  /**
   * @dev Constructor
   */
  constructor() public payable {
    owner = msg.sender;
  }

  /**
   * @param _holder         address of the ticket holder
   * @param _validInMinutes for how long ticket is valid
   */
  function newTicket(address _holder, string _appId, string _appKey, uint256 _validInMinutes) onlyOwner public returns (uint ticketID) {
    ticketID = ticketsIssued++;
    ticketsHolder[ticketID] = Ticket(msg.sender, _holder, _validInMinutes, _appId, _appKey);
    return ticketID;
  }

  /**
   * @dev fallback function to accept funds
   */
  function () public payable {}

}
