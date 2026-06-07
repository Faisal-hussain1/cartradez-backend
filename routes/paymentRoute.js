const express = require("express");
const crypto = require("crypto");
const Vehicles = require("../models/VehiclesModel");
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const generateSignature = (data, passphrase = "") => {
  // PayFast requires this exact field order
  const fieldOrder = [
    "merchant_id",
    "merchant_key",
    "return_url",
    "cancel_url",
    "notify_url",
    "name_first",
    "name_last",
    "email_address",
    "cell_number",
    "m_payment_id",
    "amount",
    "item_name",
    "item_description",
    "custom_int1",
    "custom_int2",
    "custom_int3",
    "custom_int4",
    "custom_int5",
    "custom_str1",
    "custom_str2",
    "custom_str3",
    "custom_str4",
    "custom_str5",
    "email_confirmation",
    "confirmation_address",
  ];

  // Build string using only fields present in data, in correct order
  const pfOutput = fieldOrder
    .filter((key) => data[key] !== undefined && data[key] !== null && data[key] !== "")
    .map((key) => `${key}=${encodeURIComponent(data[key].toString().trim()).replace(/%20/g, "+")}`)
    .join("&");

  const getString = passphrase
    ? `${pfOutput}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`
    : pfOutput;

  return crypto.createHash("md5").update(getString).digest("hex");
};

router.post("/", authMiddleware, async (req, res) => {
  const { userId, vehicleId, currency, image, make, model, listingType, price } = req.body;

  try {
    if (String(req.jwtToken?._id) !== String(userId)) {
      return res.status(403).json({error: 'Unauthorized payment request'});
    }

    const paymentData = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,

     return_url: `http://localhost:3000/payment-success`,
cancel_url: `http://localhost:3000/payment-failed`,
      notify_url: `${process.env.NGROK_URL}/api/v1/payment/itn`,

      name_first: "Sohaib",
      name_last: "Imran",
      email_address: "sohaibsheikh6299@gmail.com",

      m_payment_id: vehicleId,
      amount: price.toFixed(2),
      item_name: `${make} ${model} - ${listingType}`,

      custom_str1: userId,
      custom_str2: listingType,
    };

    // 🔐 Signature
    paymentData.signature = generateSignature(paymentData, process.env.PAYFAST_PASSPHRASE);

    res.json(paymentData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const generateSignatureFromITN = (data, passphrase = "") => {
  const pfOutput = Object.entries(data)
    .filter(([key, val]) => key !== "signature" && val !== "")
    .map(([key, val]) => `${key}=${encodeURIComponent(val.toString().trim()).replace(/%20/g, "+")}`)
    .join("&");

  const getString = passphrase
    ? `${pfOutput}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`
    : pfOutput;

  return crypto.createHash("md5").update(getString).digest("hex");
};

router.post("/itn", express.urlencoded({ extended: false }), async (req, res) => {
  const data = req.body;

  try {
    // 🔥 remove signature before generating
    const pfData = { ...data };
    delete pfData.signature;

    const signature = generateSignatureFromITN(
      pfData,
      process.env.PAYFAST_PASSPHRASE
    );

    if (signature !== data.signature) {
      return res.status(400).send("Invalid signature");
    }

    if (data.payment_status === "COMPLETE") {
      const vehicleId = data.m_payment_id;
      const listingType = data.custom_str2?.toLowerCase();

      await Vehicles.findByIdAndUpdate(
        {_id:vehicleId},
        { listingType },
        { new: true }
      );

      console.log("✅ PayFast Payment Success:", data);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});


module.exports=router;
