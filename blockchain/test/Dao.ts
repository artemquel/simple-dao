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
  let addr2: SignerWithAddress;
  let addr3: SignerWithAddress;

  beforeEach(async () => {
    const DaoToken = await ethers.getContractFactory("DaoToken");
    daoToken = await DaoToken.deploy();
    await daoToken.deployed();

    const Dao = await ethers.getContractFactory("Dao");
    dao = await Dao.deploy(daoToken.address);
    await dao.deployed();

    [deployer, addr1, addr2, addr3] = await ethers.getSigners();
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

  describe("Proposal voting", () => {
    beforeEach(async () => {
      await Promise.all([
        daoToken.transfer(addr1.address, 1).then((receipt) => receipt.wait()),
        daoToken.transfer(addr2.address, 1).then((receipt) => receipt.wait()),
        dao
          .createProposal("Test", Math.round(Date.now() / 1000) + 30)
          .then((receipt) => receipt.wait()),
      ]);
    });

    it("Non-existent identifier", async () => {
      expect(dao.connect(addr1).vote(1337, true)).to.revertedWith(
        "This proposal doesn't exits"
      );
    });

    it("Address that not member of dao", async () => {
      expect(dao.connect(addr3).vote(1, true)).to.revertedWith(
        "Only DAO's member can do this"
      );
    });

    it("Trying to vote twice", async () => {
      const receipt = await dao.connect(addr1).vote(1, true);
      await receipt.wait();

      expect(dao.connect(addr1).vote(1, true)).to.revertedWith(
        "You already voted this proposal"
      );
    });

    it("Normal vote from 2 addresses", async () => {
      expect(dao.connect(addr1).vote(1, true))
        .to.emit(dao, "NewVote")
        .withArgs(1, 0, addr1.address, 1, true, 1);

      expect(dao.connect(addr2).vote(1, false))
        .to.emit(dao, "NewVote")
        .withArgs(1, 1, addr2.address, 1, false, 2);
    });

    it("Vote after deadline passed", (done) => {
      setInterval(() => {
        expect(dao.connect(addr1).vote(1, true)).to.revertedWith(
          "The deadline has passed for this proposal"
        );
        done();
      }, 5000);
    });
  });
});
