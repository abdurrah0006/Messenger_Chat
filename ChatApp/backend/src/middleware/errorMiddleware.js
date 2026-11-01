import { env } from "../config/env.js";
import { httpError } from "../utils/httpError.js";

export const notFound = (req, res, next) =>
  next(httpError(404, `Not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;

  if (err.name === "CastError") {
    status = 400;
    message = "Invalid id";
  } else if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  } else if (err.code === 11000) {
    status = 409;
    message = "That value is already in use";
  }

  if (status >= 500) console.error(err);

  res.status(status).json({
    message: status >= 500 && env.isProd ? "Something went wrong" : message,
    ...(env.isProd ? {} : { stack: err.stack }),
  });
};

export default errorMiddleware;
