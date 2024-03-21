import mongoose from "mongoose"
import config from "../01-utils/config"
import ErrorModel from './../03-models/error-model';
import os from 'os';

let isConnected = false;


const connect = (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        if (isConnected) {
            console.log('Already connected to MongoDB');
            resolve();
            return;
        }
        try {
            console.log(os.hostname());
            mongoose.connect(os.hostname() === 'truegasdocker' ? config.dockerConnectionString : config.connectionString)
                .then((db) => {
                    console.log("We're connected to MongoDB " + db.connections[0].name);
                    isConnected = true;
                    resolve();
                })
                .catch((error) => {
                    console.error('Error connecting to MongoDB:', error.message);
                    reject(new ErrorModel(400, error.message));
                });
        } catch (error) {
            console.error('Error connecting to MongoDB:', error.message);
            reject(new ErrorModel(400, error.message));
        }
    });
};



export function closeDatabaseConnection(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        if (!isConnected) {
            console.log('Not connected to MongoDB');
            resolve();
            return;
        }

        mongoose.disconnect()
            .then(() => {
                isConnected = false;
                console.log('Disconnected from MongoDB');
                resolve();
            })
            .catch((error) => {
                console.error('Error disconnecting from MongoDB:', error.message);
                reject(new ErrorModel(400, error.message));
            });
    });
}

process.on('SIGINT', () => {
    console.log('Received SIGINT signal, closing MongoDB connection');
    closeDatabaseConnection()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('Error handling SIGINT:', error.message);
            process.exit(1);
        });
});

export default {
    connect,
    // mailSend
}