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
   * @param {*} options
   * @returns 
   */
  set(pkey, value, ttl, options = {}) {
    const item = {
      [this.partionKey]: {
        S: pkey
      },
      [this.sortKey]: {
        S: options.skey || this.defaultSortKeyValue
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
      TableName: this.tableName,
      ReturnValues: options.returnOldValue? 'ALL_OLD': 'NONE'
    }).promise()
  }

  /**
   * Set Value, and return old values.
   * @param {*} key 
   * @param {*} value 
   * @param {*} ttl 
   * @param {*} options
   * @returns 
   */
  async getset(pkey, value, ttl, options = {}) {
    const data = await this.set(pkey, value, ttl, {
      ...options,
      returnOldValue: true
    })

    if (data && data.Attributes) {
      const value = data.Attributes.cached_value.S
      if (data.Attributes.ttl && Date.now() / 1000 > data.Attributes.ttl.N) {
        return null
      }
      return value
    }
    return null
  }

  /**
   * Get Value
   * @param {*} key 
   * @param {*} options
   * @returns 
   */
  async get(pkey, opitons = {}) {
    const data = await this.ddb.getItem({
      TableName: this.tableName,
      ConsistentRead: this.consistentRead,
      Key: {
        [this.partionKey]: {
          S: pkey
        },
        [this.sortKey]: {
          S: opitons.skey || this.defaultSortKeyValue
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