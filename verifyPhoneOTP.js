const express = require('express')
var bodyParser = require('body-parser')

const app = express()
const port = 3005

function AddMinutesToDate(date, minutes) {
  return new Date(date.getTime() + minutes*60000);
}

// create application/json parser
var jsonParser = bodyParser.json()


var verifyOtp = async (req, res) => {
  try {
    const { mobile_no, otp, check, userId, type="" } = req.body;

    if (!userId,!verification_key || !otp || !check) {
      throw new Error("userId, Otp, check or verification_key is missing in body!");
    }

    // VALIDATE USER DATA BEFORE CREATING
    const { error } = await verifyOtpValidation(req.body);
    if (error) throw new Error(error.details[0].message);

    //Decoding verification_key
    let decoded = symmetricDecrypt(verification_key, ENCRYPTION_KEY);
    let obj = await JSON.parse(decoded);

    if (obj.check != check) throw new Error("Incorrect check email!");

    //--------------------------------------------------------
    //Checking email OTP in DB
    const otpExist = await VerificationRequest.findById({ _id: obj.otp_id });
    if (!otpExist) {
      throw new Error("otp-not-found");
    }

    //Checking if OTP is already used or not
    if (otpExist.isVerified) {
      throw new Error("otp-already-used");
    }

    //Checking if OTP is equal to the OTP in DB
    if (otp !== otpExist.otp) {
      throw new Error("Incorrect Otp!");
    }

    //Mark OTP as verified or used
    otpExist.isVerified = true;
    await otpExist.save();

    if(type==="MOBILE_VERIFICATION"){
      //mark mobile as verified in db
      await User.findByIdAndUpdate({_id:userId},{isPhoneVerified:true});
    }

    if(type==="EMAIL_VERIFICATION"){
      //mark email as verified in db
      await User.findByIdAndUpdate({_id:userId},{isEmailVerified:true});
    }

    // res.status(200).json({ success: true, data: { message: "Otp Verified." } });
    return { success: true, data: { message: "Otp Verified." } };
  } catch (err) {
    return { success: false, error: { message: err.message } };
  }
}



