import { ICredentialsModel } from '../03-models/credentials-model';
import { IUserModel, UserModel } from '../03-models/user-model';
import ErrorModel from '../03-models/error-model';
import cyber from '../01-utils/cyber';

async function isUserIdFree(user_id: number): Promise<boolean> {
  const count = await UserModel.countDocuments({ user_id: user_id }).exec();

  return count === 0;
}

async function register(user: IUserModel): Promise<string> {

  try {
    await user.validate();
  } catch (error) {
    throw new ErrorModel(400, error.message);
  }

  const existingUser = await isUserIdFree(user.user_id);
  if (!existingUser) {
    throw new ErrorModel(400, `שם משתמש ${user.user_id} תפוס`)
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
  } catch (error) {
    throw new ErrorModel(400, error.message);
  }

  // Hash password:
  credentials.password = cyber.hash(credentials.password);

  const users = await UserModel.find({
    user_id: credentials.user_id,
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


export default {
  register,
  login,
};
