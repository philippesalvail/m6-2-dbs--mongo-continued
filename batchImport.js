const { MongoClient } = require("mongodb");
const assert = require("assert");
require("dotenv").config();

const { MONGO_URI } = process.env;
console.log("MONGO_URI in batch: ", MONGO_URI);

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const seats = [];
const row = ["A", "B", "C", "D", "E", "F", "G", "H"];
for (let r = 0; r < row.length; r++) {
  for (let s = 1; s < 13; s++) {
    let seat = {
      _id: `${row[r]}-${s}`,
      price: 225,
      isBooked: false,
    };
    seats.push(seat);
  }
}

const batchImport = async () => {
  try {
    const client = await MongoClient(MONGO_URI, options);
    await client.connect();
    const database = client.db("exercise_2");
    const r = await database.collection("seats").insertMany(seats);
    assert.equal(seats.length, r.insertedCount);
    client.close();
  } catch (error) {
    console.log("error: ", error.message);
  }
};

batchImport();
