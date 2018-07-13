pragma solidity ^0.4.23;

import "../math/SafeMath.sol";
import "../ownership/Ownable.sol";


/**
 * @title Ticket
 * @dev Base contract supporting smart tickets
 */
contract Ticket is Ownable {
  using SafeMath for uint256;

  address public holder;
  bool public used;
  uint256 public validInMinutes;

  enum State { Granted, InUse, Used }
  State public state;

  uint256 whenGranted;

  /**
   * @dev Throws if called by any account other than the holder
   */
  modifier onlyHolder() {
    require(msg.sender == holder);
    _;
  }

  /**
   * @dev Constructor
   * @param _holder         address of the ticket holder
   * @param _validInMinutes for how long ticket is valid
   */
  constructor(address _holder, uint256 _validInMinutes) 
  public payable {
    require(_validInMinutes > 0);

    owner = msg.sender;
    holder = _holder;
    validInMinutes = _validInMinutes;

    // solium-disable-next-line security/no-block-members
    whenGranted = block.timestamp;
    state = State.Granted;
  }

  /**
   * @dev Fund the amount
   */
  function () public payable {}

  /**
   * @dev Activate the ticket 
   */
  function setInUse() public onlyHolder {
    state = State.InUse;
  }

  function isInUse() public view returns (bool) {
    return state == State.InUse;
  }

  function isGranted() public view returns (bool) {
    return state == State.Granted;
  }
}
