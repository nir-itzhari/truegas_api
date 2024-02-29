import { AssignmentModel } from '../03-models/assignment-model';
import { ClientModel, IClientModel } from './../03-models/client-model';
import mongoose, { Schema } from 'mongoose';


async function getAllClients(): Promise<IClientModel[]> {
    const clients = await ClientModel.find()
        .populate({
            path: 'assignment',
            select: '_id date description', populate: { path: 'image_id', select: 'name' }
        })
        .select('-imageFile -createdAt')
        .lean()
        .exec()

    const modifiedClients: IClientModel[] = clients.map((client: any) => {
        client.assignment.forEach((assignment: any) => {
            assignment.images = assignment.image_id
            delete assignment.image_id
            delete client.assignment_id
        });
        return client;
    });

    return modifiedClients as IClientModel[]
}


async function getClientById(_id: mongoose.Types.ObjectId): Promise<IClientModel[]> {

    const pipeline = [
        {
            $match: {
                user_id: _id,
            },
        },
        {
            $lookup: {
                from: 'assignment',
                localField: 'user_id',
                foreignField: 'user_id',
                as: 'assignments',
            },
        },
        {
            $lookup: {
                from: 'images',
                localField: 'image_id',
                foreignField: 'image_id',
                as: 'images',
            },
        },

        {
            $project: {
                _id: 1,
                fullName: 1,
                city: 1,
                street: 1,
                buildingNumber: 1,
                apartmentNumber: 1,
                floor: 1,
                phoneNumber: 1,
                assignments: { date: 1, description: 1, title: 1, isDone: 1 },
                images: { _id: 1, name: 1 },
            }
        }
    ]


    const clients = await ClientModel.aggregate(pipeline);

    return clients
}



async function getClientByQuery(parameters: any, _id: mongoose.Types.ObjectId): Promise<IClientModel[]> {
    const { fullName, city, street } = parameters;

    const conditions: any[] = [{ user_id: _id }];

    if (fullName !== '0' && fullName !== 'הכל') {
        const fullNameRegex = new RegExp(`^${fullName}`, 'i');
        conditions.push({ fullName: fullNameRegex });
    }

    if (city !== '0') {
        const cityRegex = new RegExp(`^${city}`, 'i');
        conditions.push({ city: cityRegex });
    }

    if (street !== '0') {
        const streetRegex = new RegExp(`^${street}`, 'i');
        conditions.push({ street: streetRegex });
    }

    const pipeline: any[] = [{ $match: { $and: conditions } }, { $project: { createdAt: 0 } }];

    const clients = await ClientModel.aggregate(pipeline);
    console.log(clients);

    return clients;
}



async function addClient(client: IClientModel): Promise<IClientModel> {
    return client.save()
}


async function updateClient(clientToUpdate: IClientModel): Promise<IClientModel> {
    const { _id } = clientToUpdate
    const updatedClient = await ClientModel.findByIdAndUpdate(_id, { $set: clientToUpdate }, { new: true }).populate({
        path: 'assignment',
        select: '_id date description image_id',
        populate: {
            path: 'image_id',
            select: 'name'
        }
    })
        .select('-imageFile')
        .lean()
        .exec()

    return updatedClient as IClientModel;
}


async function deleteClient(_id: string): Promise<IClientModel> {
    const deletedClient = await ClientModel.findByIdAndDelete(new mongoose.Types.ObjectId(_id)).exec();
    return deletedClient;
}


export default {
    getAllClients,
    getClientById,
    getClientByQuery,
    addClient,
    updateClient,
    deleteClient
}