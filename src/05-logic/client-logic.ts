import { ClientModel, IClientModel } from './../03-models/client-model';
import { Types } from 'mongoose';


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



async function getClientByQuery(parameters: any): Promise<IClientModel[]> {
    const { fullName, city, street } = parameters;

    let pipeline: any[] = [];

    const conditions: any[] = [];

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

    if (fullName === 'הכל') {
        pipeline.push({ $match: {} });
    } else {
        if (conditions.length > 0) {
            if (conditions.length === 1) {
                pipeline.push({ $match: conditions[0] });
            } else {
                pipeline.push({ $match: { $and: conditions } });
            }
        } else {
            pipeline.push({ $match: {} });
        }
    }

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


async function deleteClient(_id: Types.ObjectId): Promise<IClientModel> {
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