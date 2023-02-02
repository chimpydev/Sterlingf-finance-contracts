import { task } from "hardhat/config";

import arbconfig from "./constants/arbConfig";

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

  const sterling = await Sterling.deploy();
  await sterling.deployed();
  console.log("Sterling deployed to: ", sterling.address);

  const gaugeFactory = await GaugeFactory.deploy();
  await gaugeFactory.deployed();
  console.log("GaugeFactory deployed to: ", gaugeFactory.address);

  const bribeFactory = await BribeFactory.deploy();
  await bribeFactory.deployed();
  console.log("BribeFactory deployed to: ", bribeFactory.address);

  const pairFactory = await PairFactory.deploy();
  await pairFactory.deployed();
  console.log("PairFactory deployed to: ", pairFactory.address);

  const router = await Router.deploy(pairFactory.address, ARB_CONFIG.WETH);
  await router.deployed();
  console.log("Router deployed to: ", router.address);
  console.log("Args: ", pairFactory.address, ARB_CONFIG.WETH, "\n");

  const library = await Library.deploy(router.address);
  await library.deployed();
  console.log("SterlingLibrary deployed to: ", library.address);
  console.log("Args: ", router.address, "\n");

  const artProxy = await VeArtProxy.deploy();
  await artProxy.deployed();
  console.log("VeArtProxy deployed to: ", artProxy.address);

  const escrow = await VotingEscrow.deploy(sterling.address, artProxy.address);
  await escrow.deployed();
  console.log("VotingEscrow deployed to: ", escrow.address);
  console.log("Args: ", sterling.address, artProxy.address, "\n");

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
