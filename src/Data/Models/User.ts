import { Schema, model } from "mongoose";
import { IUserSchema } from "../../Utils/Interfaces/User";

const schema = new Schema<IUserSchema>({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    username: {type: String, required: true},
    Edges: {type: [String], required: true, default: []},
})

const User = model<IUserSchema>('User', schema);


export default User;


