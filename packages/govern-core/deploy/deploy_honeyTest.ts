import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function ({
  deployments,
  ethers,
  network,
  run,
}: HardhatRuntimeEnvironment) {
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

func.tags = ['MiniMeToken']

export default func
