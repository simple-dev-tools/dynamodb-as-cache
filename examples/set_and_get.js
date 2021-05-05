const { DCacheClient } = require('../index');
const { promisify } = require('util');

const sleep = promisify(setTimeout);

async function main() {
  try {
    const client = new DCacheClient({
      region: process.env.AWS_REGION,
      tableName: process.env.TABLE_NAME
    });

    await client.set('key123', 'hello world', 2, skey = '123');
    await sleep(1000);
    const v = await client.get('key123', skey = '123');

    if (v) {
      console.log('cache hit: ', v);
    } else {
      console.log('cache miss');
    }
  } catch (e) {
    console.error('something went wrong', e);
  }
}

main().catch(console.error);
