"use strict";

const { MongoClient } = require("mongodb");
const assert = require("assert");
require("dotenv").config();

const { MONGO_URI } = process.env;
console.log("MONGO_URI in handler: ", MONGO_URI);

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const getSeats = async (req, res) => {
  console.log("req: ", req.query);
  try {
    const client = await MongoClient(MONGO_URI, options);
    await client.connect();
    const database = client.db("exercise_2");
    const data = await database.collection("seats").find().toArray();
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
  const { seatId, creditCard, expiration, email, fullName } = req.body;

  try {
    const client = await MongoClient(MONGO_URI, options);
    await client.connect();
    const database = client.db("exercise_2");
    let seatSelected = await database
      .collection("seats")
      .findOne({ _id: seatId });
    if (seatSelected.isBooked) {
      return res.status(400).json({
        message: "This seat has already been booked!",
      });
    }
    if (!creditCard || !expiration || !email || !fullName) {
      return res.status(400).json({
        status: 400,
        message: "Please provide credit card information!",
      });
    }
    seatSelected = await database
      .collection("seats")
      .updateOne({ _id: seatId }, { $set: { isBooked: true } });
    assert.equal(1, seatSelected.matchedCount);
    assert.equal(1, seatSelected.modifiedCount);
    res.status(200).json({
      status: 200,
      success: true,
    });
    client.close();
  } catch (error) {
    res.status(404).json({ status: 404, _id: seatId, message: error.message });
  }
};
module.exports = { getSeats, bookSeat };
