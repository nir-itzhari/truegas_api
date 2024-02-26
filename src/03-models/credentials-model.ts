import { Document, model, Schema } from 'mongoose';

export interface ICredentialsModel extends Document {
  email: string;
  password: string;
}

const CredentialsSchema = new Schema<ICredentialsModel>(
  {
    email: {
      type: String,
      required: [true, 'נא להזין אימייל'],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Missing Password'],
      minlength: [5, 'Password Too Short.'],
      maxlength: [8, 'Password Too long.'],
      trim: true,
    },
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    id: false,
  }
);

export const CredentialsModel = model<ICredentialsModel>('CredentialsModel', CredentialsSchema, 'users');
