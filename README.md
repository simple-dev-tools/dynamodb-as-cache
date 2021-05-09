# DynamoDB as Cache

Use DynamoDB as cache service, providing Redis-like APIs and reducing the boilerplate of dealing low-level DynamoDB APIs. 

## Why

DynamoDB requires minimum maintenance overhead and acceptable performance in quite many cases. Often we just need a simple centralized key-value storage for our distributed services. 

Where extreme performance is required, we can still easily migrate our code to use Redis. 


## Installation

```shell
npm i dynamodb-as-cache
```

## Example

```js
const { DCacheClient } = require('dynamodb-as-cache')
const { promisify } = require('util')

const sleep = promisify(setTimeout)

async function main() {
  try {
    const client = new DCacheClient({
      region: process.env.AWS_REGION,
      tableName: process.env.TABLE_NAME
    })

    await client.set('foo', 'hello world', 1, skey = '123')
    await client.set('bar', 'hello world', 10, skey = '123')
    await sleep(3000)
    const v1 = await client.get('foo', skey = '123')
    const v2 = await client.get('bar', skey = '123')

    v1? console.log('v1: cache hit =>', v1) : console.log('v1: cache miss')
    v2? console.log('v2: cache hit =>', v2) : console.log('v2: cache miss')

  } catch (e) {
    console.error('something went wrong', e)
  }
}

main().catch(console.error)

```

## API

### constructor(options)

#### Options
* `region` - _string_, required. AWS region, e.g. us-east-1
* `tableName` - _string_, required. DynamoDB table name
* `accessKeyId` - _string_, optional. AWS Access Key Id
* `secretAccessKey` - _string_, optional. AWS Secret Access Key
* `partionKey` - _string_, optional. (default: `pkey`)
* `sortKey` - _string_, optional. (default: `skey`)
* `ttlAttribute` - _string_, optional. (default: `ttl`)
* `consistentRead` - _boolean_, optional. (default: `false`)
* `defaultSortKeyValue` - _string_, optional. (default: `DCache`)

### set(pkey, value, ttl = null, skey = 'DCache')

Returns Promise, which 
* __resovled__ with empty object
* __rejected__ when dynamodb throws error

Arguments: 
* `pkey` partition key
* `value` value to cache
* `ttl` time to live (in seconds), `default: null`
* `skey` sort key. `default: DCache`

### get(pkey, skey = 'DCache')

Returns Promise, which 
* __resovled__ with cached value
* __rejected__ when dynamodb throws error

Arguments: 
* `pkey` partition key
* `skey` sort key, `default: DCache`
