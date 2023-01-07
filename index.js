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
    const bookingsCollection = client.db("Ubuy").collection("bookings");

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

      res.send({ result, token });
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

    //Get Single Product with id
    app.get("/productsDetails/:id", async (req, res) => {
      const id = req.params.id;

      // console.log(parseInt(id));
      const query = {
        _id: ObjectId(id),
      };
      console.log(query);
      const cursor = await productsCollection.findOne(query);
      // // const products = await cursor.toArray();
      // console.log(cursor);
      res.send(cursor);
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

    // Delete A Product in WishList
    app.delete("/products/wishlist/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = {
        _id: ObjectId(id),
      };
      const result = await wishListsCollection.deleteOne(query);
      res.send(result);
    });

    //Save Product booking
    app.post("/products/booking", async (req, res) => {
      const product = req.body;
      console.log(product);
      const result = await bookingsCollection.insertOne(product);
      res.send(result);
    });

    //Get All Products with eamil address Wish List
    app.get("/products/wishlist/:email", async (req, res) => {
      const email = req.params.email;
      const query = {
        userEmail: email,
      };
      console.log(email);

      const result = await wishListsCollection.find(query).toArray();
      res.send(result);

      // result.map(async (pid) => {
      //   // console.log(pid.productId);
      //   const query = {
      //     _id: ObjectId(pid.productId),
      //   };
      //   // console.log(query);
      //   // const id = pid.productId.filter((p) => p);
      //   // console.log(id);
      //   // const query = {};
      //   // // const productQuery = { _id: ObjectId(query) };
      //   const products = await productsCollection.find(query).toArray();
      //   // console.log(products);
      //   const filterProduct = products.filter((pd) => console.log(pd._id));
      //   // console.log(filterProduct);
      //   // // const cursor = await products.toArray();
      //   // // res.send(products);
      //   // console.log([...filterProduct]);
      // });
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
