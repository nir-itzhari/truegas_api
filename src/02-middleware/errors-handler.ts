import { NextFunction, Request, Response } from "express";
import config from "../01-utils/config";

const errorsHandler = (err: any, request: Request, response: Response, next: NextFunction): void => {

    const status = err.status || 500;
    console.log(err.message)
    let msg;
    if (config.isDevelopment) {
        msg = err.message;
    }
    else if (status !== 500) {
        msg = err.message;
    }
    else {
        msg = "Some error, please try again...";
    }

    response.status(status).send(msg);
}

export default errorsHandler;