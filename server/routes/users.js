// server/routes/users.js
const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");

// User Registration
router.post("/", async (req, res) => {
	try {
		// Validate request data
		const { error } = validate(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message });

		// Check if user already exists
		const existingUser = await User.findOne({ email: req.body.email });
		if (existingUser)
			return res
				.status(409)
				.send({ message: "User with given email already exists!" });

		// Hash password
		const salt = await bcrypt.genSalt(Number(process.env.SALT));
		const hashPassword = await bcrypt.hash(req.body.password, salt);

		// Create new user with role
		const newUser = await new User({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			password: hashPassword,
			role: req.body.role || 'candidate' // Default to candidate if no role provided
		}).save();

		res.status(201).send({ 
			message: "User created successfully",
			user: {
				id: newUser._id,
				email: newUser.email,
				firstName: newUser.firstName,
				lastName: newUser.lastName,
				role: newUser.role
			}
		});
	} catch (error) {
		console.error("Signup error:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
});

module.exports = router;