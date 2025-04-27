require("dotenv").config();
import express from "express";
import mongoose from "mongoose";
import errorMiddleware from "./middlewares/error-middleware";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import logger from "./logging/logger";
import httpLogger from "./logging/httpLogger";
import cookieSession from "cookie-session";
import authRoute from "./routes/auth-route";
import userRoute from "./routes/user-route";
import blogRoute from "./routes/blog-route";

const app = express();
const COOKIE_SECRET_KEY = process.env.COOKIE_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL_DEVELOPMENT;
const FRONTEND_URL_DEVELOPMENT = process.env.FRONTEND_URL_DEVELOPMENT;
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;

if (!COOKIE_SECRET_KEY) {
  throw new Error("COOKIE_SECRET_KEY is missing in environment variables.");
}
if (!MONGO_URL) {
  throw new Error("MONGO_URL is missing in environment variables.");
}

const allowedOrigins = [FRONTEND_URL, FRONTEND_URL_DEVELOPMENT].filter(
  (url): url is string => Boolean(url)
);

const corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(httpLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  limit: 60, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

app.use(limiter);

// Security middleware
app.use(helmet());

// set up session cookies
app.use(
  cookieSession({
    maxAge: 1 * 60 * 60 * 1000, // 1hour
    keys: [COOKIE_SECRET_KEY],
    httpOnly: true, // Ensure cookies are not accessible via client-side JS
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production", // Only use secure cookies in production
  })
);

// set up routes
app.use("/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/blogs", blogRoute);

app.get("/", (req, res) => {
  logger.info("Hello world, welcome to geodevcodes API, thank you geodevcodes");
  res.send("Hello world, welcome to geodevcodes API, thank you geodevcodes");
});

app.use(errorMiddleware);

mongoose.set("strictQuery", false);
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB!");
    app.listen(PORT, () => {
      // console.log(`Geomatic Connect API is running on Port ${PORT} 🚀`);
      logger.info(`Geomatic Connect API is running on Port ${PORT} 🚀`);
    });
  })
  .catch((error) => {
    // console.log(error);
    logger.error(error);
  });
