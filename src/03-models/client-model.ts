import { Document, model, Schema } from 'mongoose';
import { AssignmentModel } from './assignment-model';

export interface IClientModel extends Document {
    fullName: string;
    city: string;
    street: string;
    buildingNumber: number;
    floor: number;
    apartmentNumber: number;
    phoneNumber: number[];
    assignment_id: Schema.Types.ObjectId[];
    createdAt: string | Date
}

const ClientSchema = new Schema<IClientModel>(
    {
        fullName: {
            type: String,
            required: [true, 'Missing Last Name '],
            minlength: [2, 'Last name Too Short.'],
            maxlength: [50, 'Last name Too long.'],
            trim: true,
        },
        city: {
            type: String,
            minlength: [2, 'City Too Short.'],
            maxlength: [50, 'City Too long.'],
            trim: true,
        },
        street: {
            type: String,
            minlength: [2, 'Street Too Short.'],
            maxlength: [50, 'Street Too long.'],
            trim: true,
        },
        buildingNumber: {
            type: Number,
            required: [true, "Building Number is missing"],
            min: [1, 'Building Number must be more then 0.'],
            max: [200, 'Building Number not exist.'],
            trim: true,
        },
        apartmentNumber: {
            type: Number,
            required: [true, "Apartment number is missing"],
            min: [1, 'Apartment Number must be more then 0.'],
            max: [200, 'Apartment Number not exist.'],
            trim: true,
        },
        floor: {
            type: Number,
            required: [true, "Floor number is missing"],
            min: [1, 'Floor Number must be more then 0.'],
            max: [200, 'Floor Number not exist.'],
            trim: true,
        },
        phoneNumber: {
            type: [Number],
            required: [true, "Phone number is missing"],
            minlength: [9, 'Phone Number must be more then 8 digits.'],
            max: [10, 'Phone Number cannot be more then 8 digits.'],
        },
        assignment_id: {
            type: [Schema.Types.ObjectId],
        },
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

ClientSchema.virtual('assignment', {
    ref: AssignmentModel,
    localField: 'assignment_id',
    foreignField: '_id',
});

export const ClientModel = model<IClientModel>('ClientModel', ClientSchema, 'clients');
