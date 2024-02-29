import mongoose, { Document, model, Schema } from 'mongoose';
import { UploadedFile } from 'express-fileupload';
import { ImageModel } from './image-model';
import { validateDateString } from '../01-utils/validations';



export interface IAssignmentModel extends Document {
    date: string;
    title: string;
    description: string;
    user_id: mongoose.Types.ObjectId;
    client_id: Schema.Types.ObjectId;
    image_id: mongoose.Types.ObjectId[];
    imageFile: UploadedFile[];
    isDone: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignmentModel>({
    date: {
        type: String,
    },
    description: {
        type: String,
        minlength: [2, 'Too short.'],
        maxlength: [10000, 'Too long.'],
        trim: true
    },
    title: {
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
        type: [mongoose.Types.ObjectId],
        ref: ImageModel
    },
    imageFile: {
        type: [Object]
    },
    isDone: {
        type: Boolean
    },
    createdAt: Date
    ,
    updatedAt: Date

},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true },
        id: false,
    });

AssignmentSchema.pre('save', function (next) {
    const now = new Date();
    this.createdAt = new Date(now.getTime() + (2 * 60 * 60 * 1000));
    this.updatedAt = new Date(now.getTime() + (2 * 60 * 60 * 1000));
    next();
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