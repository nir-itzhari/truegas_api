import express, { NextFunction, Request, Response } from "express"
import path from "path"
import verifyLoggedIn from "../02-middleware/verify-logged-in";


const router = express.Router()

router.get("/images/:imageName", async (request: Request, response: Response, next: NextFunction) => {
    try {
        const imageName = request.params.imageName;
        const absolutePath = path.join(__dirname, "..", "assets", "images", imageName);
        response.sendFile(absolutePath);
    }
    catch (err: any) {
        next(err);
    }
});


export default router