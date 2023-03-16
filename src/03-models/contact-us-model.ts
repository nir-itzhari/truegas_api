import mongoose from 'mongoose';


export interface IContactUsModel extends Document {
    name: string;
    email: string;
    subject: string;
    message: string;
}

// Define a new schema for the ContactUsModel
const ContactUsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
});

// Define the ContactUsModel based on the schema
const ContactUsModel = mongoose.model('ContactUs', ContactUsSchema, 'contact-us');

export default ContactUsModel;