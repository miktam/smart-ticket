const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();
const EVMThrow = require('../helpers/EVMThrow.js');

const TicketManager = artifacts.require('TicketManager');

contract('Ticket', function ([ownerAddress, holderAddress, other]) {
  const validInMinutes = 60;

  beforeEach(async function () {
    this.contract = await TicketManager.new();
  });

  it('ticket should be issued by the owner', async function () {
    const ticketsIssued = await this.contract.ticketsIssued();
    ticketsIssued.should.be.bignumber.equal(0);
    await this.contract.newTicket(holderAddress, '_appId', '_appKey', validInMinutes, { from: ownerAddress });
    const ticketsIssuedNow = await this.contract.ticketsIssued();
    ticketsIssuedNow.should.be.bignumber.equal(1);

    const ticketValid = await this.contract.isTicketValid(0);
    ticketValid.should.equal(true);
  });

  it('if ticket issued by not authorized person - should throw', async function () {
    await this.contract.newTicket(holderAddress, '_appId', '_appKey', validInMinutes,
      { from: holderAddress }).should.be.rejectedWith(EVMThrow);
  });

  it('ticket should be set in InUse state only by the ticket holder', async function () {
    await this.contract.newTicket(holderAddress, '_appId', '_appKey', validInMinutes, { from: ownerAddress });
    await this.contract.setTicketInUse(0, { from: holderAddress });
    const ticketValid = await this.contract.isTicketValid(0);
    ticketValid.should.equal(true);
  });

  it('modifying the state by not holder should be prohibited', async function () {
    await this.contract.newTicket(holderAddress, '_appId', '_appKey', validInMinutes, { from: ownerAddress });
    await this.contract.setTicketInUse(0, { from: ownerAddress }).should.be.rejectedWith(EVMThrow);
  });
});
