const express = require("express");
const router = express.Router();
const axios = require("axios");



router.post("/payement", async (req, res) => {
  const url = "https://developers.flouci.com/api/generate_payment";
  const payload = {
    app_token: "cf57060b-a87e-48e6-9eb1-3f44e988f182",
    app_secret: process.env.FLOUCI_SECRET,
    amount: req.body.amount,
    accept_card: "true",
    session_timeout_secs: 2000,
    success_link: "http://localhost:4200/payment-success",
    fail_link: "http://localhost:4200/payment-fail",
    developer_tracking_id: "a838b500-ef34-42b4-b783-cc1712f1c22f",
  };

  await axios
    .post(url, payload)
    .then((result) => {
      res.send(result.data);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/verify/:id", async (req, res) => {
  const id_payement = req.params.id;

  await axios
    .get(`https://developers.flouci.com/api/verify_payment/${id_payement}`, {
      headers: {
        "Content-Type": "application/json",
        apppublic: "cf57060b-a87e-48e6-9eb1-3f44e988f182",
        appsecret: process.env.FLOUCI_SECRET,
      },
    })
    .then((result) => {
      res.send(result.data);
    })
    .catch((err) => {
      console.log(err);
    });
});



module.exports = router;
