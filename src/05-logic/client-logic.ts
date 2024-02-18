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



async function getClientByQuery(parameters: any): Promise<string[]> {
    console.log(parameters)
    const { firstParam } = parameters
    const { secondParam } = parameters
    const { thirdParam } = parameters
    const { forthParam } = parameters
  
  
    let pipeline: any[] = [];

    // Construct pipeline stages based on the provided query parameters
    if (parameters && firstParam !== "0") {
        const regexPattern = new RegExp(firstParam, 'i');
        pipeline.push({ $match: { fullName: regexPattern } });
    }
    pipeline.push({ $project: { fullName: 1, _id: 0 } });

    // Add more pipeline stages for additional query parameters if needed in the future

    // Add the final stage to project only the fullName field and exclude the _id field

    // Execute the aggregation pipeline
    const clients = await ClientModel.aggregate(pipeline);

    // Extract fullNames from the result
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