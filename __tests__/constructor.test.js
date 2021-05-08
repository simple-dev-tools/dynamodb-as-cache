const { DCacheClient } = require('../src/DCacheClient');
const AWS = require('aws-sdk');

describe('#constructor', () => {
  const mockedDynamoDB = jest.spyOn(AWS, 'DynamoDB');
  
  beforeAll(() => {
    jest.mock('aws-sdk');
    mockedDynamoDB.mockImplementation(() => ({
    }));
  });

  it('should create DCacheClient instance with default options', async () => {
    try {
      const dcClient = new DCacheClient({
        region: 'region1',
        tableName: 'table123'
      });

      expect(dcClient.accessKeyId).toEqual(undefined);
      expect(dcClient.secretAccessKey).toEqual(undefined);
      expect(dcClient.region).toEqual('region1');
      expect(dcClient.tableName).toEqual('table123');
      expect(dcClient.partionKey).toEqual('pkey');
      expect(dcClient.sortKey).toEqual('skey');
      expect(dcClient.ttlAttribute).toEqual('ttl');
      expect(dcClient.consistentRead).toEqual(false);
      expect(dcClient.defaultSortKeyValue).toEqual('DCache');
    } catch (e) {
      throw e;
    }
  });

  it('should create DCacheClient instance with custom options', async () => {
    try {
      const dcClient = new DCacheClient({
        region: 'region2',
        tableName: 'table456',
        accessKeyId: 'accesskey123',
        secretAccessKey: 'secretkey123',
        partionKey: 'pkey123',
        sortKey: 'skey123',
        ttlAttribute: 'time2live',
        consistentRead: true,
        defaultSortKeyValue: 'FOO'
      });

      expect(dcClient.accessKeyId).toEqual('accesskey123');
      expect(dcClient.secretAccessKey).toEqual('secretkey123');
      expect(dcClient.region).toEqual('region2');
      expect(dcClient.tableName).toEqual('table456');
      expect(dcClient.partionKey).toEqual('pkey123');
      expect(dcClient.sortKey).toEqual('skey123');
      expect(dcClient.ttlAttribute).toEqual('time2live');
      expect(dcClient.consistentRead).toEqual(true);
      expect(dcClient.defaultSortKeyValue).toEqual('FOO');
    } catch (e) {
      throw e;
    }
  });
});
