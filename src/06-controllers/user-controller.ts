import express, { NextFunction, Request, Response } from 'express';
import { UserModel } from '../03-models/user-model';
import userLogic from '../05-logic/user-logic';
import { Schema } from 'mongoose';

const router = express.Router();


router.get('/users', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await userLogic.getAllUsers();
        response.status(200).json(users);
    } catch (err: any) {
        next(err);
    }
}
);


router.get('/users/:_id', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const { _id } = request.params
        const userId = new Schema.Types.ObjectId(_id)
        const user = await userLogic.getUserById(userId);
        response.status(200).json(user);
    } catch (err: any) {
        next(err);
    }
}
);


router.post('/users', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const user = new UserModel(request.body);
        const addedUser = await userLogic.addUser(user);

        response.status(201).json(addedUser);
    } catch (err: any) {
        next(err);
    }
}
);

export default router;