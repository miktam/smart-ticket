const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();
const EVMThrow = require('../helpers/EVMThrow.js');

const Ticket = artifacts.require('Ticket');

contract('Ticket', function ([ownerAddress, holderAddress, other]) {
  const validInMinutes = 60;

  beforeEach(async function () {
    this.contract = await Ticket.new(holderAddress, validInMinutes);
  });

  it('initial state should be granted', async function () {
    const isGranted = await this.contract.isGranted();
    isGranted.should.equal(true);
  });

  it('setting to InUse state by not the holder should throw', async function () {
    await this.contract.setInUse({ from: ownerAddress }).should.be.rejectedWith(EVMThrow);
  });

  it('only holder should be able to set ticket in use', async function () {
    await this.contract.setInUse({ from: holderAddress });
    const isInUse = await this.contract.isInUse();
    isInUse.should.equal(true);
  });
});
