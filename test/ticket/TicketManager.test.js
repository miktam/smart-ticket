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
    let ticketsIssued = await this.contract.ticketsIssued();
    ticketsIssued.should.be.bignumber.equal(0);
    await this.contract.newTicket(holderAddress, '_appId', '_appKey', validInMinutes, { from: ownerAddress });
    let ticketsIssuedNow = await this.contract.ticketsIssued();
    ticketsIssuedNow.should.be.bignumber.equal(1);
  });

  it('if ticket issued by not authorized person - should throw', async function () {
    await this.contract.newTicket(holderAddress, '_appId', '_appKey', validInMinutes,
      { from: holderAddress }).should.be.rejectedWith(EVMThrow);
  });
});
