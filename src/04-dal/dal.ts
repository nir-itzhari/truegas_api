import mongoose from "mongoose"
import config from "../01-utils/config"
import ErrorModel from './../03-models/error-model';
import os from 'os';
import nodeMailer from 'nodemailer';
import { IContactUsModel } from "../03-models/contact-us-model";

let isConnected = false;


export async function connectToDatabase() {
}

const connect = async (): Promise<void> => {
    if (isConnected) {
        console.log('Already connected to MongoDB');
        return;
    }
    try {
        console.log(os.hostname())
        const db = await mongoose.connect(os.hostname() === 'truegasdocker' ? config.dockerConnectionString : config.connectionString)
        console.log("We're connected to MongoDB " + db.connections[0].name)
        isConnected = true;
    } catch (error: any) {
        throw new ErrorModel(400, error.message)
    }
}


const transponder = nodeMailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.USER_MAIL,
        pass: process.env.PASS_MAIL
    }
})

const mailSend = (contactUs: IContactUsModel): Promise<any> => {
    return new Promise<any>((resolve, reject) => {

        const mailOptions = {
            from: contactUs.email,
            to: process.env.USER_MAIL,
            subject: `${contactUs.email}:  ${contactUs.subject}`,
            html: `
            <div style="direction: ltr">
            <h1>Contact From NW-tst</h1>
            <p><b>Name:</b> ${contactUs.name}</p>
            <p><b>Subject:</b> ${contactUs.subject}<br /></p>
            <p><b>Message:</b><i> ${contactUs.message}</i></p>
            </div>`
        }

        transponder.sendMail(mailOptions, (err, info) => {
            if (err) return reject(err)

            resolve(info.response)
        })

    })

}


export async function closeDatabaseConnection() {
    if (!isConnected) {
        console.log('Not connected to MongoDB');
        return;
    }

    try {
        await mongoose.disconnect();
        isConnected = false;
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
        throw error;
    }
}


process.on('SIGINT', async () => {
    console.log('Received SIGINT signal, closing MongoDB connection');
    await closeDatabaseConnection();
    process.exit(0);
});
export default {
    connect,
    // mailSend
}