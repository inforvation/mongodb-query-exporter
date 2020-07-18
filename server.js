const mongodb = require('mongodb')
const fs = require('fs')
const dotenv = require('dotenv')
const client = require('prom-client')
const express = require('express')
const server = express()
dotenv.config()

//client.collectDefaultMetrics({})
//const register = new client.Registry()

const options = {
  poolSize:1000,
  ssl:true,
  sslKey: fs.readFileSync(process.env.MONGODB_KEY),
  sslCert: fs.readFileSync(process.env.MONGODB_CERT),
  sslCA: fs.readFileSync(process.env.MONGODB_CA),
  readPreference:mongodb.ReadPreference.PRIMARY_PREFERRED,
  useNewUrlParser: true,
  useUnifiedTopology: true
}

const counter = new client.Gauge({
  name:'mongodb_query',
  help:'query result from mongodb',
})

const query = async () => {
  const dbClient = await mongodb.MongoClient.connect(process.env.MONGODB_URL, options)
  const db = dbClient.db(process.env.MONGODB_DB)
  const collection = await db.collection(process.env.MONGODB_COLLECTION)
  const result = await collection.countDocuments(require('./config'))
  counter.set(result)
  console.log(result)
  dbClient.close()
}

server.get('/metrics',async (req,res) => {
  try {
    await query()
		res.set('Content-Type', client.register.contentType);
		res.end(await client.register.metrics());
	} catch (ex) {
		res.status(500).end(ex);
	}
})


//query()

const port = process.env.PORT || 3000
console.log(`Server listening to ${port}, metrics exposed on /metrics endpoint`);
server.listen(port)
