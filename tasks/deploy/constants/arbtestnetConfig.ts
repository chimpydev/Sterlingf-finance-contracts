import { ethers } from "ethers";

const TOKEN_DECIMALS = ethers.BigNumber.from("10").pow(
  ethers.BigNumber.from("18")
);
const MILLION = ethers.BigNumber.from("10").pow(ethers.BigNumber.from("6"));

const FOUR_MILLION = ethers.BigNumber.from("4")
  .mul(MILLION)
  .mul(TOKEN_DECIMALS);
const TWENTY_MILLION = ethers.BigNumber.from("20")
  .mul(MILLION)
  .mul(TOKEN_DECIMALS);
const PARTNER_MAX = ethers.BigNumber.from("78")
  .mul(MILLION)
  .mul(TOKEN_DECIMALS);

const TEAM_MULTISIG = "0x156D8FaC8cd3deB51AB194D906abfc81CF323c11"; // Done
const TEAM_EOA = "0x156D8FaC8cd3deB51AB194D906abfc81CF323c11"; // Done

const testArbtestnetArgs = {
  // Chain const
  lzChainId: 421613,
  lzEndpoint: "0x72aB53a133b27Fa428ca7Dc263080807AfEc91b5", // NOT NEEDED

  // Tokens
  WETH: "0xA271f5fb0644Af7959e0ba0f9D22DB167324bB97", // DONE
  USDC: "0xE742da76701dc9BB348EB931959DD42B9DF04Ff6", // DONE

  // Addresses
  teamEOA: TEAM_EOA,
  teamMultisig: TEAM_MULTISIG,
  emergencyCouncil: "0x156D8FaC8cd3deB51AB194D906abfc81CF323c11", // Done

  merkleRoot:
    "",
  tokenWhitelist: [ // For bribes
    "0xE742da76701dc9BB348EB931959DD42B9DF04Ff6", // usdc
  ],
  partnerAddrs: [
    "0x156D8FaC8cd3deB51AB194D906abfc81CF323c11", // Done
    // TEAM_EOA, // TEST
  ],
  partnerAmts: [
    TWENTY_MILLION,
  ],
  partnerMax: PARTNER_MAX,
};

export default testArbtestnetArgs;
