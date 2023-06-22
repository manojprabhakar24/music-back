import { Client } from "../index.js";
import nodemailer from "nodemailer";
import bycrpt from "bcrypt";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

export async function getUserEmail(email) {
  let result = await Client.db("userDetails")
    .collection("user")
    .findOne({ email: email });
  return result;
}

export async function getUserName(username) {
  let result = await Client.db("userDetails")
    .collection("user")
    .findOne({ username: username });
  return result;
}

export async function generatehashpassword(password) {
  const noOfRounds = 10;
  const salt = await bycrpt.genSalt(noOfRounds);
  const hashpassword = await bycrpt.hash(password, salt);
  return hashpassword;
}

export async function getOTP(OTP) {
  let result = await Client.db("userDetails")
    .collection("user")
    .findOne({ OTP: OTP });
  return result;
}

export function OTPerase(OTP) {
  return Client.db("userDetails")
    .collection("user")
    .updateOne({ OTP: OTP }, { $set: { OTP: 0 } });
}

export function passwordReset(OTP, hashpass) {
  return Client.db("userDetails")
    .collection("user")
    .updateOne({ OTP: OTP }, { $set: { password: hashpass } });
}
