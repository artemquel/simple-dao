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
        .withArgs(1, "Test description", deployer.address, 10);
    });

    it("With address that isn't token holder", async () => {
      expect(
        dao.connect(addr1).createProposal("Test description", 10),
        "Should revert with correct reason"
      ).to.revertedWith("Only DAO's member can do this");
    });

    it("With address that was given the tokens", async () => {
      await daoToken
        .transfer(addr1.address, 10)
        .then((receipt) => receipt.wait());

      expect(
        dao.connect(addr1).createProposal("Test description", 10),
        "Should create proposal"
      )
        .to.emit(dao, "ProposalCreated")
        .withArgs(1, "Test description", addr1.address, 10);
    });
  });

  describe("Proposal voting", () => {
    beforeEach(async () => {
      await Promise.all([
        daoToken.transfer(addr1.address, 1).then((receipt) => receipt.wait()),
        daoToken.transfer(addr2.address, 1).then((receipt) => receipt.wait()),
      ]);
      await dao
        .createProposal("Test", Math.round(Date.now() / 1000) + 30)
        .then((receipt) => receipt.wait());
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
      await dao
        .connect(addr1)
        .vote(1, true)
        .then((receipt) => receipt.wait());

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

    it("Vote after deadline passed", async () => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 10000));
      expect(dao.connect(addr1).vote(1, true)).to.revertedWith(
        "The deadline has passed for this proposal"
      );
    });
  });

  describe("Close proposal", () => {
    it("Non-existent identifier", async () => {
      expect(dao.countVotes(1337)).to.revertedWith(
        "This proposal doesn't exits"
      );
    });

    it("Close before deadline", async () => {
      await dao
        .createProposal("Test", Math.round(Date.now() / 1000) + 300)
        .then((receipt) => receipt.wait());

      expect(dao.countVotes(1)).to.revertedWith(
        "The deadline hasn't passed yet"
      );
    });

    it("Trying to close twice", async () => {
      await dao
        .createProposal("Test", Math.round(Date.now() / 1000) + 1)
        .then((receipt) => receipt.wait());

      await dao.countVotes(1).then((receipt) => receipt.wait());

      expect(dao.countVotes(1)).to.revertedWith(
        "Proposal count already conducted"
      );
    });

    it("Close proposal with success", async () => {
      await Promise.all([
        daoToken.transfer(addr1.address, 10).then((receipt) => receipt.wait()),
        daoToken.transfer(addr2.address, 1).then((receipt) => receipt.wait()),
        daoToken.transfer(addr3.address, 15).then((receipt) => receipt.wait()),
      ]);

      await dao
        .createProposal("Test", Math.round(Date.now() / 1000) + 60)
        .then((receipt) => receipt.wait());

      await Promise.all([
        dao
          .connect(addr1)
          .vote(1, true)
          .then((receipt) => receipt.wait()),
        dao
          .connect(addr2)
          .vote(1, true)
          .then((receipt) => receipt.wait()),
        dao
          .connect(addr3)
          .vote(1, false)
          .then((receipt) => receipt.wait()),
      ]);

      await new Promise<void>((resolve) => setTimeout(() => resolve(), 10000));

      expect(dao.countVotes(1))
        .to.emit(dao, "ProposalClosed")
        .withArgs(1, true, 26);
    });
  });
});
