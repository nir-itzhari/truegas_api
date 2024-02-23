import { Document, model, Schema } from 'mongoose';

export interface IUserModel extends Document {
  user_id: number;
  password: string;
  assignment_id: Schema.Types.ObjectId[];
  isAdmin: boolean;
  createdAt: string | Date;
}

const UserSchema = new Schema<IUserModel>(
  {
    user_id: {
      type: Number,
      required: [true, 'Missing User Id'],
      minlength: [7, 'Id Too Short.'],
      maxlength: [14, 'Id Too long.'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Missing Password'],
      minlength: [4, 'Password Too Short.'],
      maxlength: [150, 'Password Too long.'],
      trim: true,
    },
    assignment_id: {
      type: [Schema.Types.ObjectId],
    },
    isAdmin: Boolean,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    id: false,
  }
);

export const UserModel = model<IUserModel>('UserModel', UserSchema, 'users');
