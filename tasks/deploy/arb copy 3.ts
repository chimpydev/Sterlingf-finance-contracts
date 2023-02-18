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

  const sterling = await getContractAt("0xfA157458912D54492df38448c613375C772F2b08", SterlingABI.abi);

  const gaugeFactory = await getContractAt("0xa548F738Bc67080F1722DCED74003D74d75fB80b", GaugeFactoryABI.abi);

  const bribeFactory = await getContractAt("0x1eaC9A7be65c2dA2EBA57353db08f3298E01079A", BribeFactoryABI.abi);

  const pairFactory = await getContractAt("0xEa3Ae0305b4E3ed7BF9E762Ba2C5e35aD6E1acFc", PairFactoryABI.abi);

  const router = await getContractAt("0x0B4B7C9a795047a0631459f08bC7133b23612a9E", RouterABI.abi);

  const library = await getContractAt("0xf0a3eBdea872a195AE81519BccEB3226A6eb32bc", SterlingLibraryABI.abi);

  const artProxy = await getContractAt("0xE971BFBeFB4FfF23B31D0A4D5a10F9F4F55B40eD", VeArtProxyABI.abi);
  const escrow = await getContractAt("0xE0FDf6770Ed596327e5E34eE94a6815B04C55024", VotingEscrowABI.abi);

  let timeFrame = 15000
    console.log(`\n==================================================`);
  console.log(`Waiting ${timeFrame / 1000} sec before verification`);
  await new Promise((resolve) => setTimeout(resolve, timeFrame));

  try {
    // Verify contract
    await hre.run('verify:verify', {
        address: escrow.address,
        contract: `contracts/VotingEscrow.sol:VotingEscrow`,
        constructorArguments: [sterling.address, artProxy.address],
        network: 42161,
        apiKey: {
            opera: process.env.ARB_SCAN_API_KEY,
        },
    });    
  } catch (error) {
    console.log(error)  
  }

  // const distributor = await RewardsDistributor.deploy(escrow.address);
  // await distributor.deployed();
  // console.log("RewardsDistributor deployed to: ", distributor.address);
  // console.log("Args: ", escrow.address, "\n");

  const voter = await Voter.deploy(
    escrow.address,
    pairFactory.address,
    gaugeFactory.address,
    bribeFactory.address
  );
  await voter.deployed();
  console.log("Voter deployed to: ", voter.address);
  console.log("Args: ", 
    escrow.address,
    pairFactory.address,
    gaugeFactory.address,
    bribeFactory.address,
    "\n"
  );

    console.log(`\n==================================================`);
  console.log(`Waiting ${timeFrame / 1000} sec before verification`);
  await new Promise((resolve) => setTimeout(resolve, timeFrame));

  try {
    // Verify contract
    await hre.run('verify:verify', {
        address: voter.address,
        contract: `contracts/Voter.sol:Voter`,
        constructorArguments: [escrow.address,
          pairFactory.address,
          gaugeFactory.address,
          bribeFactory.address],
        network: 42161,
        apiKey: {
            opera: process.env.ARB_SCAN_API_KEY,
        },
    });    
  } catch (error) {
    console.log(error)  
  }

  const minter = await Minter.deploy(
    voter.address,
    escrow.address,
    // distributor.address
  );
  await minter.deployed();
  console.log("Minter deployed to: ", minter.address);
  console.log("Args: ", 
    voter.address,
    escrow.address,
    // distributor.address,
    "\n"
  );

    console.log(`\n==================================================`);
  console.log(`Waiting ${timeFrame / 1000} sec before verification`);
  await new Promise((resolve) => setTimeout(resolve, timeFrame));

  try {
    // Verify contract
    await hre.run('verify:verify', {
        address: minter.address,
        contract: `contracts/Minter.sol:Minter`,
        constructorArguments: [voter.address,
          escrow.address],
        network: 42161,
        apiKey: {
            opera: process.env.ARB_SCAN_API_KEY,
        },
    });    
  } catch (error) {
    console.log(error)  
  }

  // const governor = await SterlingGovernor.deploy(escrow.address);
  // await governor.deployed();
  // console.log("SterlingGovernor deployed to: ", governor.address);
  // console.log("Args: ", escrow.address, "\n");

  // Initialize
  await sterling.initialMint(ARB_CONFIG.teamEOA);
  console.log("Initial minted");

  await sterling.setMinter(minter.address);
  console.log("Minter set");

  await pairFactory.setPauser(ARB_CONFIG.teamMultisig);
  console.log("Pauser set");

  await escrow.setVoter(voter.address);
  console.log("Voter set");

    // Initial veSTERLING distro
    await escrow.setMinterContract(
      minter.address
    );
  await escrow.setTeam(ARB_CONFIG.teamMultisig);
  console.log("Team set & Minter Contract set for escrow");

  await voter.setGovernor(ARB_CONFIG.teamMultisig);
  console.log("Governor set");

  await voter.setEmergencyCouncil(ARB_CONFIG.teamMultisig);
  console.log("Emergency Council set");

  // await distributor.setDepositor(minter.address);
  // console.log("Depositor set");

  // await governor.setTeam(ARB_CONFIG.teamMultisig)
  // console.log("Team set for governor");

  // Whitelist
  const nativeToken = [sterling.address];
  const tokenWhitelist = nativeToken.concat(ARB_CONFIG.tokenWhitelist);
  await voter.initialize(tokenWhitelist, minter.address);
  console.log("Whitelist set");

  console.log("MINTER CONTRACT ON ESCROW", await escrow.team())
  console.log("MINTER CONTRACT ON ESCROW", await escrow.minterContract())

  // Initial veSTERLING distro
  await minter.initialize(
    ARB_CONFIG.partnerAddrs,
    ARB_CONFIG.partnerAmts,
    ARB_CONFIG.partnerMax
  );
  console.log("veSTERLING distributed");

  await minter.setTeam(ARB_CONFIG.teamMultisig)
  console.log("Team set for minter");

  console.log("Arbitrum contracts deployed");
});
