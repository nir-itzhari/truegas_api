import { IUserModel, UserModel } from './../03-models/user-model';
import { Schema } from 'mongoose';


async function getAllUsers(): Promise<IUserModel[]> {
    const users = await UserModel.find()
        .populate({
            path: 'assignment',
            select: '_id date description', populate: { path: 'image_id', select: 'name' }
        })
        .select('-imageFile')
        .lean()
        .exec()
    let modifiedUsers: IUserModel[] = []

    for (let user of users) {
        if (user.assignment_id) {
            modifiedUsers = users.map((user: any) => {
                user.assignment.forEach((assignment: any) => {
                    assignment.images = assignment.image_id
                    delete assignment.image_id
                    delete user.assignment_id
                });
                return user;
            });

        }
    }

    return modifiedUsers as IUserModel[]
}


async function getUserById(_id: Schema.Types.ObjectId): Promise<IUserModel> {
    const user = await UserModel.findById(_id)
    // .populate({
    //     path: 'assignment',
    //     select: '_id date description image_id',
    //     populate: {
    //         path: 'image_id',
    //         select: 'name'
    //     }
    // })
    //     .select('-imageFile')
        .lean()
        .exec()
    return user as IUserModel
}


async function addUser(user: IUserModel): Promise<IUserModel> {
    return user.save()
}

export default {
    getAllUsers,
    getUserById,
    addUser
}