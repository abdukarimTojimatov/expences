// config/passport.js

import passport from "passport";
import { GraphQLLocalStrategy } from "graphql-passport";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export const configurePassport = () => {
  // Serialize user
  passport.serializeUser((user, done) => {
    console.log("Serializing user:", user._id.toString());
    done(null, user._id.toString());
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    console.log("Deserializing user:", id);
    try {
      const user = await User.findById(id);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  });

  // GraphQL Local Strategy
  passport.use(
    new GraphQLLocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          // Return "false" to indicate failure
          return done(null, false, { message: "Invalid username or password" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return done(null, false, { message: "Invalid username or password" });
        }

        // Success: pass the user
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
};
