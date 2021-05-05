const AWS = require('aws-sdk');

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
    consistentRead
  }) {
    this.region = region;
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.tableName = tableName;
    this.partionKey = partionKey || 'pkey';
    this.sortKey = sortKey || 'skey';
    this.ttlAttribute = ttlAttribute || 'ttl';
    this.consistentRead = consistentRead || false;

    if (!this.ddb) {
      let credentials = {};
      if (this.accessKeyId && this.secretAccessKey) {
        credentials = {
          accessKeyId: this.awsAccessKey,
          secretAccessKey: this.awsSecretKey
        };
      }
      this.ddb = new AWS.DynamoDB({
        region: this.region,
        ...credentials
      });
    }
  }

  /**
   * Set Value
   * @param {*} key 
   * @param {*} value 
   * @param {*} ttl 
   * @returns 
   */
  set(pkey, value, ttl, skey = 'CACHE') {

    const item = {
      [this.partionKey]: {
        S: pkey
      },
      [this.sortKey]: {
        S: skey
      },
      cached_value: {
        S: JSON.stringify(value)
      }
    };

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
    }).promise();
  }

  /**
   * Get Value
   * @param {*} key 
   * @returns 
   */
  async get(pkey, skey = 'CACHE') {
    const data = await this.ddb.getItem({
      TableName: this.tableName,
      ConsistentRead: this.consistentRead,
      Key: {
        [this.partionKey]: {
          S: pkey
        },
        [this.sortKey]: {
          S: skey
        }
      }
    }).promise();

    if (data && data.Item) {
      const value = data.Item.cached_value.S;
      if (data.Item.ttl && Date.now() / 1000 > data.Item.ttl.N) {
        return null;
      }
      return value;
    }
    return null;
  };
}

module.exports = {
  DCacheClient
}