var express = require('express');
var router = express.Router();

const pkg = require('./../package.json');

const { MongoClient } = require("mongodb");
const uri = process.env.URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const database = client.db("rkv");
const contactMessage = database.collection("super_doodle");


// Get server infos
router.get('/', (req, res) => {
   return res.send(`${pkg.description} v${pkg.version}`);
 });
 
 // Create an account
 router.post('/accounts', async (req, res) => {
   // Check mandatory request parameters
   console.log(req);
   if (!req.body.user || !req.body.currency) {
     return res.status(400).json({ error: 'Missing parameters' });
   }
 
   // Check if account already exists
   if (db[req.body.user]) {
     return res.status(409).json({ error: 'User already exists' });
   }
 
   // Convert balance to number if needed
   let balance = req.body.balance;
   if (balance && typeof balance !== 'number') {
     balance = parseFloat(balance);
     if (isNaN(balance)) {
       return res.status(400).json({ error: 'Balance must be a number' });  
     }
   }
 
   // Create account
   const account = {
     user: req.body.user,
     currency: req.body.currency,
     description: req.body.description || `${req.body.user}'s budget`,
     balance: balance || 0,
     transactions: [],
   };
   db[req.body.user] = account;
 
   console.log(`Account created: ${JSON.stringify(account)}`);
 
   try {
     await client.connect();
     const timeStamp = Date.now();
     var currentdate = new Date(); 
     var dateTimeText = "Time: " + currentdate.getDate() + "/"
                     + (currentdate.getMonth()+1)  + "/" 
                     + currentdate.getFullYear() + " @ "  
                     + currentdate.getHours() + ":"  
                     + currentdate.getMinutes() + ":" 
                     + currentdate.getSeconds();
 
     // create a document to insert
     const doc = {
         user: req.body.user,
         currency: req.body.currency,
         description: req.body.description || `${req.body.user}'s budget`,
         balance: balance || 0,
         timeStamp: timeStamp,
         dateTimeText: dateTimeText
     }
     const result = await contactMessage.insertOne(doc);
     console.log(`A document was inserted with the _id: ${result.insertedId}`);
 
   } finally {
       await client.close();
   }
 
   return res.status(201).json(account);
 });
 
 // Get all accounts
 router.get('/accounts', async  (req, res) => {
 
   let data = contactMessage.find({});
 
   try {
     await client.connect();
 
     let data = contactMessage.find({});
 
     // Check if data exists
     if (!data) {
       return res.status(404).json({ error: 'User does not exist' });
     }
 
     return res.json(data);
 
   } finally {
       await client.close();
   }
 });
 
 // Get all data for the specified account
 router.get('/accounts/:id', async  (req, res) => {
   const id = db[req.params.id];
 
   try {
     await client.connect();
 
     let data = contactMessage.find( { id: id } )
 
     // Check if account exists
     if (!data) {
       return res.status(404).json({ error: 'User does not exist' });
     }
 
     return res.json(data);
 
   } finally {
       await client.close();
   }
 
 });
 
 // Update the data for the specified account
 router.post('/accounts/:id', async  (req, res) => {
   const id = db[req.params.id];
 
   let data = contactMessage.find( { id: id } )
 
   // Check if account exists
   if (!data) {
     return res.status(404).json({ error: 'User does not exist' });
   } else {
     // Update account
     // Check mandatory request parameters
     console.log(req.body);
     if (!req.body.user || !req.body.currency) {
       return res.status(400).json({ error: 'Missing parameters' });
     }
 
     // Check if account already exists
     if (db[req.body.user]) {
       return res.status(409).json({ error: 'User already exists' });
     }
 
     // Convert balance to number if needed
     let balance = req.body.balance;
     if (balance && typeof balance !== 'number') {
       balance = parseFloat(balance);
       if (isNaN(balance)) {
         return res.status(400).json({ error: 'Balance must be a number' });  
       }
     }
 
     console.log(`Account created: ${JSON.stringify(account)}`);
 
     try {
       await client.connect();
       const timeStamp = Date.now();
       var currentdate = new Date(); 
       var dateTimeText = "Time: " + currentdate.getDate() + "/"
                       + (currentdate.getMonth()+1)  + "/" 
                       + currentdate.getFullYear() + " @ "  
                       + currentdate.getHours() + ":"  
                       + currentdate.getMinutes() + ":" 
                       + currentdate.getSeconds();
 
       // create a document to insert
       const doc = {
           user: req.body.user,
           currency: req.body.currency,
           description: req.body.description || `${req.body.user}'s budget`,
           balance: balance || 0,
           updateTimeStamp: timeStamp,
           updateDateTimeText: dateTimeText
       }
       const result = await contactMessage.updateOne(
         { id: id },
         {
           $set: doc,
           $currentDate: { lastModified: true }
         }
      )
 
       console.log(`A document was updated`);
 
     } finally {
         await client.close();
     }
   }
 
   return res.json(data);
 });

 module.exports = router;