# Simple dao
[View screens in Figma](https://www.figma.com/file/6omCdQygGTUzMuVGJy7vrS/Simple-DAO?node-id=0:1)

A simple dApp that simulates the DAO

## Backend
Uses the base ERC-20 token to verify the participation of the address in the DAO

A separate smart contract is used to implement the DAO logic (methods for vote in proposal, create proposal and close proposal)

### Hardhat

Used for tests and simplified work with smart contracts

## Frontend

- React as ui-library
- React context for storing contract events and call contract methods
- Moralis for authorization and ethers.js
- web3uikit for for a simple and cute look
- Typescript
- React router
- React promise tracker for manage action promises fulfilling

### Configuration
`/app/src/config.json` example
```json
{
  "moralisServerUrl":"",
  "moralisAppId":"",
  "daoAddress":""
}
```