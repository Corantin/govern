import {ethers, BigNumber} from 'ethers'
import {task} from 'hardhat/config'

import {ERC3000DefaultConfig} from 'erc3k/utils/ERC3000'

const getContainer = async (governAddress: any, questAddress: any, execTime: any, tokenAddress: any) => {

  const EXECUTION_DELAY = 300

  const ERC3000Config = {
    ...ERC3000DefaultConfig,
    resolver: '0x02FCedD2aA71C343E024f1FbDBE69Ff65Bd1858b', // Celeste
    executionDelay: EXECUTION_DELAY,
    scheduleDeposit: {
      token: tokenAddress,
      amount: BigNumber.from("100000000000000000"),
    },
    challengeDeposit: {
      token: tokenAddress,
      amount: BigNumber.from("100000000000000000"),
    },
  }

  const currentBlock = await ethers.getDefaultProvider().getBlock("latest")
  const executionTime = execTime ? execTime : currentBlock.timestamp + EXECUTION_DELAY + 60 // A bit more than the execution delay

  const questInterface = new ethers.utils.Interface([
    "function claim(bytes evidence, address player, uint256 amount)"])
  const claimCall = questInterface.encodeFunctionData("claim", ["0x00", "0xdf456B614fE9FF1C7c0B380330Da29C96d40FB02", 0])

  return {
    config: ERC3000Config,
    payload: {
      nonce: 2,
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
  .addOptionalParam('token', 'Token address')
  .setAction(
    async ({queue, govern, quest, token}, HRE) => {
      const {ethers} = HRE

      const governQueue = await ethers.getContractAt('GovernQueue', queue)
      const collateralToken = await ethers.getContractAt('IERC20', token)
      const container = await getContainer(govern, quest, undefined, token)

      console.log(`Scheduling container...`)

      const approveTx = await collateralToken.approve(queue, container.config.scheduleDeposit.amount)
      await approveTx.wait()
      console.log("Approval made, scheduling...")

      const tx = await governQueue.schedule(container, {gasLimit: 15e6, gasPrice: 2e9})
      const {logs} = (await tx.wait()) as ethers.ContractReceipt
      console.log(`Container scheduled, execution time ${container.payload.executionTime}`)
    }
  )

// Remember to use the execution time from the previous as the exectime param below
task('execute', 'Execute an operation')
  .addOptionalParam('queue', 'GovernQueue address')
  .addOptionalParam('govern', 'Govern address')
  .addOptionalParam('quest', 'Quest address')
  .addOptionalParam('token', 'Token address')
  .addOptionalParam('exectime', 'Execution time')
  .setAction(
    async ({queue, govern, quest, exectime, token}, HRE) => {
      const {ethers} = HRE

      const governQueue = await ethers.getContractAt('GovernQueue', queue)
      const container = await getContainer(govern, quest, exectime, token)

      console.log(`Executing container...`)
      const tx = await governQueue.execute(container, {gasLimit: 12e6, gasPrice: 2e9})
      const {logs} = (await tx.wait()) as ethers.ContractReceipt
      console.log(`Container executed`)
    }
  )
