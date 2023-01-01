import { HardhatUserConfig } from 'hardhat/config'

import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import 'hardhat-deploy'
import 'hardhat-abi-exporter'
import 'hardhat-typechain'
import 'solidity-coverage'

const accounts = [process.env.PRIVATE_KEY!]

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.4.24',
        settings: {
          optimizer: {
            enabled: true,
            runs: 2000,
          },
        },
      },
      {
        version: '0.6.8',
        settings: {
          optimizer: {
            enabled: true,
            runs: 2000,
          },
        },
      },
    ],
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY,
  },
  networks: {
    goerli: {
      chainId: 5,
      url: 'https://goerli.infura.io/v3/' + process.env.INFURA_KEY,
      accounts,
    },
    gnosis: {
      chainId: 100,
      url: 'https://rpc.gnosischain.com',
      accounts,
    },
  },
}

export default config
