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
      required: [true, 'נא להזין סיסמה'],
      minlength: [5, 'אורך סיסמה מינימום 5 תווים'],
      maxlength: [30, 'אורך סיסמה עד 30 תווים'],
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
