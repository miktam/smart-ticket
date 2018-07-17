pragma solidity ^0.4.23;
// solium-disable-next-line no-experimental
pragma experimental ABIEncoderV2;

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
    State state;
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
   * @dev fallback function to accept funds
   */
  function () public payable {}

  /**
   * @param _holder         address of the ticket holder
   * @param _validInMinutes for how long ticket is valid
   */
  function newTicket(
    address _holder, 
    string _appId,
    string _appKey, 
    uint256 _validInMinutes) onlyOwner public returns (uint ticketID) 
  {
    ticketID = ticketsIssued++;
    ticketsHolder[ticketID] = Ticket(
      msg.sender, 
      _holder, 
      _validInMinutes, 
      _appId, 
      _appKey, 
      State.Granted);
    return ticketID;
  }

  /**
  * @dev only for demonstration purposes - can not be exposed via web3 yet: *   https://ethereum.stackexchange.com/questions/36229/invalid-solidity-type-tuple
  */
  function getTicket(uint index) public view returns (Ticket) {
    require(index < ticketsIssued);
    return ticketsHolder[index];
  }

  /**
  * @dev is ticket valid (is in {Granted, InUse} state)
  */
  function isTicketValid(uint index) public view returns (bool) {
    require(index < ticketsIssued);
    return ticketsHolder[index].state != State.Used;
  }

}
