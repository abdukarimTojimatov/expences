import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import passport from "passport";
import session from "express-session";
import connectMongo from "connect-mongodb-session";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { buildContext } from "graphql-passport";

import mergedResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typeDefs/index.js";
import { connectDB } from "./db/connectDB.js";

// ---- Import your Passport config function
import { configurePassport } from "./config/passport.js";

dotenv.config();

const __dirname = path.resolve();
const app = express();
const httpServer = http.createServer(app);

// 1. Configure your session store
const MongoDBStore = connectMongo(session);
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

// Optional: listen for errors in the session store
store.on("error", (err) => {
  console.error("Session store error:", err);
});

// 2. Call the function that configures Passport
configurePassport();

// 3. Use the session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true, // helps mitigate XSS
    },
  })
);

// 4. Initialize Passport and hook into session
app.use(passport.initialize());
app.use(passport.session());

// 5. Create and start ApolloServer
const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

// 6. Apply middleware
app.use(
  "/graphql",
  cors({
    origin: "http://localhost:3000", // Adjust to your front-end origin
    credentials: true,
  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req, res }) => buildContext({ req, res }),
  })
);

// 7. Connect to MongoDB, then start listening on port 4000
await connectDB();
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));

console.log(`🚀 Server ready at http://localhost:4000/graphql`);
