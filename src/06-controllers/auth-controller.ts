import express, { NextFunction, Request, Response } from 'express';
import { CredentialsModel } from '../03-models/credentials-model';
import { UserModel } from '../03-models/user-model';
import authLogic from '../05-logic/auth-logic';

const router = express.Router();

router.post('/auth/signup', async (request: Request, response: Response, next: NextFunction) => {
  try {
    console.log(request.body)
    const user = new UserModel(request.body);
    const token = await authLogic.register(user);

    response.status(201).json(token);

  } catch (error: any) {
    next(error);
  }
}
);

router.post('/auth/signin', async (request: Request, response: Response, next: NextFunction) => {
  try {
    console.log("Login....")
    const credentials = new CredentialsModel(request.body);
    const token = await authLogic.login(credentials);
    response.json(token);

    if (token) console.log("Login Success.")
  } catch (error: any) {
    next(error);
  }
}
);

export default router;
