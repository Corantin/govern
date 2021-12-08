import {ethers} from 'ethers'
import {task} from 'hardhat/config'

import {ERC3000DefaultConfig} from 'erc3k/utils/ERC3000'

const getContainer = async (governAddress: any, questAddress: any, execTime: any) => {

  const EXECUTION_DELAY = 60

  const ERC3000Config = {
    ...ERC3000DefaultConfig,
    resolver: '0x949f75Ab8362B4e53967742dC93CC289eFb43f6D', // Celeste
    executionDelay: EXECUTION_DELAY
  }

  const currentBlock = await ethers.getDefaultProvider().getBlock("latest")
  const executionTime = execTime ? execTime : currentBlock.timestamp + EXECUTION_DELAY + 60 // A bit more than the execution delay

  const questInterface = new ethers.utils.Interface([
    "function claim(bytes evidence, address player, uint256 amount)"])
  const claimCall = questInterface.encodeFunctionData("claim", ["0x00", "0xdf456B614fE9FF1C7c0B380330Da29C96d40FB02", 0])

  return {
    config: ERC3000Config,
    payload: {
      nonce: 4,
      executionTime,
      submitter: '0xdf456B614fE9FF1C7c0B380330Da29C96d40FB02',
      executor: governAddress, // Govern contract
      actions: [
        {
          to: questAddress,
          value: 0,
          data: claimCall,
        },
      ],
      allowFailuresMap:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      proof: '0x00',
    }
  }
}

task('schedule', 'Schedule an operation')
  .addOptionalParam('queue', 'GovernQueue address')
  .addOptionalParam('govern', 'Govern address')
  .addOptionalParam('quest', 'Quest address')
  .setAction(
    async ({queue, govern, quest}, HRE) => {
      const {ethers} = HRE

      const governQueue = await ethers.getContractAt('GovernQueue', queue)
      const container = await getContainer(govern, quest, undefined)

      console.log(`Scheduling container...`)
      const tx = await governQueue.schedule(container, {gasLimit: 12e6, gasPrice: 2e9})
      const {logs} = (await tx.wait()) as ethers.ContractReceipt
      console.log(`Container scheduled, execution time ${container.payload.executionTime}`)
    }
  )

task('execute', 'Execute an operation')
  .addOptionalParam('queue', 'GovernQueue address')
  .addOptionalParam('govern', 'Govern address')
  .addOptionalParam('quest', 'Quest address')
  .addOptionalParam('exectime', 'Execution time')
  .setAction(
    async ({queue, govern, quest, exectime}, HRE) => {
      const {ethers} = HRE

      const governQueue = await ethers.getContractAt('GovernQueue', queue)
      const container = await getContainer(govern, quest, exectime)

      console.log(`Executing container...`)
      const tx = await governQueue.execute(container, {gasLimit: 12e6, gasPrice: 2e9})
      const {logs} = (await tx.wait()) as ethers.ContractReceipt
      console.log(`Container executed`)
    }
  )
