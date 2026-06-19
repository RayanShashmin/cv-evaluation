const mongoose = require("mongoose");

module.exports = () => {
  const connectionParams = {
    // Remove these deprecated options:
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  };

  try {
    mongoose.connect(process.env.DB, connectionParams);
    console.log("Connected to database successfully");
  } catch (error) {
    console.log(error);
    console.log("Could not connect to database!");
  }
};