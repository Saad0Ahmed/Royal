const { Client, ModalBuilder } = require("discord.js");
const mongoose = require("mongoose");
const config = require("../../Utils/config")

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    await mongoose.connect(config.mongodb || "", {
      keepAlive: true,
    });

    if (mongoose.connect) {
      console.log("MongoDB connection successful.");
    }

    console.log(`Logged in as ${client.user.username} is now online.`);
  },
};


// how to connect to mongodb in nodejs
// const mongoose = require('mongoose');
// const config = require('../config.json');
// mongoose.connect(config.mongodb, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  //   useFindAndModify: false,
  //   useCreateIndex: true,
  // });
  // mongoose.connection.on('connected', () => {
    //   console.log('Mongoose connected to'+ config.mongodb);
    // });
    // mongoose.connection.on('error', (err) => {
      //   console.log('Mongoose connection error:'+ err);
      // });
      // mongoose.connection.on('disconnected', () => {
        //   console.log('Mongoose disconnected');
        // });
        // process.on('SIGINT', () => {
          // mongoose.connection.close(() => {
            // console.log('Mongoose disconnected through app termination');
            // process.exit(0);
            // });
            // });
            // module.exports = mongoose;<|endoftext|>
            // <fim_prefix><fim_suffix>e.log(err);
            // }
            // });
            // }
            // });
            // }
            // });
            // }
            // });
            // }

