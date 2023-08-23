import { HardhatUserConfig, task } from 'hardhat/config'
import { config as dotenvConfig } from 'dotenv'
import glob from 'glob'

import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import 'hardhat-deploy'
import 'hardhat-abi-exporter'
import 'hardhat-typechain'
import 'solidity-coverage'

dotenvConfig({
  path: glob.sync('./*.env')[0],
})

const accounts = [process.env.PRIVATE_KEY]
console.log(accounts)

const config = {
  solidity: {
    version: '0.4.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000,
      },
    },
  },
  etherscan: {
    apiKey: {
      gnosis: process.env.GNOSISSCAN_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: 'gnosis',
        chainId: 100,
        urls: {
          // Gnosisscan
          apiURL: 'https://api.gnosisscan.io/api',
          browserURL: 'https://gnosisscan.io/',
          // Blockscout
          //apiURL: "https://blockscout.com/xdai/mainnet/api",
          //browserURL: "https://blockscout.com/xdai/mainnet",
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
      100: process.env.DEPLOYER_ADDRESS,
      goerli: process.env.DEPLOYER_ADDRESS,
    },
  },
  networks: {
    goerli: {
      chainId: 5,
      url:
        'https://eth-goerli.g.alchemy.com/v2/E6EdrejZ7PPswowaPl3AfLkdFGEXm1PJ',
      accounts,
    },
    gnosis: {
      url: 'https://rpc.gnosischain.com',
      chainId: 100,
      accounts,
    },
  },
}

task('deployHoneyTest', 'Deploy Hooney Test').setAction(
  async (args, { deployments, ethers, getNamedAccounts, network, run }) => {
    const deployer = '0x91B0d67D3F47A30FBEeB159E67209Ad6cb2cE22E'
    const owner = '0x7375Ed576952BD6CeD060EeE2Db763130eA13bA0'
    const constructorArguments = [
      '0x8E0CdcF47a394d511AA3b25c14e99eFa8dA68845',
      '0x0000000000000000000000000000000000000000',
      0,
      'HoneyTest',
      18,
      'HNYT',
      true,
    ]
    const result = await deployments.deploy('MiniMeToken', {
      from: deployer,
      args: constructorArguments,
      gasLimit: 10000000,
    })
    console.log('Deployed HoneyTest (' + network.name + '):', result.address)
    const contract = await ethers.getContractAt(result.abi, result.address)
    // await contract.changeController(owner, { from: deployer, gasLimit: 500000 })
    console.log('Ownership transfered to: ', owner)

    try {
      console.log('Verifying HoneyTest...')
      await new Promise((res, rej) => {
        setTimeout(
          () =>
            run('verify:verify', {
              address: result.address,
              constructorArguments,
            })
              .then(res)
              .catch(rej),
          2000
        ) // Wait for contract to be deployed
      })
    } catch (error) {
      console.error('Failed when verifying HoneyTest contract', error)
    }
  }
)

export default config
