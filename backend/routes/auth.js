const express = require("express");
const User = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const router = express.Router();
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const UserToken = require("../models/UserToken");
dotenv.config();

// Register
router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword)
    return res.status(400).json({ message: "Password does not match" });

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "Please fill all fields" });
  }
  try {
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Use different secrets based on role
    const secretKey =
      user.role === "admin"
        ? process.env.JWT_ADMIN_SECRET
        : process.env.JWT_SECRET;

    const token = jwt.sign({ id: user._id, role: user.role }, secretKey, {
      expiresIn: "7h",
    });

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Google OAuth Strategy
const generateUniqueUsername = async (baseUsername) => {
  let username = baseUsername;
  let counter = 1;

  while (await User.findOne({ username })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          const uniqueUsername = await generateUniqueUsername(
            profile.displayName
          );

          user = new User({
            username: uniqueUsername,
            email: profile.emails[0].value,
            password: bcrypt.hashSync(profile.id, 10),
          });

          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.send(`
      <script>
        window.opener.postMessage(${JSON.stringify({
          token,
          role: req.user.role,
        })}, "http://localhost:4200");
        window.close();
      </script>
    `);
  }
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

//send reset email
router.post("/send-email", async (req, res, next) => {
  const email = req.body.email;
  // check if the user exists
  const user = await User.findOne({
    email: { $regex: "^" + email + "$", $options: "i" },
  });
  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: "User not found to reset the email" });
  }
  //generate jwt for pwd reset
  const payload = {
    email: user.email,
  };
  const expiryTime = 300; //valid for 5 min
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiryTime,
  });

  //save the token in the db
  const newToken = new UserToken({
    userId: user._id,
    token: token,
  });

  //configure SMTP transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //email details
  let mailDetails = {
    from: "oumou159@gmail.com",
    to: email,
    subject: "Reset Password!",
    html: `
    <html>
  <head>
      <title>Password Reset Request</title>
  </head>
  <body>
      <h1>Password Reset Request</h1>
      <p>Dear ${user.username},</p>
      <p>We have received a request to reset your password for your account with Evara. To complete the password reset process, please click on the button below:</p>
      <a href="${process.env.LIVE_URL}/reset/${token}">
          <button style="background-color: hsl(176, 88%, 27%); color: white; padding: 14px 20px; border: none; cursor: pointer; border-radius: 4px;">
              Reset Password
          </button>
      </a>
      <p>Please note that this link is only valid for a limited time. If you did not request a password reset, please disregard this message.</p>
      <p>Thank you.</p>
      <p>Let's Program Team</p>
  </body>
  </html>
    `,
  };

  //send email
  transporter.sendMail(mailDetails, async (err, data) => {
    if (err) {
      console.error("Error sending email:", err);
      return res.status(500).json({
        success: false,
        message: "Something went wrong while sending the email",
      });
    } else {
      await newToken.save(); //save token
      return res
        .status(200)
        .json({ success: true, message: "Email sent successfully" });
    }
  });
});

// reset password
router.post("/reset-password", async (req, res, next) => {
  const token = req.body.token;
  const password = req.body.password;

  try {
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // find user by email
    const user = await User.findOne({
      email: { $regex: "^" + decoded.email + "$", $options: "i" },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    // hash new password
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt); // Correction ici

    // update password and save user
    user.password = encryptedPassword;
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Password Reset Success!" });
  } catch (err) {
    console.error("Error resetting password:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Reset Link is Expired or Invalid!",
    });
  }
});
module.exports = router;
