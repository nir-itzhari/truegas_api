import { ClientModel, IClientModel } from './../03-models/client-model';
import { Schema } from 'mongoose';


async function getAllClients(): Promise<IClientModel[]> {
    const clients = await ClientModel.find()
        .populate({
            path: 'assignment',
            select: '_id date description', populate: { path: 'image_id', select: 'name' }
        })
        .select('-imageFile')
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


async function getClientById(_id: string): Promise<IClientModel> {
    const client = await ClientModel.findById(_id).populate({
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
    return client as IClientModel
}

async function getClientByQuery(query: any): Promise<string[]> {
    const clients = await ClientModel.find(query).lean().exec();
    const fullNames: string[] = clients.map((client: any) => client.fullName).filter(Boolean);
    return fullNames;
}


async function addClient(client: IClientModel): Promise<IClientModel> {
    return client.save()
}


async function updateClient(clientToUpdate: IClientModel): Promise<IClientModel> {
    const { _id } = clientToUpdate
    const updatedClient = await ClientModel.findByIdAndUpdate(_id, { $set: clientToUpdate }, { new: true }).exec();
    return updatedClient;
}


async function deleteClient(_id: Schema.Types.ObjectId): Promise<IClientModel> {
    const deletedClient = await ClientModel.findByIdAndDelete(_id).exec();
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