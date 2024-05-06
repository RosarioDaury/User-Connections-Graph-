import MongoConnection from "../Data/Connection";
import User from "../Data/Models/User";
import Logger from "../Utils/Logger";
import { IUserSchema, IUser } from "../Utils/Interfaces/User";

//? EVERYTIME A NEW RECORD IS ADDED OR A RECORD IS DELETED TO THE DATABASE THE HASH MAP NEEDS TO BE REBUILT BECAUSE THE 
//? ORIGINAL SIZE CHANGES, BUILDING THE HASH MAP EVERYTIME IS NOT A HEAVY PROCESS BUT DOING IT EVERY TIME IS NOT THE BEST APPROACH
//? WHAT CAN I DO TO AVOID THAT?
export default class HashTable<T> {
    private table: any[] = [];
    size: number = 0;

    constructor(table: any[], size: number) {
        this.table = table;
        this.size = size
    }

    // WITHOUT COUNTING THE TIME THAT TAKES TO CONNECT TO THE DATABASE
    // IS TAKING 0.022 SECONDS TO COMPLETE THE SETUP (ONLY 5 RECORDS IN THE DB)
    static async SetUp() {
        try {
            await MongoConnection.connect();
            Logger.info('SETTING UP HASH TABLE');

            // const start = process.hrtime()

            //* GET DOCUMENTS SIZE TO SET UP HASH MAP SIZE
            const size = await User.countDocuments();
            //* BUILD HASH TABLE
            if(size > 0) {
                // INITIALIZE TABLE WITH EMPTY SLOTS
                const instance = new HashTable<IUser>(new Array(size).fill([]), size)
                const records: IUser[] = await User.find();
            
                records.forEach(user => {
                    instance.insertHashTable(user.id!, user)
                })

                return instance;
            } else {
                Logger.error('THERE ARE NOT USERS')
            }

            // const end = process.hrtime(start);
            // const timeTaken = (end[0]  + end[1] / 1e9);
            // console.log('Time taken:', timeTaken, 'seconds');
        } catch(error) {
            Logger.error('HASH MAP SETUP ERROR');
        }
    }

    private hashFunction(key: string) {
        let hash: number = key.split('').reduce(
            (acc, current) => acc + current.charCodeAt(0),
            0
        )
        return hash % this.size
    }
    
    // TO INSERT WHEN BUILDING THE HASH MAP
    private insertHashTable(key: string, value: T): void {
        try {
            const index = this.hashFunction(key);
            if(this.table[index]) {    
                this.table[index] = [...this.table[index], [key, value]]
            } else {
                this.table[index] = [[key, value]]
            }
        } catch(error) {
            Logger.error('HASH MAP RECORD INSERTION (PRIVATE)')
        }
        
    }

    // TO INSERT DATA INTO DB AND REBUILT HASH MAP
    // HOW MUCH TAKES THIS INSERTION: 
    async insert(value: IUserSchema) {
        try{
            // const start = process.hrtime();

            await User.create(value);
            const size = await User.countDocuments();
    
            //* REBUILD HASH TABLE
            if(size > 0) {
                // REORDER SIZE AND TABLE WITH ITS CORRESPONDIGN EMPTY SLOTS AND THEN REFILL THEM
                this.size = size;
                this.table = new Array(size).fill([]);
    
                const records: IUser[] = await User.find();
                records.forEach(user => {
                    this.insertHashTable(user.id!, user as T)
                })

                // CALCULATING PERFORMANCE
                // const end = process.hrtime(start);
                // const timeTaken = (end[0]  + end[1] / 1e9);
                // console.log('Insertion time:', timeTaken, 'seconds');
    
            } else {
                Logger.error('THERE ARE NOT USERS')
            }
        } catch(error) {
            Logger.error('HASH MAP RECORD INSERTION')
        }
        
    }

    async addEdge(id: string, edge: string) {
        try {
            // UPDATE IN DB
            await User.findByIdAndUpdate(id, { $push: {Edges: edge}});
            // UPDATE IN HASH MAP
            const index = this.hashFunction(id);
            const slot = this.table[index];
            if(slot){
                const index2 = slot.findIndex((el: [string, T]) => el[0] == id);

                if(index2) {
                    const nodeUpdated = await User.findById(id);
                    this.table[index][index2][1] = nodeUpdated;
                    console.log('NODE FROM HASH TABLE', this.table[index][index2][1], nodeUpdated);
                }
            }
        } catch(error) {
            Logger.error('ADD EDGE FAILED [HASH TABLE]');
            console.log(error);
        }
    }

    async removeEdge(id: string, edge: string) {
        try {
            await User.findByIdAndUpdate(id, { $pull: {Edges: edge} });

            const index = this.hashFunction(id);
            const slot = this.table[index];
            if(slot){
                const index2 = slot.findIndex((el: [string, T]) => el[0] == id);

                if(index2) {
                    const nodeUpdated = await User.findById(id);
                    this.table[index][index2][1] = nodeUpdated;
                    console.log('NODE FROM HASH TABLE', this.table[index][index2][1], nodeUpdated);
                }
            }
        } catch(error) {
            Logger.error('REMOVE EDGE FAILED [HASH TABLE]');
            console.log(error);
        }
    }

    //? HOW MUCH DOES IT TAKES: AROUND 0.000028 SECONDS WITH AROUND 5 RECORDS
    get(key: string): T | null  {
        try{
            // const start = process.hrtime();
            const index = this.hashFunction(key);
            const slot = this.table[index];
            if(slot) {
                let result = slot.filter((el: [string, T]) => el[0] == key);

                // CALCULATING PERFORMANCE
                // const end = process.hrtime(start);
                // const timeTaken = (end[0]  + end[1] / 1e9);
                // console.log('Using hash map get:', timeTaken, 'seconds');
                
                return result.length > 0 
                ? result[0][1]
                : null
            } else {
                return null
            }
        } catch(error) {
            Logger.error('GET FROM HASH TABLE');
            console.log(error);
            return null;
        }
        
    }


    //? HOW MUCH DOES IT TAKES: AROUND 0.0028 SECONDS WITH AROUND 5 RECORDS IN THE DB
    async getFromDB(key: string): Promise<IUser[] | null> {
        try {
            // const start = process.hrtime();

            const record: IUser[] = await User.find({_id: key});

            // CALCULATING PERFORMANCE
            // const end = process.hrtime(start);
            // const timeTaken = (end[0]  + end[1] / 1e9);
            // console.log('Using query directly to the DB:', timeTaken, 'seconds');
            return record;
        } catch(error) {
            Logger.error('WHILE GETTING USER FROM DATABASE')
            return null;
        }
    }

    delete(key: string): void {
        const index = this.hashFunction(key);
        const slot = this.table[index];
        // TODO: Implement deleting in DB
            // CODE HERE
        // TODO
        if(slot) {  
            const filtered = slot.filter((el: [string, T]) => el[0] != key);
            this.table[index] = slot;
        } else {
            return
        }
        
    }
}