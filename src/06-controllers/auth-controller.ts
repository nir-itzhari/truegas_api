import express, { NextFunction, Request, Response } from 'express';
import { CredentialsModel } from '../03-models/credentials-model';
import { UserModel } from '../03-models/user-model';
import authLogic from '../05-logic/auth-logic';
import { sendResetEmail } from '../01-utils/email';

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


router.post('/forgot-password', async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email } = request.body;

    const resetToken = authLogic.saveResetToken(email)

    // Send reset email
    await sendResetEmail(email, resetToken);

    response.status(200).json({ message: 'Password reset email sent.' });
  } catch (error) {
    console.error('Error:', error);
    next(error)
  }
});


router.get('/reset-password/:token', async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { token } = request.query
    const isTokenValid = await authLogic.checkUserResetToken(token.toString())

    response.render('reset-password', { token });
  } catch (error) {
  }
});


router.post('/reset-password', async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = request.body;
    await authLogic.resetPassword(newPassword, token)

    response.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error:', error);
    next(error)
  }
});


export default router;
