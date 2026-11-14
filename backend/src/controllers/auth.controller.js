import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const getJwtSecret = () => process.env.JWT_SECRET || "SECRET_KEY_SCHOOL_MS_2026";

export const signUp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Public registration restricted to student and guardian
    if (!["student", "guardian"].includes(role)) {
      return res.status(403).json({
        message: "Registration for this role is restricted. Contact admin.",
      });
    }

    const isFound = await User.findOne({ email: email.toLowerCase().trim() });

    if (isFound) {
      return res.status(409).json({
        message: "User already exists with this email address",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, getJwtSecret(), {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.log("Signup error:", err);
    return res.status(500).json({
      message: "Signup error",
    });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const isFound = await User.findOne({ email: email.toLowerCase().trim() });

    if (!isFound) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    const isMatch = await bcrypt.compare(password, isFound.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect password. Please try again.",
      });
    }

    const token = jwt.sign({ id: isFound._id }, getJwtSecret(), {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "User login successfully",
      token,
      user: {
        _id: isFound._id,
        name: isFound.name,
        email: isFound.email,
        role: isFound.role,
      },
    });

  } catch (err) {
    console.log("Login error:", err);
    return res.status(500).json({
      message: "Something went wrong during login",
    });
  }
};


export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    message: "Logged out successfully",
  });
};

export const getMe = (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
};
