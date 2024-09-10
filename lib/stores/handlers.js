const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME;

exports.save = async (event) => {
    const name = event.queryStringParameters.name;
    const item = {
        id: name,
        name: name,
        date: Date.now()
    }
    const savedItem = await saveItem(item);
    return {
        statusCode: 201,
        body: JSON.stringify(savedItem),
    };
}

exports.find = async (event) => {
    const name = event.queryStringParameters.name;
    const item = await findItem(name);
    if (!item) {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Item not found' }),
        };
    }
    return {
        statusCode: 200,
        body: JSON.stringify(item),
    };
}

exports.list = async () => {
    const items = await listItems();
    return {
        statusCode: 200,
        body: JSON.stringify(items),
    };
}

exports.delete = async (event) => {
    const name = event.queryStringParameters.name;
    const item = await findItem(name);
    if (!item) {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Item not found' }),
        };
    }
    await deleteItem(name);
    return {
        statusCode: 204,
        body: '',
    };
}

async function deleteItem(name) {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            id: name
        }
    }

    return dynamo.delete(params).promise();
}

async function listItems() {
    const params = {
        TableName: TABLE_NAME,
    }

    return dynamo.scan(params).promise().then((result) => {
        return result.Items;
    });
}

async function findItem(name) {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            id: name
        }
    }

    return dynamo.get(params).promise().then((result) => {
        return result.Item;
    });
}

async function saveItem(item) {
    const params = {
        TableName: TABLE_NAME,
        Item: item
    }

    return dynamo.put(params).promise().then(() => {
        return item;
    });
}