pragma solidity ^0.4.24;
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

  mapping(uint => Ticket) public tickets;
  mapping(address => Ticket[]) public ticketsPerPerson;
  address[] public users;

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
  function () external payable {}

  /**
   * @param _holder         address of the ticket holder
   * @param _validInMinutes for how long ticket is valid
   */
  function newTicket(
    address _holder, 
    string _appId,
    string _appKey, 
    uint256 _validInMinutes) public onlyOwner returns (uint ticketID) 
  {
    ticketID = ticketsIssued++;
    tickets[ticketID] = Ticket(
      msg.sender, 
      _holder, 
      _validInMinutes, 
      _appId, 
      _appKey, 
      State.Granted);

    addTicketForUser(_holder, tickets[ticketID]);
    return ticketID;
  }

  /**
  * @dev only for demonstration purposes - can not be exposed via web3 yet: *   https://ethereum.stackexchange.com/questions/36229/invalid-solidity-type-tuple
  */
  function getTicket(uint index) public view returns (Ticket) {
    require(index < ticketsIssued, "Out of bound");
    return tickets[index];
  }

  /**
  * @dev is ticket valid (is in {Granted, InUse} state)
  */
  function isTicketValid(uint index) public view returns (bool) {
    require(index < ticketsIssued, "Out of bound");
    return tickets[index].state != State.Used;
  }

  /**
  * @dev sets ticket in InUse state
  * Constraint: set only by ticket holder
  */
  function setTicketInUse(uint index) public {
    require(index < ticketsIssued, "Out of bound");
    require(tickets[index].state == State.Granted, "Wrong transition");
    require(tickets[index].holder == msg.sender, "Caller is not a holder");
    tickets[index].state = State.InUse;
  }

  /**
  * @dev is ticket in InUse state
  */
  function isTicketInUse(uint index) public view returns (bool) {
    require(index < ticketsIssued, "Out of bound");
    return tickets[index].state == State.InUse;
  }

  /**
  * @dev get number of tickets per user
  */
  function getTicketsPerUserNumber(address add) public view returns (uint) {
    return ticketsPerPerson[add].length;
  }

  /** 
  * @dev check if ticket is valid
  */
  function isTicketValid(address user, uint index) public view returns (bool) {
    require(ticketsPerPerson[user].length > index, "Out of bound");
    return ticketsPerPerson[user][index].state == State.InUse ||
      ticketsPerPerson[user][index].state == State.Granted;
  }

  /**
  * @dev collect tickets per user
  */
  function addTicketForUser(address user, Ticket t) private {
    if (ticketsPerPerson[user].length == 0) {
      users.push(user);
    }
    ticketsPerPerson[user].push(t);
  }

}
