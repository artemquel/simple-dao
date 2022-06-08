import { Dao, DaoToken } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";

chai.use(solidity);

describe("Dao", () => {
  let daoToken: DaoToken;
  let dao: Dao;
  let deployer: SignerWithAddress;
  let addr1: SignerWithAddress;

  beforeEach(async () => {
    const DaoToken = await ethers.getContractFactory("DaoToken");
    daoToken = await DaoToken.deploy();
    await daoToken.deployed();

    const Dao = await ethers.getContractFactory("Dao");
    dao = await Dao.deploy(daoToken.address);
    await dao.deployed();

    [deployer, addr1] = await ethers.getSigners();
  });

  describe("Proposal creation", () => {
    it("With correct params", async () => {
      expect(dao.createProposal("Test description", 10))
        .to.emit(dao, "ProposalCreated")
        .withArgs(1, "Test description", deployer.address);
    });

    it("With address that isn't token holder", async () => {
      expect(
        dao.connect(addr1).createProposal("Test description", 10),
        "Should revert with correct reason"
      ).to.revertedWith("Only DAO's member can do this");
    });

    it("With address that was given the tokens", async () => {
      const receipt = await daoToken.transfer(addr1.address, 10);
      await receipt.wait();

      expect(
        dao.connect(addr1).createProposal("Test description", 10),
        "Should create proposal"
      )
        .to.emit(dao, "ProposalCreated")
        .withArgs(1, "Test description", addr1.address);
    });
  });
});
