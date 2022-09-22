const express = require("express");
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
const mysql = require("mysql");

const app = express();
const port = 3005;

const token_key = "79f5f18041db6cccc8298cb68da2bb6b02eeceb3d5b0534d";

function AddMinutesToDate(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

//------------------------------ Database connection ------------------------------//
// Mysql pool connection.
var pool_con = mysql.createPool({
  host: "localhost",
  user: "user",
  password: "Root#12345",
  database: "mobileData",
});

pool_con.getConnection(function (err) {
  if (!err) {
    console.log("Database connection successful!");
    return true;
  } else {
    console.log("Datebase connection failed!");
    return false;
  }
});
//------------------------------ Database connection ------------------------------//

app.post("/sendOTP", jsonParser, (req, res) => {
  try {
    const { mobile_no } = req.body;

    console.log("req.body>>", req.body);

    if (!mobile_no) {
      throw new Error("mobile_no is missing in body!");
    }

    var token = jwt.sign(mobile_no, token_key);

    //Generate OTP
    const otp = Math.floor(Math.random() * 100000) + 100000;
    const now = new Date();
    //Otp expiration time
    const expiration_time = AddMinutesToDate(now, 2);

    //details object
    const details = {
      timestamp: now,
      phone: mobile_no,
      status: "success",
      message: "OTP SMS Sent Successfully to User Mobile Number.",
      otp: otp,
      expire_time: expiration_time,
      token: token,
    };

    var add_new_data = `INSERT INTO mobileUserData (otp, phone) VALUES ("${otp}", "${mobile_no}")`;
    pool_con.query(add_new_data, (err, result) => {
      console.log("row_length>", result.affectedRows);
      if (!err) {
        console.log("phone and otp inserted to DB!");
      }
    });

    res.status(200).json({ success: true, data: details });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

app.post("/verifyOTP", jsonParser, (req, res) => {
  try {
    const { mobile_no, otp, token } = req.body;

    // var msg = "Otp Verified."

    if (!mobile_no || !otp || !token) {
      throw new Error("mobile, otp or token is missing in body!");
    }

    //Decoding verification_key

    //--------------------------------------------------------
    //Checking if OTP is equal to the OTP in DB
    // if (otp !== otpExist.otp) {
    //   throw new Error("Incorrect Otp!");
    // }

    //Mark OTP as verified or used
    // otpExist.isVerified = true;

    var find_data = `SELECT otp from mobileuserdata WHERE phone='${mobile_no}'`;

    pool_con.query(find_data, (err, result) => {
      console.log("find_data>>", result[0].otp);
      if (otp != result[0].otp) {
        res
          .status(400)
          .json({
            success: false,
            error: { message: "otp verification failed!" },
          });
      } else {
        res
          .status(200)
          .json({ success: true, data: { message: "Otp Verified!" } });
      }
    });
  } catch (err) {
    // return { success: false, error: { message: err.message } };
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});

// var add_new_data=`INSERT INTO mobileUserData (phone, otp) VALUES ("${phone}","${otp}")`;
// pool_con.query(add_new_data,(err,result)=>{
//   if(!err){
//     res.send('phone and otp inserted!')
//   }
// })
