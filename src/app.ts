import dotenv from "dotenv";
dotenv.config();
import ErrorModel from "./03-models/error-model";
import mongoose from "mongoose";
mongoose.set('strictQuery', false);
import dal from "./04-dal/dal"
dal.connect()
import express, { NextFunction, Request, Response } from "express";
import config from "./01-utils/config";
import cors from "cors";
import fileUpload from 'express-fileupload';
import errorsHandler from "./02-middleware/errors-handler";
import authController from "./06-controllers/auth-controller";
import assignmentController from "./06-controllers/assignment-controller";
import clientController from "./06-controllers/client-controller";
import userController from "./06-controllers/user-controller";
import checkStatusController from "./06-controllers/check-status-controller";
import imagesController from "./06-controllers/images-controller";


const expressServer = express();

if (config.isDevelopment) {
    expressServer.use(cors());
}

expressServer.use(express.json());
expressServer.use(fileUpload());
expressServer.use("/api", checkStatusController);
expressServer.use("/api", authController);
expressServer.use("/api", assignmentController);
expressServer.use("/api", clientController);
expressServer.use("/api", userController);
expressServer.use("/api", imagesController);

expressServer.use("*", (request: Request, response: Response, next: NextFunction) => {
    next(new ErrorModel(404, "Route not found."));
});

expressServer.use(errorsHandler);
expressServer.listen(process.env.PORT, () => console.log("Listening... PORT: " + process.env.PORT));
