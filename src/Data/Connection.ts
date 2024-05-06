import mongoose from "mongoose";
import Logger from "../Utils/Logger";
import 'dotenv/config';

export default class MongoConnection {

    static async connect() {
        try {
            if(mongoose.connection.readyState == 1) {
                Logger.warning('DATABASE CONNECTION ALREADY EXIST');
                Logger.success('DATABASE CONNECTED')
            } else {
                try {
                    Logger.info('CONNECTING TO DATABASE')
                    await mongoose.connect(String(process.env.CONNECTION_STRING));
                    Logger.success('DATABASE CONNECTED')
                } catch (error) {
                    Logger.error('DATABASE CONNECTION FAILED');
                    console.log(error)
                }
            }
        } catch (error) {
            Logger.error('DATABASE CONNECTION FAILED');
            console.log(error)
        }
    }   

    static async disconnect() {
        try {  
            Logger.info('CLOSING DATABASE CONNECTION');
            await mongoose.connection.close();
            Logger.success('DATABASE CONNECTION CLOSED');
        } catch(error) {
            Logger.error('CLOSING DATABASE CONNECTION')
        }
    }
}