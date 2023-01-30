const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http =require('http').createServer(app);
const cors = require('cors');
const port = process.env.port || 8080  //this is use for server port
const authRoute = require('./routes/auth-route');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);


// web Socket 1

app.use(express.static("client"));

const server = app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
var io = require("socket.io")(server);

app.get('/', (req, res) => {
    res.sendfile(__dirname +'/shop_app/src/app/public/vote/vote.component.html');
});


const candidates = {
    "0": { votes: 0, label: "Baby Toys", color: randomRGB() },
    "1": { votes: 0, label: "Baby Gifts", color: randomRGB() },
    "2": { votes: 0, label: "Baby Shoes", color: randomRGB() },
    "3": { votes: 0, label: "Baby Blankets", color: randomRGB() },
    "4": { votes: 0, label: "Baby Clothes", color: randomRGB() }
};


io.on("connection", (socket) => {
    io.emit("update", candidates);

    socket.on("vote", (index) => {

            if (candidates[index]) {
                candidates[index].votes = 1;
            }

            console.log(candidates);


            io.emit("update", candidates);

    });
});

function randomRGB() {
    const r = () => Math.random() * 256 >> 0;
    return `rgb(${r()}, ${r()}, ${r()})`;
}


// web Socket 2

/*
const io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
});

let userList = new Map();

io.on('connection', (socket) =>{
    let userName = socket.handshake.query.userName;
    addUser(userName, socket.id);

    socket.broadcast.emit('user-list', [...userList.keys()]);
    socket.emit('user-list', [...userList.keys()]);

    socket.on('message',(msg) =>{
        socket.broadcast.emit('message-broadcast', {message: msg, userName: userName});
    })

    socket.on('disconnect' , (reason) =>{
        removeUser(userName, socket.id);
    })
});

function addUser(userName, id) {
    if(!userList.has(userName)) {
        userList.set(userName, new Set(id));
    }else{
        userList.get(userName).add(id)
    }
}

function removeUser(userName, id){
    if(!userList.has(userName)) {
        let userIds = userList.get(userName);
        if (userIds.size == 0){
            userList.delete(userName);
        }
    }else{
        userList.get(userName).add(id)
    }
}*/


// Card Payment Method

const stripe = require("stripe")("sk_test_51MQtTpBmGD9txaFdFT3TySqCWWD8DptISl7qJi88d0R2kpmyBu8mh9fp4iwh7BNTP6Yfsxc7pgmuEq37tMunkuRS00m9GoAkbY");
app.use(bodyParser.urlencoded({ extended:false }))

app.use(bodyParser.json())

/*app.listen(5000, ()=>{
    console.log("Node server is Connected:", 5000)
})*/ 

app.post('/checkout', async (req, res) => {
    console.log(req.body)

    try {
        token = res.body.token; 
        const customer = stripe.customers
        .create({
            email: "dewmin.vinuraka2@gmail.com",
            source: token.id,
        })
        .then((customer) => {
            console.log(customer);
            return stripe.charges.create({
                amount: 363.98,
                description: "Full Stack Project",
                currency: "LKR",
                customer: customer.id,
            }); 
        })
        .then((charge) => {
            console.log(charge);
            res.json({
                data: "success",
            });
        })
        .catch((err) => {
            res.json({
                data: "failure",
            });
        });
        return true;
    } catch (error) {
        return false;
    }
})


// MongoDB Connection

mongoose.connect('mongodb://localhost:27017/shopapp', (err)=>{
    if(err){
        console.log("Database is not connected..!");
    }else{
        console.log("DB is connected.....");
    }
});

app.use(bodyParser.urlencoded({ extended: false}))

app.use(bodyParser.json())
app.use(cors())

app.use('/auth', authRoute);

// Feedback

var employeeController = require('./controllers/employeeController');
app.use('/employees', employeeController);

//FeedbackEnd

app.post('/', (req, res) =>{
    res.send('Welcome to Dewmin Server')
})

http.listen(3000, ()=>{
    console.log('Server is Running: ',3000)
})

/*
app.listen(port, ()=>{
    console.log("Node server is Connected:", port)
})
*/

module.exports = mongoose;




