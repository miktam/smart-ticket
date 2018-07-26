import increaseTime from '../helpers/increaseTime';
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();
const EVMThrow = require('../helpers/EVMThrow.js');

const TicketManager = artifacts.require('TicketManager');

contract('Ticket', function ([ownerAddress, holderAddress, other]) {
  const validInMinutes = 60;
  const amount = web3.toWei(1.0, 'ether');

  const appId = 'appId';
  const appKey = 'appKey';

  beforeEach(async function () {
    this.contract = await TicketManager.new();
  });

  it('ticket should be issued by the owner', async function () {
    const ticketsIssued = await this.contract.ticketsIssued();
    ticketsIssued.should.be.bignumber.equal(0);
    await this.contract.newTicket(holderAddress, appId, appKey, validInMinutes, { from: ownerAddress });
    const ticketsIssuedNow = await this.contract.ticketsIssued();
    ticketsIssuedNow.should.be.bignumber.equal(1);

    const ticketValid = await this.contract.isTicketValid(holderAddress, 0);
    ticketValid.should.equal(true);
  });

  it('if ticket issued by not authorized person - should throw', async function () {
    await this.contract.newTicket(holderAddress, appId, appKey, validInMinutes,
      { from: holderAddress }).should.be.rejectedWith(EVMThrow);
  });

  it('ticket should be set in InUse state only by the ticket holder', async function () {
    await this.contract.newTicket(holderAddress, appId, appKey, validInMinutes, { from: ownerAddress });
    await this.contract.setTicketInUse(0, { from: holderAddress });
    const ticketValid = await this.contract.isTicketInUse(0);
    ticketValid.should.equal(true);
  });

  it('modifying the state by not holder should be prohibited', async function () {
    await this.contract.newTicket(holderAddress, appId, appKey, validInMinutes);
    await this.contract.setTicketInUse(0, { from: ownerAddress }).should.be.rejectedWith(EVMThrow);
  });

  it('getting ticket out of bound (higher) should revert', async function () {
    await this.contract.newTicket(holderAddress, appId, appKey, validInMinutes);
    await this.contract.getTicket(100).should.be.rejectedWith(EVMThrow);
  });

  it('getting ticket InUse state out of bound (higher) should revert', async function () {
    await this.contract.newTicket(holderAddress, appId, appKey, validInMinutes);
    await this.contract.isTicketInUse(100).should.be.rejectedWith(EVMThrow);
  });

  it('getting ticket Valid state out of bound (higher) should revert', async function () {
    await this.contract.isTicketValid(holderAddress, 100).should.be.rejectedWith(EVMThrow);
  });

  it('ticket should be set in InUse state only by the ticket holder', async function () {
    await this.contract.newTicket(holderAddress, appId, appKey, validInMinutes, { from: ownerAddress });
    await this.contract.setTicketInUse(0, { from: holderAddress });
    const ticketValid = await this.contract.isTicketInUse(0);
    ticketValid.should.equal(true);
  });

  it('getting first ticket should pass when having one', async function () {
    await this.contract.newTicket(holderAddress, appId, appKey, validInMinutes, { from: ownerAddress });
    await this.contract.getTicket(0).should.not.be.rejectedWith(EVMThrow);
  });

  it('setting non existing ticket should revert - higher bound', async function () {
    await this.contract.setTicketInUse(0, { from: holderAddress }).should.be.rejectedWith(EVMThrow);
  });

  it('should accept payments', async function () {
    await web3.eth.sendTransaction({ from: ownerAddress, to: this.contract.address, value: amount });
    const balance = web3.eth.getBalance(this.contract.address);
    balance.should.be.bignumber.equal(amount);
  });

  it('adding a ticket should be counted', async function () {
    const ticketsPerUserInitial = await this.contract.getTicketsPerUserNumber(holderAddress);
    ticketsPerUserInitial.should.be.bignumber.equal(0);
    await this.contract.newTicket(holderAddress, appId, appKey, validInMinutes, { from: ownerAddress });
    const ticketsPerUser = await this.contract.getTicketsPerUserNumber(holderAddress);
    ticketsPerUser.should.be.bignumber.equal(1);
    const isTicketValid = await this.contract.isTicketValid(holderAddress, 0);
    isTicketValid.should.equal(true);
  });

  it('initial amount of tickets is zero', async function () {
    const ticketsPerUserInitial = await this.contract.getTicketsPerUserNumber(ownerAddress);
    ticketsPerUserInitial.should.be.bignumber.equal(0);
  });

  it('ticket should be invalidated after enough time passes', async function () {
    await this.contract.newTicket(holderAddress, appId, appKey, validInMinutes, { from: ownerAddress });
    const ticketValid = await this.contract.isTicketValid(holderAddress, 0);
    ticketValid.should.equal(true);

    await this.contract.setTicketInUsePerUser(holderAddress, 0, { from: holderAddress });

    increaseTime(validInMinutes + 1);
    await this.contract.validateTicket(holderAddress, 0);

    const ticketValidAgain = await this.contract.isTicketValid(holderAddress, 0);
    ticketValidAgain.should.equal(false);
  });

  it('adding a ticket should be counted per user', async function () {
    const ticketsPerUserInitial = await this.contract.getAllTicketsPerUser(holderAddress);
    ticketsPerUserInitial.length.should.be.bignumber.equal(0);
    await this.contract.newTicket(holderAddress, appId, appKey, validInMinutes, { from: ownerAddress });
    const ticketsPerUser = await this.contract.getAllTicketsPerUser(holderAddress);
    ticketsPerUser.length.should.be.bignumber.equal(1);

    await this.contract.newTicket(other, appId, appKey, validInMinutes, { from: ownerAddress });
    const ticketsPerUserAfterAddingAnotherUsersTicket = await this.contract.getAllTicketsPerUser(holderAddress);
    ticketsPerUserAfterAddingAnotherUsersTicket.length.should.be.bignumber.equal(1,
      'Number of tickets for this user shoudl not change');
  });
});
