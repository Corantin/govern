const func = async function ({ artifacts, run }) {
  console.log('Deploying GovernQueue...')
  const { deploy } = artifacts
  const constructorArguments = [
    '0x7375Ed576952BD6CeD060EeE2Db763130eA13bA0', // _aclRoot
    [
      300, // _executionDelay
      ['0x2d467a24095B262787f58ce97d9B130ce7232B57', '10000000000000000'], // scheduleDeposit
      ['0x2d467a24095B262787f58ce97d9B130ce7232B57', '10000000000000000'], // challengeDeposit
      '0x6b81e57848A75369cC5F13ED98c62412a40F19E7', // resolver
      '0x516D6657707071433535586337505534387665693258765641754837367A32724E4646374A4D55686A564D357856', // rules
      100000, // maxCalldataSize
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
