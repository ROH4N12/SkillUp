const { MongoClient } = require('mongodb');

async function test() {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    console.log("Connected");
    
    const db = client.db('skillup');
    const activities = await db.collection('activities').find({}).toArray();
    
    console.log("Found activities:", activities);
    
    await client.close();
}

test();
