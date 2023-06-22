import express from "express";
import { Client } from "../index.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", async (request, respond) => {
  const data = request.body;

  let result = await Client.db("songdata").collection("songs").insertMany(data);
  respond.status(200).send({ message: "song uploaded successfully", result });
});

router.get("/", async (request, respond) => {
  let result = await Client.db("songdata")
    .collection("songs")
    .find({})
    .toArray();
  respond.status(200).send({ message: "songs fetched successfully", result });
});

export default router;
