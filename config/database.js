if (process.env.NODE_ENV === "production") {
  module.exports = {
    mongoURI:
      "mongodb+srv://vlad123:vlad123@cluster0.k5s12.mongodb.net/vidjot?retryWrites=true&w=majority",
  };
} else {
  module.exports = {
    mongoURI: "mongodb://localhost/vidjot-dev",
  };
}
