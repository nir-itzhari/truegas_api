import { Document, model, Schema } from 'mongoose';
import { UploadedFile } from 'express-fileupload';
import { ImageModel } from './image-model';
import { validateDateString } from '../01-utils/validations';


export interface IAssignmentModel extends Document {
    date: Date;
    description: string;
    user_id: Schema.Types.ObjectId;
    client_id: Schema.Types.ObjectId;
    image_id: Schema.Types.ObjectId[];
    imageFile: UploadedFile[];
    isDone: boolean;
}

const AssignmentSchema = new Schema<IAssignmentModel>({
    date: {
        type: Date,
        set: (value: string): Date => {
            return validateDateString(value)
        }
    },
    description: {
        type: String,
        minlength: [2, 'Too short.'],
        maxlength: [10000, 'Too long.'],
        trim: true
    },
    client_id: {
        type: Schema.Types.ObjectId,
    },
    user_id: {
        type: Schema.Types.ObjectId,
    },
    image_id: {
        type: [Schema.Types.ObjectId],
        ref: ImageModel
    },
    imageFile: {
        type: [Object]
    },
    isDone: {
        type: Boolean
    }
},
    {
        versionKey: false,
        toJSON: { virtuals: true },
        id: false,
    });


const virtuals = ['client', 'user', 'image'];

virtuals.forEach(virtual => {
    const modelName = `${virtual.charAt(0).toUpperCase()}${virtual.slice(1)}Model`;
    AssignmentSchema.virtual(virtual, {
        ref: modelName,
        localField: `${virtual}_id`,
        foreignField: '_id',
    });
});

export const AssignmentModel = model<IAssignmentModel>('AssignmentModel', AssignmentSchema, 'assignment');