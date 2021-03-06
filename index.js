const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
// const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config()
const port = process.env.PORT || 5000

app.use(cors());
app.use(bodyParser());

app.get('/', (req, res) => {
  res.send('Hello World!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n1fwb.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("carwash").collection("services");
  const orderCollection = client.db("carwash").collection("orders");
  const adminCollection = client.db("carwash").collection("admins");
  const testimonialCollection = client.db("carwash").collection("testimonials");

  // Add Services to database
  app.post("/addservice",(req, res) => {
    const service = req.body;
    console.log(service);
    serviceCollection.insertOne(service)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })

      // Post Testimonials
      app.post('/addtestimonial',(req, res)=>{
        const newReview = req.body;
        testimonialCollection.insertOne(newReview)
        .then(result => {
          res.send(result.insertedCount > 0)
        })
      })

     // Post order
     app.post('/addOrder',(req, res)=>{
      const newOrder = req.body;
      console.log(newOrder);
      orderCollection.insertOne(newOrder)
      .then(result => {
        console.log("inserted Count:",result.insertedCount);
      })
    })

  // Add Admin to Database
  app.post("/addadmin",(req, res) => {
    const admin = req.body;
    console.log(admin);
    adminCollection.insertOne(admin)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })

  // Get Services
  app.get("/service",(req, res) => {
    serviceCollection.find({})
    .toArray((err,items) => {
      res.send(items);
    })
  })

  // Get Service by Id
  app.get('/service/:id',(req, res)=>{
    serviceCollection.find({_id: ObjectId(req.params.id)})
    .toArray((err,documents) => {
      res.send(documents[0]);
    })
  })

    // Get Testimonials
    app.get("/testimonials",(req, res) => {
      testimonialCollection.find({})
      .toArray((err,items) => {
        res.send(items);
      })
    })
//  Get order list
app.post('/bookings', (req, res) => {
  const email = req.body.email;
  let admin = false;
  adminCollection.find({ email: email })
      .toArray((err, admins) => {
          if (admins.length > 0) {
              admin = true;
          }
          if (admin) {
            orderCollection.find({})
            .toArray((err,items) => {
              res.send(items);
            })
          }
          else {
            orderCollection.find({email: email})
            .toArray((err,items) => {
              res.send(items);
            })
          }
      })
})


 

    
  
// is admin?
app.post('/isAdmin', (req, res) => {
  const email = req.body.email;
  adminCollection.find({ email: email })
      .toArray((err, doctors) => {
          res.send(doctors.length > 0);
      })
})

  //Booking Status update
  app.patch('/statusUpdate/:id',(req, res)=>{
    orderCollection.updateOne({_id: ObjectId(req.params.id)},
    {
      $set:{status: req.body.e}
    })
    .then(result =>{
      res.send(result.modifiedCount > 0 )
    })
  })

  // Service Delete
  app.delete('/delete/:id',(req, res)=>{
    serviceCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then(result => {
      res.send(result.deletedCount>0);
    })
    })

  // perform actions on the collection object
  // client.close();
});



app.listen(port)