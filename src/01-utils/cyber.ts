import jwt from 'jsonwebtoken';
import { IUserModel } from '../03-models/user-model';
import crypto from 'crypto';
import ErrorModel from '../03-models/error-model';

const salt = 'MakeThingsGoRight';
const secretKey = 'AbraKadabraHokusFokus';

function hash(plainText: string): string {
  if (!plainText) return null;

  const hashedText = crypto
    .createHmac('sha512', salt)
    .update(plainText)
    .digest('hex'); 

  return hashedText;
}

function getNewToken(user: IUserModel): string {
  const payload = { user };
  const token = jwt.sign(payload, secretKey); 

  return token;
}

function verifyToken(autorizationHeader: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (!autorizationHeader) {
      resolve(false);
      return;
    }

    const token = autorizationHeader.split(' ')[1];

    if (!token) {
      resolve(false);
      return;
    }

    jwt.verify(token, secretKey, (error) => {
      if (error) {
        resolve(false);
        return;
      }

      resolve(true);
    });
  });
}

function getUserFromToken(autorizationHeader: string): IUserModel {

  const token = autorizationHeader.split(' ')[1];

  const payload: any = jwt.decode(token);

  const user = payload.user;

  return user;
}


function decodeResetToken(hashedResetToken: string): string {
  try {
    const payload: any = jwt.decode(hashedResetToken);

    const resetToken: string = payload?.resetToken;

    if (!resetToken) {
      throw new ErrorModel(404, 'Reset token not found');
    }

    return resetToken;
  } catch (error) {
    throw new ErrorModel(404, 'Invalid reset token');
  }
}

export default {
  hash,
  getNewToken,
  verifyToken,
  getUserFromToken,
  decodeResetToken
};
