const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const dbConfig = require('./config/database.config.js');
/*
Modify Change Stream Output using Aggregation Pipelines
You can control change stream output by providing an array of one or more of the following pipeline stages when configuring the change stream:
$match, $project, $addFields, $replaceRoot, $redact
See Change Events for more information on the change stream response document format.
*/
const pipeline = [
  {
    '$match': { 'fullDocument.address': '0x7983A52866ab5f48de61F1DECD3F79A5DfE9C1d1' }
  }
];
pipeline[0]['$match']['fullDocument.topics'] = ['0x3990db2d31862302a685e8086b5755072a6e2b5b780af1ee81ece35ee3cd3345'];
console.log("##PIPELINE## => ", pipeline);
const connectionString = dbConfig.url_rs;

// fake events for testing
// @address: Contract's address
// @topics: Event's Id : not a unique identifier, for every event created in the contract,
// we have an id for that exact event, let's say for the event sendMoney() topics is 4
//@id: the unique id for each event launched from the contract (event instance let's say)
var events = [];
events[0] = {
  address: '0x7983A52866ab5f48de61F1DECD3F79A5DfE9C1d1',
  topics: [
    '0x3990db2d31862302a685e8086b5755072a6e2b5b780af1ee81ece35ee3cd3345'
  ],
  blockNumber: 14354,
  logIndex: 0,
  removed: false,
  id: 'log_80b3cef1',
  transactionHash: '0xaf2ee33f68a1908e7528e08899d9b85afdea839c7bf35d82f4aee23d148d17e6',
  blockHash: '0x34860c9c54d792cbfc9536d61a4cdc81558e46a7c730e23451ea253565259af2',
  result: {
    '0': '0xe062C6acEF6e44a009dfF67bCBdDf2C780DdbC91',
    '1': '0xe062C6acEF6e44a009dfF67bCBdDf2C780DdbC91',
    '2': '50',
    _length_: 3
  }
};

events[1] = {
  address: '0x7983A52866ab5f48de61F1DECD3F79A5DfE9C1d2',
  topics: [
    '0x3990db2d31862302a685e8086b5755072a6e2b5b780af1ee81ece35ee3cd3345'
  ],
  blockNumber: 14354,
  logIndex: 0,
  removed: false,
  id: 'log_80b3cef2',
  transactionHash: '0xaf2ee33f68a1908e7528e08899d9b85afdea839c7bf35d82f4aee23d148d17f7',
  blockHash: '0x34860c9c54d792cbfc9536d61a4cdc81558e46a7c730e23451ea253565259af2',
  result: {
    '0': '0xe062C6acEF6e44a009dfF67bCBdDf2C780EdFD52',
    '1': '0xe062C6acEF6e44a009dfF67bCBdDf2C780EdFD52',
    '2': '60',
    _length_: 3
  }
};

MongoClient.connect(
    connectionString,
    {
        useUnifiedTopology: false,
        useNewUrlParser: true
    }
)
.then(client => {
    console.log("Connected correctly to the replica set");
    // specify db and collections
    const db = client.db("EventsDB");
    const collection = db.collection("Events");

    const changeStream = collection.watch(pipeline);    // start listen to changes
    changeStream.on("change", function(change) {
      console.log(change);
      console.log(change.fullDocument);
    });    
    // insert few data with timeout so that we can watch it happening
    setTimeout(function() {
    collection.insertOne(events[0], function(err) {
        assert.ifError(err);
    });
    }, 5000);
    setTimeout(function() {
        collection.insertOne(events[1], function(err) {
            assert.ifError(err);
        });
    }, 10000);
})
  .catch(err => {
    console.error(err);
});