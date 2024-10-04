const mongoose = require("mongoose");
const url = process.env.MONGO_URL;
const dbConnect = async () => {
  await mongoose
    .connect(url)
    .catch((err) => {
      console.log(err);
    })
    .then(() => {
      console.log("DB Connected");
    });
};

dbConnect();
