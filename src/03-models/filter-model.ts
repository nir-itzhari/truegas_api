import { Document, model, Schema } from 'mongoose';


export interface IFilterModel extends Document {
  fullName: string;
  city: string;
  street: string;
  buildingNumber: number;
}

const filterSchema = new Schema<IFilterModel>({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    validate: {
      validator: (fullName: string) => fullName.length >= 1 && fullName.length <= 50,
      message: "Full name should be between 1 and 50 characters"
    }
  },
  city: {
    type: String,
    required: [true, "City is required"],
    validate: {
      validator: (city: string) => city.length >= 1 && city.length <= 50,
      message: "City should be between 1 and 50 characters"
    }
  },
  street: {
    type: String,
    required: [true, "Street is required"],
    validate: {
      validator: (street: string) => street.length >= 1 && street.length <= 50,
      message: "Street should be between 1 and 50 characters"
    }
  },
  buildingNumber: {
    type: Number,
    required: [true, "Building number is required"],
    validate: {
      validator: (buildingNumber: number) => Number.isInteger(buildingNumber),
      message: "Building number must be a number"
    }
  }
});

export const FilterModel = model<IFilterModel>("FilterModel", filterSchema, 'filter');