import express, { NextFunction, Request, Response } from 'express';
import { ClientModel } from '../03-models/client-model';
import clientLogic from '../05-logic/client-logic';
import { Types, ObjectId } from 'mongoose';
import mongoose from 'mongoose';
import cyber from '../01-utils/cyber';

const router = express.Router();


router.get('/clients', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const assignments = await clientLogic.getAllClients();
        response.status(200).json(assignments);
        console.log(assignments)
    } catch (err: any) {
        next(err);
    }
}
);


router.get('/clients/:_id', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const _id = new mongoose.Types.ObjectId(request.params._id)
        const clients = await clientLogic.getClientById(_id);
        response.status(200).json(clients);
    } catch (err: any) {
        next(err);
    }
}
);

router.get('/clients/search/:fullName/:city/:street', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const authorizationHeader = request.header("authorization");
        const user = cyber.getUserFromToken(authorizationHeader)
        const _id = new mongoose.Types.ObjectId(user._id)
        const clients = await clientLogic.getClientByQuery(request.params, _id); // Using getClientByQuery with the constructed query
        response.status(200).json(clients);
    } catch (err: any) {
        next(err);
    }
});


router.post('/clients', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const client = new ClientModel(request.body);
        const addedClient = await clientLogic.addClient(client);

        response.status(201).json(addedClient);
    } catch (err: any) {
        next(err);
    }
}
);


router.put('/clients/:clientId', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const { clientId } = request.params
        const clientObjectId = new Types.ObjectId(clientId)
        request.body._id = clientObjectId
        const clientDetailsToUpdate = new ClientModel(request.body)
        const updatedClient = await clientLogic.updateClient(clientDetailsToUpdate);

        response.status(200).json(updatedClient);
    } catch (err: any) {
        next(err);
    }
}
);


router.delete('/clients/:clientId', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const { clientId } = request.params;
        // const clientObjectId = new Types.ObjectId(clientId); // Create ObjectId instance
        await clientLogic.deleteClient(clientId);

        response.sendStatus(204);
    } catch (err: any) {
        next(err);
    }
});


export default router;