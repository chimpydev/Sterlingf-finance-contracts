// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import {ethers} from 'hardhat';
import 'dotenv/config';

const hre = require('hardhat');
let contractArgsMap = new Map<string, any[]>([
  ['Sterling', []],
  ['GaugeFactory', []],
  ['BribeFactory', []],
  ['PairFactory', []],
  ['Router', ["0x0d1C850D8109EAEF39cA310610555175A6A58E45", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"]],
  ['SterlingLibrary', ["0xb6AB4c92Db829e6ee46350cd36bad8FbB4Fe48c5"]],
  ['VeArtProxy', []],
  ['VotingEscrow', ["0x356167aaf46C80Fe8E1817785d3EE943E08c644b", "0xfaC8091b5491738098b84C30968385EDab3f50c8"]],
  ['Voter', ["0x21563764F5641ffCb89f25560644e39947B21bE0", "0x0d1C850D8109EAEF39cA310610555175A6A58E45", "0x302F20EE3e825590a928CB243608A2f848336BcB", "0x8c03AE02f0a5EA3f75D7604eaeFa2Dd074AE8947"]],
  ['Minter', ["0x0849267e99F3A297c301f79477468d0524f6be20", "0x21563764F5641ffCb89f25560644e39947B21bE0"]]
]);

const contractNames = [
  'Sterling',
  'GaugeFactory',
  'BribeFactory',
  'PairFactory',
  'Router',
  'SterlingLibrary',
  'VeArtProxy',
  'VotingEscrow',
  'Voter',
  'Minter'
]

const contractAddys = [
  '0x356167aaf46C80Fe8E1817785d3EE943E08c644b',
  '0x302F20EE3e825590a928CB243608A2f848336BcB',
  '0x8c03AE02f0a5EA3f75D7604eaeFa2Dd074AE8947',
  '0x0d1C850D8109EAEF39cA310610555175A6A58E45',
  '0xb6AB4c92Db829e6ee46350cd36bad8FbB4Fe48c5',
  '0x06E789aD3f70269819a1D9B8c7eD0BD7b4E2e607',
  '0xfaC8091b5491738098b84C30968385EDab3f50c8',
  '0x21563764F5641ffCb89f25560644e39947B21bE0',
  '0x0849267e99F3A297c301f79477468d0524f6be20',
  '0x9EDEA5b1E099aB93DC3e98dF63DC1B31fb3FEf05'
]

async function main() {
// Get deployer account
const [deployer] = await ethers.getSigners();
console.log(`Deploying contracts with the account: ${deployer.address}`);
const balance = await deployer.getBalance();
console.log(`Account balance: ${balance.toString()}`);

// Set deploy network
let deployNetwork: string = 'fantom';
let deployedContractArgs: any;
let allDeployedContracts: any[] = []
let i = 0
for (const contractName of contractNames) {
    // Get contract args
    deployedContractArgs = contractArgsMap.get(contractName);

    try {
        // Verify contract
        await hre.run('verify:verify', {
            address: contractAddys[Number(i)],
            // contract: `contracts/reward/TokenDistributors.sol:${contractName}`,
            constructorArguments: [...deployedContractArgs],
            network: deployNetwork,
            apiKey: {
                opera: process.env.ETHERSCAN_API_KEY,
            },
        });    
    } catch (error) {
      console.log(error)  
    }

    i++;
    
}

console.log("ALL CONTRACTS:", allDeployedContracts.toString(), allDeployedContracts)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

export {deployedContractArgs};
