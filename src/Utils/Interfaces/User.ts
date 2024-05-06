export interface IUser {
    id: string,
    firstName: string,
    lastName: string,
    username: string,
    Edges: string[]
}

export interface IUserSchema extends Omit<IUser, 'id'> {}
