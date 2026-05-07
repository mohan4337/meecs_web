const User = require("../models/User");
const { success, error, validationError } = require("../utils/response");

// @desc   Get all users
// @route  GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password if exists
    
    if (users.length === 0) {
      return success(res, { users: [] }, 200);
    }
    
    return success(res, { users }, 200);
  } catch (err) {
    console.error("Get Users Error:", err);
    return error(res, "Failed to fetch users", 500, err.message);
  }
};

// @desc   Create user
// @route  POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return validationError(res, [{ field: "name", message: "Name is required" }]);
    }

    if (!email || !email.trim()) {
      return validationError(res, [{ field: "email", message: "Email is required" }]);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return validationError(res, [{ field: "email", message: "Invalid email format" }]);
    }

    // Create user
    const user = await User.create({ 
      name: name.trim(), 
      email: email.trim().toLowerCase() 
    });

    return success(res, { user }, 201);
  } catch (err) {
    console.error("Create User Error:", err);
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return error(res, "User with this email already exists", 409);
    }
    
    // Handle validation error
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }));
      return validationError(res, errors);
    }
    
    return error(res, "Failed to create user", 500, err.message);
  }
};
