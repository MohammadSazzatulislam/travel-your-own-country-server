const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.BD_USER_NAME}:${process.env.DB_USER_PASSWORD}@cluster0.4lwt8qz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function veryJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorization Access" });
  }
  jwt.verify(authHeader, process.env.JWT_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden Access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const HomeSlider = client.db("fancy-nomad").collection("slider");
    const HomeNature = client.db("fancy-nomad").collection("nature");
    const HomePlaces = client.db("fancy-nomad").collection("places");
    const DestinationPackages = client.db("fancy-nomad").collection("packages");
    const UsersCollection = client.db("fancy-nomad").collection("users");
    const BookingPackages = client.db("fancy-nomad").collection("booked");

    app.get("/", (req, res) => {
      res.send("Fancy nomad api is running...");
    });

    app.get("/jwt/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const users = await UsersCollection.findOne(query);
      if (users) {
        const token = jwt.sign({ users }, process.env.JWT_TOKEN_SECRET, {
          expiresIn: "7d",
        });
        return res.send({ token });
      }
      res.status(403).send({ message: "forbidden access" });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await UsersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/slider", async (req, res) => {
      const filter = {};
      const result = await HomeSlider.find(filter).toArray();
      res.send(result);
    });
    app.get("/nature", async (req, res) => {
      const filter = {};
      const result = await HomeNature.find(filter).toArray();
      res.send(result);
    });
    app.get("/places", async (req, res) => {
      const filter = {};
      const result = await HomePlaces.find(filter).toArray();
      res.send(result);
    });

    app.get("/places/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await HomePlaces.findOne(filter);
      res.send(result);
    });

    app.get("/packages/:name", async (req, res) => {
      const name = req.params.name;
      const filter = { name: name };
      const result = await DestinationPackages.find(filter).toArray();
      res.send(result);
    });

    app.get("/singlePackages/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await DestinationPackages.findOne(filter);
      res.send(result);
    });

    app.post("/bookingPackages", async (req, res) => {
      const bookedPackage = req.body;
      const filter = {};
      const booked = await BookingPackages.find(filter).toArray();
      const alreadyBooked = booked.filter(
        (element) => element.packageName === bookedPackage.packageName
      );
      if (alreadyBooked.length > 0) {
        res.status(403).send({ message: "You Already Booked This Package" });
      } else {
        const result = await BookingPackages.insertOne(bookedPackage);
        res.send(result);
      }
    });

    app.get("/myBooking/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email };
      const result = await BookingPackages.find(filter).toArray();
      res.send(result);
    });
    app.get('/myBookingUpdate/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: ObjectId(id) }
      const result = await BookingPackages.findOne(filter)
      res.send(result)
    })

    app.delete('/myBooking/:id' ,async(req, res)=> {
      const id = req.params.id
      const filter = {_id:ObjectId(id)}
      const result = await BookingPackages.deleteOne(filter)
      res.send(result)
    })




  } finally {
  }
}
run().catch((err) => console.log(err.message));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
