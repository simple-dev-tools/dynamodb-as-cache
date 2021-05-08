const { DCacheClient } = require('../src/DCacheClient');
const AWS = require('aws-sdk');

describe('#get', () => {
  const mockedDynamoDB = jest.spyOn(AWS, 'DynamoDB');
  const mockedPutItem = jest.fn();
  const mockedGetItem = jest.fn();

  beforeAll(() => {
    jest.mock('aws-sdk', () => ({
      config: {
        setPromisesDependency: jest.fn(() => { })
      }
    }));
    mockedDynamoDB.mockImplementation(() => ({
      getItem: mockedGetItem
    }));
  });

  afterAll(() => {
    mockedPutItem.mockRestore();
    mockedGetItem.mockRestore();
    mockedDynamoDB.mockRestore();
  });

  it('should return value if not expired', async () => {
    mockedGetItem.mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Item: {
          ttl: {
            N: "1593083518",
          },
          pkey: {
            S: "foo",
          },
          cached_value: {
            S: "\"hello world\"",
          },
          skey: {
            S: "123",
          },
        },
      })
    });
    const mockedDateNow = jest.spyOn(global.Date, 'now');
    mockedDateNow.mockImplementation(() => new Date('2020-06-25T11:01:58.135Z').valueOf());

    try {
      const dcClient = new DCacheClient({
        region: 'region1',
        tableName: 'table123'
      });
      const cachedValue = await dcClient.get('key1');
      expect(mockedGetItem.mock.calls[0]).toMatchObject([{
        "ConsistentRead": false,
        "Key": {
          "pkey": {
            "S": "key1",
          },
          "skey": {
            "S": "DCache",
          },
        },
        "TableName": "table123"
      }]);
      expect(cachedValue).toEqual('\"hello world\"');
    } catch (e) {
      throw e;
    }
    mockedDateNow.mockRestore();
  });

  it('should return null get value if not exist', async () => {
    mockedGetItem.mockReturnValue({
      promise: jest.fn().mockResolvedValue({})
    });
    const mockedDateNow = jest.spyOn(global.Date, 'now');
    mockedDateNow.mockImplementation(() => new Date('2020-06-25T11:01:58.135Z').valueOf());

    try {
      const dcClient = new DCacheClient({
        region: 'region1',
        tableName: 'table123'
      });
      const cachedValue = await dcClient.get('key1');
      expect(mockedGetItem.mock.calls[0]).toMatchObject([{
        "ConsistentRead": false,
        "Key": {
          "pkey": {
            "S": "key1",
          },
          "skey": {
            "S": "DCache",
          },
        },
        "TableName": "table123"
      }]);
      expect(cachedValue).toEqual(null);
    } catch (e) {
      throw e;
    }
    mockedDateNow.mockRestore();
  });

  it('should return null get value if value is expired', async () => {
    mockedGetItem.mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Item: {
          ttl: {
            N: "1593082917", // 1 second before "now()"
          },
          pkey: {
            S: "foo",
          },
          cached_value: {
            S: "\"hello world\"",
          },
          skey: {
            S: "123",
          },
        },
      })
    });
    const mockedDateNow = jest.spyOn(global.Date, 'now');
    mockedDateNow.mockImplementation(() => new Date('2020-06-25T11:01:58.135Z').valueOf());

    try {
      const dcClient = new DCacheClient({
        region: 'region1',
        tableName: 'table123'
      });
      const cachedValue = await dcClient.get('key1');
      expect(mockedGetItem.mock.calls[0]).toMatchObject([{
        "ConsistentRead": false,
        "Key": {
          "pkey": {
            "S": "key1",
          },
          "skey": {
            "S": "DCache",
          },
        },
        "TableName": "table123"
      }]);
      expect(cachedValue).toEqual(null);
    } catch (e) {
      throw e;
    }
    mockedDateNow.mockRestore();
  });

});
