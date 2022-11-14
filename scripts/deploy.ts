import { ethers } from "hardhat";

async function main() {
  const CyberWorldNft = await ethers.getContractFactory("CyberWorld");
  const contract = await CyberWorldNft.deploy(
    "ipfs://QmXXz75TJznLCswmA6Tu9gQxyqSHV9a2ZyUsQDBPuUzZNc"
  );

  await contract.deployed();

  console.log(contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
