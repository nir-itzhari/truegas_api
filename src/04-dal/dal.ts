import mongoose from "mongoose"
import config from "../01-utils/config"
import ErrorModel from './../03-models/error-model';
import os from 'os';
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