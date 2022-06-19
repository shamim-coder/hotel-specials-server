const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@hotel-booking.nhurgeb.mongodb.net`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        await client.connect();

        const hotelCollections = client.db("accommodations").collection("hotels");

        // get hotel collections
        app.get("/hotels", async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);

            const query = {};
            const cursor = hotelCollections.find(query);

            let hotels;
            if (page || size) {
                hotels = await cursor
                    .skip(page * size)
                    .limit(size)
                    .toArray();
            } else {
                hotels = await cursor.toArray();
            }

            res.send(hotels);
        });

        // get single hotel
        app.get("/hotel/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await hotelCollections.findOne(query);
            res.send(result);
        });

        app.post("/add-hotel", async (req, res) => {
            const doc = req.body;
            const result = await hotelCollections.insertOne(doc);
            res.send(result);
        });

        app.delete("/delete-hotel/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await hotelCollections.deleteOne(query);
            res.send(result);
        });

        // get service count
        app.get("/hotel-count", async (req, res) => {
            const numberOfHotel = await hotelCollections.estimatedDocumentCount();
            res.json(numberOfHotel);
        });

        // filter by page and size using search query

        app.get("hotels");

        // const facilitiesCollection = client.db("accommodations").collection("facilities");

        // app.get("/facilities", async (req, res) => {
        //     const query = {};
        //     const cursor = facilitiesCollection.find(query);

        //     const facilities = await cursor.toArray();

        //     res.send(facilities);
        // });
    } finally {
        // await client.close();
    }
};
run().catch(console.dir);

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
