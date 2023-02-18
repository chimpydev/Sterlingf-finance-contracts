import { task } from "hardhat/config";

import arbconfig from "./constants/arbConfig";
import SterlingABI from "../../artifacts/contracts/Sterling.sol/Sterling.json";
import GaugeFactoryABI from "../../artifacts/contracts/factories/GaugeFactory.sol/GaugeFactory.json";
import BribeFactoryABI from "../../artifacts/contracts/factories/BribeFactory.sol/BribeFactory.json";
import PairFactoryABI from "../../artifacts/contracts/factories/PairFactory.sol/PairFactory.json";
import RouterABI from "../../artifacts/contracts/Router.sol/Router.json";
import SterlingLibraryABI from "../../artifacts/contracts/SterlingLibrary.sol/SterlingLibrary.json";
import VeArtProxyABI from "../../artifacts/contracts/VeArtProxy.sol/VeArtProxy.json";
import VotingEscrowABI from "../../artifacts/contracts/VotingEscrow.sol/VotingEscrow.json";

task("deploy:arb", "Deploys Arbitrum contracts").setAction(async function (
  taskArguments,
  { ethers }
) {
  const mainnet = false;

  const ARB_CONFIG = mainnet ? arbconfig : arbconfig;
  // const FTM_CONFIG = mainnet ? fantomConfig : testFantomConfig;

  // Load
  const [
    Sterling,
    GaugeFactory,
    BribeFactory,
    PairFactory,
    Router,
    Library,
    VeArtProxy,
    VotingEscrow,
    // RewardsDistributor,
    Voter,
    Minter,
    // SterlingGovernor,
  ] = await Promise.all([
    ethers.getContractFactory("Sterling"),
    ethers.getContractFactory("GaugeFactory"),
    ethers.getContractFactory("BribeFactory"),
    ethers.getContractFactory("PairFactory"),
    ethers.getContractFactory("Router"),
    ethers.getContractFactory("SterlingLibrary"),
    ethers.getContractFactory("VeArtProxy"),
    ethers.getContractFactory("VotingEscrow"),
    // ethers.getContractFactory("RewardsDistributor"),
    ethers.getContractFactory("Voter"),
    ethers.getContractFactory("Minter"),
    // ethers.getContractFactory("SterlingGovernor"),
  ]);

  const hre = require('hardhat');

  const getContractAt = async (address: string, _abi: any) => {
    const [deployer] = await ethers.getSigners();
      const abi = _abi;
      const contract = new ethers.Contract(address, abi, deployer);
      return contract;
  };

  const sterlingLibrary = await Library.deploy(
    "0xF10C960e5A35C11aA28575B3aC4FEd7a89dD03fF"
  );
  await sterlingLibrary.deployed();
  console.log("Library deployed to: ", sterlingLibrary.address);
  console.log("Args: ", 
    "0xF10C960e5A35C11aA28575B3aC4FEd7a89dD03fF",
    "\n"
  );

    console.log(`\n==================================================`);
  console.log(`Waiting ${15000 / 1000} sec before verification`);
  await new Promise((resolve) => setTimeout(resolve, 15000));

  try {
    // Verify contract
    await hre.run('verify:verify', {
        address: sterlingLibrary.address,
        contract: `contracts/SterlingLibrary.sol:SterlingLibrary`,
        constructorArguments: ["0xF10C960e5A35C11aA28575B3aC4FEd7a89dD03fF"],
        network: 42161,
        apiKey: {
            opera: process.env.ARB_SCAN_API_KEY,
        },
    });    
  } catch (error) {
    console.log(error)  
  }

  console.log("Arbitrum contracts deployed");
});
