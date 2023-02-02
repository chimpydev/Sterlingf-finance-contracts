import { task } from "hardhat/config";

import arbconfig from "./constants/arbConfig";
import axios from "axios";
import { ethers } from "hardhat";
// import { getContractAt } from "./arbVerifyContracts";

const ftmscanApi = axios.create({
  baseURL: 'https://api.arbiscan.io/api',
});

const getContractAbi = async (contractAddress: string) => {
  try {
    const response = await ftmscanApi.get('/', {
      params: {
        module: 'contract',
        action: 'getabi',
        address: contractAddress,
        apikey: process.env.ARB_SCAN_API_KEY
      }
    });
    return response.data.result;
  } catch (error) {
    console.error(error);
  }
};


task("deploy:arbInt", "Interact Arbitrum contracts").setAction(async function (
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

  const getContractAt = async (address: string) => {
    const [deployer] = await ethers.getSigners();
      const abi = await getContractAbi(address);
      const contract = new ethers.Contract(address, abi, deployer);
      return contract;
  };

  const minter = await getContractAt("0x9EDEA5b1E099aB93DC3e98dF63DC1B31fb3FEf05")

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
