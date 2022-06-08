import { ethers } from "hardhat";

async function main() {
  const DaoToken = await ethers.getContractFactory("DaoToken");
  const daoToken = await DaoToken.deploy();

  await daoToken.deployed();

  const Dao = await ethers.getContractFactory("Dao");
  const dao = await Dao.deploy(daoToken.address);

  await dao.deployed();

  console.log("DaoToken address:",daoToken.address);
  console.log("Dao address:", dao.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
