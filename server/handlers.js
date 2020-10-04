"use strict";

const { MongoClient } = require("mongodb");
require("dotenv").config();

const { MONGO_URI } = process.env;
console.log("MONGO_URI in handler: ", MONGO_URI);

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const getSeats = async (req, res) => {
  try {
    const client = await MongoClient(MONGO_URI, options);
    await client.connect();
    const database = client.db("exercise_2");
    const data = await database
      .collection("seats")
      .find({ isBooked: false })
      .toArray();
    console.log("data: ", data);
    let seats = {};
    for (let s = 0; s < data.length; s++) {
      seats[data[s]._id] = {
        price: data[s].price,
        isBooked: data[s].isBooked,
      };
    }
    res.status(200).send({
      seats: seats,
      numOfRows: 8,
      seatsPerRow: 12,
    });
    client.close();
  } catch (error) {
    console.log("error: ", error.message);
    res.status(404).send({ status: "no data" });
  }
};
const bookSeat = async (req, res) => {
  const bookId = req.query._id;
  try {
    const client = await MongoClient(MONGO_URI, options);
    await client.connect();
    const database = client.db("exercise_2");
    const data = await database
      .collection("seats")
      .updateOne({ _id: bookId }, { $set: { isBooked: true } });
    assert.equal(1, data.matchedCount);
    assert.equal(1, data.modifiedCount);
    res.status(200).json({ status: 200, _id: bookId, isBooked: true });
    client.close();
  } catch (error) {
    res.status(404).json({ status: 404, _id: bookId, message: error.message });
  }
};
module.exports = { getSeats, bookSeat };
