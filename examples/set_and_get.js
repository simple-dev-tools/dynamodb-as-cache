const { DCacheClient } = require('../index');
const { promisify } = require('util');

const sleep = promisify(setTimeout);

async function main() {
  try {
    const client = new DCacheClient({
      region: process.env.AWS_REGION,
      tableName: process.env.TABLE_NAME
    });

    await client.set('foo', 'hello world', 1, skey = '123');
    await client.set('bar', 'hello world', 10, skey = '123');
    await sleep(3000);
    const v1 = await client.get('foo', skey = '123');
    const v2 = await client.get('bar', skey = '123');

    v1? console.log('v1: cache hit =>', v1) : console.log('v1: cache miss');
    v2? console.log('v2: cache hit =>', v2) : console.log('v2: cache miss');

  } catch (e) {
    console.error('something went wrong', e);
  }
}

main().catch(console.error);
