import { ethers } from 'ethers'
import { task } from 'hardhat/config'
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from 'unique-names-generator'

import { ERC3000DefaultConfig } from 'erc3k/utils/ERC3000'

function buildName(name: string | null): string {
  const uniqueName =
    name ??
    uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      length: 2,
      separator: '-',
    })

  return process.env.CD ? `github-${uniqueName}` : uniqueName
}

const format = (address: string, name: string, network: string): string =>
  `- ${name}: https://${
    network === 'mainnet' ? '' : `${network}.`
  }etherscan.io/address/${address}`

task('deploy-govern', 'Deploys a Govern instance')
  .addOptionalParam('registry', 'GovernRegistry address')
  .addOptionalParam('factory', 'GovernBaseFactory address')
  .addOptionalParam('useProxies', 'Whether to deploy govern with proxies')
  .addOptionalParam('name', 'DAO name (must be unique at GovernRegistry level)')
  .setAction(
    async (
      {
        registry,
        factory,
        useProxies = false,
        name,
        token = `0x${'00'.repeat(20)}`,
        tokenName = name,
        tokenSymbol = 'GOV',
      },
      HRE
    ) => {
      name = buildName(name)
      const { ethers, deployments, network } = HRE

      const registryContract = registry
        ? await ethers.getContractAt('GovernRegistry', registry)
        : await ethers.getContractAt(
            'GovernRegistry',
            (await deployments.get('GovernRegistry')).address
          )

      const baseFactoryContract = factory
        ? await ethers.getContractAt('GovernBaseFactory', factory)
        : await ethers.getContractAt(
            'GovernBaseFactory',
            (await deployments.get('GovernBaseFactory')).address
          )

        const tokenData = {
            tokenAddress: '0x6e7c3BC98bee14302AA2A98B4c5C86b13eB4b6Cd',
            tokenName: tokenName,
            tokenSymbol: tokenSymbol,
            tokenDecimals: 18,
            mintAddress: '0xdf456B614fE9FF1C7c0B380330Da29C96d40FB02',
            mintAmount: 1000,
            merkleRoot: '0x'+'00'.repeat(32),
            merkleMintAmount:0,
            merkleTree: '0x',
            merkleContext: '0x'
        };

      const tx = await baseFactoryContract.newGovern(
        tokenData,
        [],
        useProxies,
        {...ERC3000DefaultConfig,
            resolver: '0x949f75Ab8362B4e53967742dC93CC289eFb43f6D',
            executionDelay: 60
        },
        name,
        {
          gasLimit: useProxies ? 2e6 : 12e6,
          gasPrice: 2e9,
        }
      )

      const { logs } = (await tx.wait()) as ethers.ContractReceipt

      const args = logs
        .filter(({ address }) => address === registryContract.address)
        .map((log) => registryContract.interface.parseLog(log))
        .find(({ name }) => name === 'Registered')

      const queueAddress = args?.args[1] as string
      const governAddress = args?.args[0] as string

      if (network.name !== 'hardhat' && network.name !== 'coverage') {
        console.log(`----\nA wild new Govern named *${name}* appeared 🦅`)
        console.log(format(queueAddress, 'Queue', network.name))
        console.log(format(governAddress, 'Govern', network.name))
      }
    }
  )
