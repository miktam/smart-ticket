# Pay per use system: smart ticket
[![Build Status](https://travis-ci.org/miktam/smart-ticket.svg?branch=master)](https://travis-ci.org/miktam/smart-ticket)
[![Coverage Status](https://coveralls.io/repos/github/miktam/smart-ticket/badge.svg?branch=master)](https://coveralls.io/github/miktam/smart-ticket?branch=master)

## Smart Contracts

This is a set of [Smart Contracts](https://en.wikipedia.org/wiki/Smart_contract) on Ethereum.
Reason to use is the ability to programatically (mathematically) ensure the outcomes of important interaction, such as:

- grant a token which will expire automatically
- list paymements
- list token usage

## Use Case Scenario
1. User aquires N amount of tokens
2. Each token represents a timespan, token holder address, how it could be used, and if it was used or not (holds AppId, AppKey)
Example: Alice gets 1 token, valid for 1 hour, for Application App. State of token is Granted
3. User starts using an App. Prerequisite: App will check if user has enough tokens to do so (token has to be in Granted/InUse state)
4. All tokens which are InUse will be invalidated based on the time validity (1h token will be invalid after 1h)
5. User, to continue to use an App, should have enough tokens in InUse/Granted state

## Security
Smart contracts are heavily influenced by [OpenZeppelin work](https://openzeppelin.org/api/docs/open-zeppelin.html) which focuses on community standards driven source code in Solidity. 
In addition, transparency of Ethereum Blockchain is adding audiatibility of all the steps.

## License
Code released under the [MIT License](LICENSE)
