const { DCacheClient } = require('../src/DCacheClient');
const AWS = require('aws-sdk');

describe('#getset', () => {
  const mockedDynamoDB = jest.spyOn(AWS, 'DynamoDB');
  const mockedPutItem = jest.fn();

  beforeAll(() => {
    jest.mock('aws-sdk', () => ({
      config: {
        setPromisesDependency: jest.fn(() => { })
      }
    }));
    mockedDynamoDB.mockImplementation(() => ({
      putItem: mockedPutItem
    }));
  });

  afterAll(() => {
    mockedPutItem.mockRestore();
    mockedDynamoDB.mockRestore();
  });

  it('should set new value and return old value', async () => {
    const mockedDateNow = jest.spyOn(global.Date, 'now');
    mockedDateNow.mockImplementation(() => new Date('2020-06-25T11:01:58.135Z').valueOf());

    mockedPutItem.mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Attributes: {
          ttl: {
            N: "1593082920", // not expired
          },
          pkey: {
            S: "foo",
          },
          cached_value: {
            S: "hello world",
          },
          skey: {
            S: "DCache",
          },
        },
      })
    });
      
    try {
      const dcClient = new DCacheClient({
        region: 'region1',
        tableName: 'table123'
      });
      const oldValue = await dcClient.getset('key1', 123, 600);
      expect(mockedPutItem.mock.calls[0]).toMatchObject([{
        Item: {
          pkey: {S: 'key1' },
          ttl: { N: '1593083518' },
          cached_value: { S: '123' },
          skey: { S: 'DCache'}
        },
        TableName: 'table123'
      }]);
      expect(oldValue).toEqual('hello world');
    } catch (e) {
      throw e;
    }
    
    mockedDateNow.mockRestore();
  });

  it('should set new value and return null because of expired old value', async () => {
    const mockedDateNow = jest.spyOn(global.Date, 'now');
    mockedDateNow.mockImplementation(() => new Date('2020-06-25T11:01:58.135Z').valueOf());

    mockedPutItem.mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Attributes: {
          ttl: {
            N: "1593082917", // expired
          },
          pkey: {
            S: "foo",
          },
          cached_value: {
            S: "hello world",
          },
          skey: {
            S: "DCache",
          },
        },
      })
    });
      
    try {
      const dcClient = new DCacheClient({
        region: 'region1',
        tableName: 'table123'
      });
      const oldValue = await dcClient.getset('key1', 123, 600);
      expect(mockedPutItem.mock.calls[0]).toMatchObject([{
        Item: {
          pkey: {S: 'key1' },
          ttl: { N: '1593083518' },
          cached_value: { S: '123' },
          skey: { S: 'DCache'}
        },
        TableName: 'table123'
      }]);
      expect(oldValue).toEqual(null);
    } catch (e) {
      throw e;
    }
    
    mockedDateNow.mockRestore();
  });


  it('should set new value and return null because of no old value', async () => {
    mockedPutItem.mockReturnValue({
      promise: jest.fn().mockResolvedValue({})
    });
    const mockedDateNow = jest.spyOn(global.Date, 'now')
    mockedDateNow.mockImplementation(() => new Date('2020-06-25T11:01:58.135Z').valueOf())
      
    try {
      const dcClient = new DCacheClient({
        region: 'region1',
        tableName: 'table123'
      });
      const oldValue = await dcClient.getset('key1', 123, 600);
      expect(mockedPutItem.mock.calls[0]).toMatchObject([{
        Item: {
          pkey: {S: 'key1' },
          ttl: { N: '1593083518' },
          cached_value: { S: '123' },
          skey: { S: 'DCache'}
        },
        TableName: 'table123'
      }]);
      expect(oldValue).toEqual(null)
    } catch (e) {
      throw e;
    }
    
    mockedDateNow.mockRestore();
  });

});