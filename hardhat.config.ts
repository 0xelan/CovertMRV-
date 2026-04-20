import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import "@cofhe/hardhat-plugin";
import * as dotenv from "dotenv";
import "./tasks";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  cofhe: {
    logMocks: false,
    gasWarning: false,
  },
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    // localcofhe, eth-sepolia, and arb-sepolia are auto-injected by
    // @cofhe/hardhat-plugin. We override arb-sepolia to use a custom RPC
    // and the deployer private key from the .env file.
    "arb-sepolia": {
      url:
        process.env.ARBITRUM_SEPOLIA_RPC_URL ||
        "https://sepolia-rollup.arbitrum.io/rpc",
      accounts,
      chainId: 421614,
      gasMultiplier: 1.2,
      timeout: 90_000,
    },
  },
  etherscan: {
    apiKey: {
      "arb-sepolia": process.env.ARBISCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "arb-sepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io",
        },
      },
    ],
  },
};

export default config;
