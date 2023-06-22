import express from "express";
import { Client } from "../index.js";
import bycrpt from "bcrypt";
import Jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
//import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
//dotenv.config();

import {
  OTPerase,
  generatehashpassword,
  getOTP,
  getUserEmail,
  getUserName,
  passwordReset,
} from "../service/users.service.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", async (request, respond) => {
  const { username, password } = request.body;
  //console.log(username, password);
  const fromDB = await getUserName(username);
  //console.log(fromDB);
  if (!fromDB) {
    respond.status(401).send({ message: "Invalid Credentials" });
  } else {
    const passwordCheck = await bycrpt.compare(password, fromDB.password);
    if (passwordCheck) {
      const token = Jwt.sign({ _id: fromDB._id }, process.env.secret_key);
      respond.status(200).send({ message: "Login Successfully", token: token });
    } else {
      respond.status(401).send({ message: "Invalid Credentials" });
    }
  }
});

router.post("/signup", async (request, respond) => {
  const { firstname, lastname, gender, email, username, password } =
    request.body;

  const fromDB_email = await getUserEmail(email);
  const fromDB_username = await getUserName(username);

  if (fromDB_email) {
    respond.status(401).send({ message: "Email ID already Exists" });
  } else if (fromDB_username) {
    respond.status(402).send({ message: "Username already Exists" });
  } else {
    const hashpass = await generatehashpassword(password);
    // console.log(hashpass);
    const result = await Client.db("userDetails").collection("user").insertOne({
      firstname: firstname,
      lastname: lastname,
      gender: gender,
      email: email,
      username: username,
      password: hashpass,
    });
    respond.status(200).send(result);
  }
});

async function getOTPsend(email) {
  const OTP = Math.floor(Math.random() * 1000000 + 1);
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.user,
      pass: process.env.pass,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"manoj M" <manojptn16@gmail.com>', // sender address

    to: email, // list of receivers
    subject: "Capstone - Online Music Player", // Subject line
    text: `your OTP is ${OTP}`, // plain text body
  });
  return OTP;
}

router.post("/forgetpassword", async (request, respond) => {
  const { email } = request.body;
  const checkMail = await getUserEmail(email);
  if (!checkMail) {
    respond.status(401).send({ message: "Email-ID not exist" });
  } else {
    const storeOTP = await getOTPsend(email);
    //console.log(sendMail);
    let result = await Client.db("userDetails")
      .collection("user")
      .updateOne({ email: email }, { $set: { OTP: storeOTP } });
    respond.status(200).send({ message: "OTP sended" });
  }
});

router.post("/verify", async (request, respond) => {
  const { OTP } = request.body;
  //console.log(OTP);
  if (OTP < 6) {
    respond.status(401).send({ message: "OTP Invalid" });
  } else {
    const fromDB_OTP = await getOTP(OTP);
    // console.log(fromDB_OTP);
    if (!fromDB_OTP) {
      respond.status(401).send({ message: "OTP INVALID" });
    } else {
      respond.status(200).send({ message: "OTP VALID" });
    }
  }
});

router.post("/reset", async (request, respond) => {
  const { OTP, password } = request.body;
  // console.log(OTP, password);
  const fromDB_OTP = await getOTP(OTP);
  if (fromDB_OTP) {
    const hashpass = await generatehashpassword(password);
    const passwordSet = await passwordReset(OTP, hashpass);

    const eraseOTP = await OTPerase(OTP);

    respond.status(200).send({ message: "Password reset Successfull" });
  } else {
    respond.status(401).send({ message: "OTP INVALID" });
  }
});

export default router;
