const AWS = require('aws-sdk')

/**
 * DyanmoDB as Cache Client
 */
class DCacheClient {

  constructor({
    region, // required
    tableName, // required
    accessKeyId,
    secretAccessKey,
    partionKey,
    sortKey,
    ttlAttribute,
    consistentRead,
    defaultSortKeyValue
  }) {
    this.region = region
    this.tableName = tableName
    this.accessKeyId = accessKeyId
    this.secretAccessKey = secretAccessKey
    this.partionKey = partionKey || 'pkey'
    this.sortKey = sortKey || 'skey'
    this.ttlAttribute = ttlAttribute || 'ttl'
    this.consistentRead = consistentRead || false
    this.defaultSortKeyValue = defaultSortKeyValue || 'DCache'

    let credentials = {}
    if (this.accessKeyId && this.secretAccessKey) {
      credentials = {
        accessKeyId: this.awsAccessKey,
        secretAccessKey: this.awsSecretKey
      }
    }
    this.ddb = new AWS.DynamoDB({
      region: this.region,
      ...credentials
    })

  }

  /**
   * Set Value
   * @param {*} key 
   * @param {*} value 
   * @param {*} ttl 
   * @param {*} skey
   * @returns 
   */
  set(pkey, value, ttl, skey) {

    const item = {
      [this.partionKey]: {
        S: pkey
      },
      [this.sortKey]: {
        S: skey || this.defaultSortKeyValue
      },
      cached_value: {
        S: JSON.stringify(value)
      }
    }

    if (ttl != null) {
      item[this.ttlAttribute] = {
        N: (parseInt(ttl) + Math.floor(Date.now() / 1000)).toString()
      }
    }

    return this.ddb.putItem({
      Item: {
        ...item
      },
      TableName: this.tableName
    }).promise()
  }

  /**
   * Get Value
   * @param {*} key 
   * @returns 
   */
  async get(pkey, skey) {
    const data = await this.ddb.getItem({
      TableName: this.tableName,
      ConsistentRead: this.consistentRead,
      Key: {
        [this.partionKey]: {
          S: pkey
        },
        [this.sortKey]: {
          S: skey || this.defaultSortKeyValue
        }
      }
    }).promise()

    if (data && data.Item) {
      const value = data.Item.cached_value.S
      if (data.Item.ttl && Date.now() / 1000 > data.Item.ttl.N) {
        return null
      }
      return value
    }
    return null
  }
}

module.exports = {
  DCacheClient
}