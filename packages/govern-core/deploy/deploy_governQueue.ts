import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function ({
  deployments,
  run,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments
  const constructorArguments = [
    '0x7375Ed576952BD6CeD060EeE2Db763130eA13bA0', // _aclRoot
    [
      300,
      ['0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60', '10000000000000000'],
      ['0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60', '10000000000000000'],
      '0x6b81e57848A75369cC5F13ED98c62412a40F19E7',
      '0x0000000000000000000000000000000000000000',
      100000,
    ], // _initialConfig
  ]
  const deployResult = await deploy('GovernQueue', {
    from: '0x91B0d67D3F47A30FBEeB159E67209Ad6cb2cE22E',
    args: constructorArguments,
    log: true,
  })

  await run('verify:verify', {
    address: deployResult.address,
    constructorArguments,
  }).then(console.log, console.error)
}
func.tags = ['GovernQueue']

export default func
