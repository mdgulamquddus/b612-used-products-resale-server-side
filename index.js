const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

const port = process.env.PORT;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.h6dt8.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const productsCollection = client.db("Ubuy").collection("products");
    const usersCollection = client.db("Ubuy").collection("users");

    //Save user and genarate jwt token
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });

      // Get A Single User
      app.get("/user/:email", async (req, res) => {
        const email = req.params.email;
        console.log(email);
        // const decodedEmail = req.decoded.email;

        // if (email !== decodedEmail) {
        //   return res.status(403).send({ message: "forbidden access" });
        // }
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        console.log(user);
        res.send(user);
      });
      res.send({ result, token });
    });

    // Get All User
    app.get("/users", async (req, res) => {
      const query = {};
      const cursor = usersCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });
    // Delete A user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = {
        _id: ObjectId(id),
      };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    //Get All Products
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    //Get Single Product
    app.get("/products/:category", async (req, res) => {
      const category = req.params.category.toUpperCase();
      console.log(category);
      const query = {
        category: category,
      };
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    // Post A Product
    app.post("/products", async (req, res) => {
      const product = req.body;
      console.log(product);
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    // Delete A Product
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = {
        _id: ObjectId(id),
      };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });
    console.log("Database Connected...");
  } finally {
  }
}

run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Server is Running");
});

app.listen(port, () => {
  console.log(`Server is Running on port ${port}`);
});
