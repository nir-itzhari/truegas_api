import { ICredentialsModel } from '../03-models/credentials-model';
import { IUserModel, UserModel } from '../03-models/user-model';
import ErrorModel from '../03-models/error-model';
import cyber from '../01-utils/cyber';

async function isUserIdFree(email: string): Promise<boolean> {
  const count = await UserModel.countDocuments({ email: email }).exec();

  return count === 0;
}

async function register(user: IUserModel): Promise<string> {

  try {
    await user.validate();
  } catch (error) {
    throw new ErrorModel(400, error.message);
  }

  const existingUser = await isUserIdFree(user.email);
  if (!existingUser) {
    throw new ErrorModel(400, `שם משתמש ${user.email} תפוס`)
  }


  user.password = cyber.hash(user.password);

  user.save();
  delete user.password;

  const token = cyber.getNewToken(user);
  return token;
}


async function login(credentials: ICredentialsModel): Promise<string> {

  try {
    await credentials.validate();
  } catch (error: any) {
    throw new ErrorModel(400, error.errors.password.message);
  }
  // Hash password:
  credentials.password = cyber.hash(credentials.password);

  const users = await UserModel.find({
    email: credentials.email,
    password: credentials.password,
  }).exec();

  if (users.length === 0) {
    throw new ErrorModel(401, 'שם משתמש או סיסמה אינם נכונים');
  }

  const user = users[0];
  delete user.password;

  const token = cyber.getNewToken(user);
  return token;
}



async function saveResetToken(email: string): Promise<string> {
  // Find user by email
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new ErrorModel(404, 'User not found');
  }

  // Generate reset token
  const resetToken = cyber.hash(email)

  // Update user with reset token
  user.resetToken = resetToken;
  await user.save()

  return resetToken
}


async function checkUserResetToken(token: string): Promise<boolean> {
  const user = await UserModel.findOne({ resetToken: token });

  if (!user) {
    throw new ErrorModel(404, 'Invalid or expired token');
  }

  return true
}



async function resetPassword(newPassword: string, token: string): Promise<void> {


  const user = await UserModel.findOne({ resetToken: token });

  if (!user) {
    throw new ErrorModel(404, 'Invalid or expired token');
  }
  user.password = cyber.hash(newPassword);
  user.resetToken = undefined;
  await user.save();

}


export default {
  register,
  login,
  resetPassword,
  checkUserResetToken,
  saveResetToken
};
