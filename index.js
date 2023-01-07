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
    const wishListsCollection = client.db("Ubuy").collection("wishLists");

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

    // make verified user
    app.put("/users/verify/:id", async (req, res) => {
      // const decodedEmail = req.decoded.email;
      // console.log(decodedEmail);
      // const query = {
      //   email: decodedEmail,
      // };
      // const query = {};
      // const user = await usersCollection.findOne(query);
      // if (user?.role !== "admin") {
      //   return res.status(403).json({ message: "Forbiden Access" });
      // }
      const id = req.params.id;

      const filter = {
        _id: ObjectId(id),
      };
      const option = { upsert: true };
      const updateDoc = {
        $set: { status: "verified" },
      };

      const resutl = await usersCollection.updateOne(filter, updateDoc, option);
      res.send(resutl);
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
    app.get("/products/advertise", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      let advertise = [];
      const advertiseProduct = products.filter(
        (product) =>
          product.advertise === "yes" && product.status === "available"
      );
      console.log(advertiseProduct);
      res.send(advertiseProduct);
    });

    //Get Single Product with category
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
    //Get Single Product with email
    app.get("/products/seller/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = {
        email,
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

    // request for advertise product
    app.put("/products/advertise/:id", async (req, res) => {
      // const decodedEmail = req.decoded.email;
      // console.log(decodedEmail);
      // const query = {
      //   email: decodedEmail,
      // };
      // const query = {};
      // const user = await usersCollection.findOne(query);
      // if (user?.role !== "admin") {
      //   return res.status(403).json({ message: "Forbiden Access" });
      // }
      const id = req.params.id;

      const filter = {
        _id: ObjectId(id),
      };
      const option = { upsert: true };
      const updateDoc = {
        $set: { advertise: "yes" },
      };

      const result = await productsCollection.updateOne(
        filter,
        updateDoc,
        option
      );
      res.send(result);
      console.log(result);
    });

    //Save Product in Wish List
    app.post("/products/wishlist", async (req, res) => {
      const product = req.body;
      console.log(product);
      const result = await wishListsCollection.insertOne(product);
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
