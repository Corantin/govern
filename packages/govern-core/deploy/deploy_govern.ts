const func = async function ({ deployments, run }) {
  console.log('Deploying Govern...')
  const { deploy } = deployments
  const governQueue = await deployments.get('GovernQueue')
  const constructorArguments = [
    governQueue.address, // _initialExecutor
  ]
  const deployResult = await deploy('Govern', {
    from: '0x91B0d67D3F47A30FBEeB159E67209Ad6cb2cE22E',
    args: constructorArguments,
    log: true,
  })

  await run('verify:verify', {
    address: deployResult.address,
    constructorArguments,
  }).then(console.log, console.error)
}
func.tags = ['Govern']
func.dependencies = ['GovernQueue']

export default func
