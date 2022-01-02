var express = require("express");
var router = express.Router();

const pkg = require("./../package.json");

const { MongoClient } = require("mongodb");
const uri = process.env.URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const database = client.db("rkv");
const ref = database.collection("super_doodle");

// Get server infos
router.get("/", (req, res) => {
  return res.send(`${pkg.description} v${pkg.version}`);
});

// Create an account
router.post("/accounts", async (req, res) => {
  // Check mandatory request parameters
  console.log(req.body.user);
  if (!req.body.user || !req.body.currency) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  // Convert balance to number if needed
  let balance = req.body.balance;
  if (balance && typeof balance !== "number") {
    balance = parseFloat(balance);
    if (isNaN(balance)) {
      return res.status(400).json({ error: "Balance must be a number" });
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

  console.log(`Account created: ${JSON.stringify(account)}`);

  try {
    await client.connect();
    const timeStamp = Date.now();
    var currentdate = new Date();
    var dateTimeText =
      "Time: " +
      currentdate.getDate() +
      "/" +
      (currentdate.getMonth() + 1) +
      "/" +
      currentdate.getFullYear() +
      " @ " +
      currentdate.getHours() +
      ":" +
      currentdate.getMinutes() +
      ":" +
      currentdate.getSeconds();

    let newId =  await ref.countDocuments() + 1;

    // create a document to insert
    const doc = {
      user: req.body.user,
      currency: req.body.currency,
      description: req.body.description || `${req.body.user}'s budget`,
      balance: balance || 0,
      timeStamp: timeStamp,
      dateTimeText: dateTimeText,
      id: newId,
    };
    const result = await ref.insertOne(doc);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } catch(err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }

  return res.status(201).json(account);
});

// Get all accounts
router.get("/accounts", async (req, res) => {

  try {
    await client.connect();

    let fullData = await ref.find({});
    let data = [];

    if ((await fullData.count()) === 0) {
      console.log("No documents found!");
      return res.status(404).json({ error: "User does not exist" });
    } else {
      await fullData.forEach((doc) => { 
        data.push(doc);
      });
    }

    return res.json(data);
  } catch(err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

// Get all data for the specified account
router.get("/accounts/:id", async (req, res) => {
  let id = parseInt(req.params.id);

  try {
    await client.connect();

    let data = await ref.findOne({ id: id });
    console.log(data);

    // Check if account exists
    if (!data) {
      return res.status(404).json({ error: "User does not exist" });
    }

    return res.json(data);
  } catch(err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

// Update the data for the specified account
router.post("/accounts/:id", async (req, res) => {
  let id = parseInt(req.params.id);

  try {
    await client.connect();

    let data = await ref.findOne({ id: id });

    // Check if account exists
    if (!data) {
      return res.status(404).json({ error: "User does not exist" });
    } else {
      // Update account
      // Check mandatory request parameters
      if (!req.body.user || !req.body.currency) {
        return res.status(400).json({ error: "Missing parameters" });
      }

      // Convert balance to number if needed
      let balance = req.body.balance;
      if (balance && typeof balance !== "number") {
        balance = parseFloat(balance);
        if (isNaN(balance)) {
          return res.status(400).json({ error: "Balance must be a number" });
        }
      };

      const timeStamp = Date.now();
      var currentdate = new Date();
      var dateTimeText =
        "Time: " +
        currentdate.getDate() +
        "/" +
        (currentdate.getMonth() + 1) +
        "/" +
        currentdate.getFullYear() +
        " @ " +
        currentdate.getHours() +
        ":" +
        currentdate.getMinutes() +
        ":" +
        currentdate.getSeconds();

      // create a document to insert
      const doc = {
        user: req.body.user,
        currency: req.body.currency,
        description: req.body.description || `${req.body.user}'s budget`,
        balance: balance || 0,
        updateTimeStamp: timeStamp,
        updateDateTimeText: dateTimeText,
        id: id,
      };
      const result = await ref.updateOne(
        { id: id },
        {
          $set: doc,
          $currentDate: { lastModified: true },
        }
      );

      console.log(`A document was updated`);

      return res.json(doc);
    };
  } catch(err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;
