import { Document, model, Schema } from 'mongoose';


export interface IUserModel extends Document {
  email: string;
  password: string;
  clients_id?: Schema.Types.ObjectId[];
  isAdmin: boolean;
  createdAt?: string | Date;
}

const UserSchema = new Schema<IUserModel>(
  {
    email: {
      type: String,
      required: [true, 'נא להזין אימייל'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Missing Password'],
      minlength: [4, 'Password Too Short.'],
      maxlength: [150, 'Password Too long.'],
      trim: true,
    },
    clients_id: {
      type: [Schema.Types.ObjectId],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    id: false,
  }
);

export const UserModel = model<IUserModel>('UserModel', UserSchema, 'users');
