const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);



// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qxjq89v.mongodb.net/?retryWrites=true&w=majority`;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qxjq89v.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toyCollection = client.db("toysCars").collection("toys");



    app.get("/toys", async (req, res) => {
      const cursor = toyCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get the data specific email
    app.get("/toys/:email", async (req, res) => {
      const sortingQuery = req.query.sort;
      const result = await toyCollection
        .find({
          sellerEmail: req.params.email,
        })
        .sort({ price: sortingQuery === "desc" ? -1 : 1 })
        .toArray();
      res.send(result);
    });

    // inserted data
    app.post("/toys", async (req, res) => {
      const toys = req.body;
      const result = await toyCollection.insertOne(toys);
      res.send(result);
    });

    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.get("/toys/category/:category", async (req, res) => {
      const category = req.params.category;
      if (!category) return res.send(404);
      const results = await toyCollection
        .find({ subCategory: { $eq: category } })
        .limit(2)
        .toArray();
      res.send(results);
    });

    // delete data from mongodb
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // update data
    app.patch("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const updateToys = req.body;
      // console.log(updateToys)

      const updateDoc = {
        $set: {
          price: updateToys.price,
          availableQuantity: updateToys.availableQuantity,
          description: updateToys.description,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toys server Running.......");
});

app.listen(port, () => {
  console.log(`toys server is running on port ${port}`);
});
