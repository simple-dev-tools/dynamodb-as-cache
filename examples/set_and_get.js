const { DCacheClient } = require('../index')
const { promisify } = require('util')

const sleep = promisify(setTimeout)

async function main() {
  try {
    const client = new DCacheClient({
      region: process.env.AWS_REGION,
      tableName: process.env.TABLE_NAME
    })

    await client.set('foo', { message: 'hello foo' }, 1)
    await client.set('bar', { message: 'hello bar' }, 10)
    await sleep(3000)
    const v1 = await client.get('foo')
    const v2 = await client.get('bar')

    v1? console.log('v1: cache hit =>', v1) : console.log('v1: cache miss')
    v2? console.log('v2: cache hit =>', v2) : console.log('v2: cache miss')

    const _v3 = await client.getset('foo', { message: 'hello foo again' }, 1)
    const _v4 = await client.getset('bar', { message: 'hello bar again' }, 10)
    const v3 = await client.get('foo')
    const v4 = await client.get('bar')
    console.log(`v3: old = ${_v3}  new= ${v3}`)    
    console.log(`v4: old = ${_v4}  new= ${v4}`)    

  } catch (e) {
    console.error('something went wrong', e)
  }
}

main().catch(console.error)
