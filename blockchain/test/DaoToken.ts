import { DaoToken } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("DaoToken", () => {
  let daoToken: DaoToken;
  let deployer: SignerWithAddress;

  beforeEach(async () => {
    const DaoToken = await ethers.getContractFactory("DaoToken");
    daoToken = await DaoToken.deploy();
    await daoToken.deployed();

    [deployer] = await ethers.getSigners();
  });

  it("Test total supply", async () => {
    expect(await daoToken.totalSupply()).to.equal(10000, "Should return 10000");
  });

  it("Test deployer balance", async () => {
    const totalSupply = await daoToken.totalSupply();
    expect(await daoToken.balanceOf(deployer.address)).to.equal(
      totalSupply,
      "Balance of deployer should be equal total supply"
    );
  });
});
