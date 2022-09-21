const express = require('express')
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
var bodyParser = require('body-parser')

const app = express()
const port = 3005

function AddMinutesToDate(date, minutes) {
  return new Date(date.getTime() + minutes*60000);
}

// create application/json parser
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
 

app.post('/', jsonParser, (req, res) => {
  try {
    const {mobile_no} = req.body;

    console.log("req.body>>",req.body)

    if(!mobile_no){
      throw new Error("mobile_no is missing in body!");
    }

    //Generate OTP
    const otp = Math.floor(Math.random() * 100000) + 100000;
    const now = new Date();
    //Otp expiration time
    const expiration_time = AddMinutesToDate(now, 2);

    //details object 
    const details = {
      timestamp: now,
      check: mobile_no,
      status: "success",
      message: "OTP SMS Sent Successfully to User Mobile Number.",
      otp: otp,
      expire_time: expiration_time,
    };


    res.status(200).json({ success: true, data: details});
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, error: { message: err.message } });
  }
})



app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})


