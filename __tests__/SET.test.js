const { DCacheClient } = require('../src/DCacheClient');
const AWS = require('aws-sdk');

describe('#set', () => {
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

  it('should successfully set value', async () => {
    mockedPutItem.mockReturnValue({
      promise: jest.fn().mockResolvedValue({})
    });
    const mockedDateNow = jest.spyOn(global.Date, 'now');
    mockedDateNow.mockImplementation(() => new Date('2020-06-25T11:01:58.135Z').valueOf());
      
    try {
      const dcClient = new DCacheClient({
        region: 'region1',
        tableName: 'table123'
      });
      await dcClient.set('key1', 123, 600);
      expect(mockedPutItem.mock.calls[0]).toMatchObject([{
        Item: {
          pkey: {S: 'key1' },
          ttl: { N: '1593083518' },
          cached_value: { S: '123' },
          skey: { S: 'CACHE'}
        },
        TableName: 'table123'
      }]);
    } catch (e) {
      throw e;
    }
    
    mockedDateNow.mockRestore();
  });

  it('should report system error if dynamo throws error', async () => {
    mockedPutItem.mockReturnValue({
      promise: jest.fn().mockRejectedValue(new Error('dynamo error'))
    });

    const dcClient = new DCacheClient({
      region: 'region1',
      tableName: 'table123'
    });
    await expect(dcClient.set('key1', 123)).rejects.toThrowError(new Error('dynamo error'));

  });
});
