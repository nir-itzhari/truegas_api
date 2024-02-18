import express, { NextFunction, Request, Response } from 'express';
import { ClientModel } from '../03-models/client-model';
import clientLogic from '../05-logic/client-logic';
import { Schema } from 'mongoose';

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
        const _id = request.params._id
        const client = await clientLogic.getClientById(_id);
        response.status(200).json(client);
    } catch (err: any) {
        next(err);
    }
}
);

router.get('/clients/search/:firstParam/:secondParams/:thirdParams/:forthParams', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        console.log(request.params)

        const clients = await clientLogic.getClientByQuery(request.params); // Using getClientByQuery with the constructed query
        response.status(200).json(clients);
    } catch (err: any) {
        next(err);
    }
});


router.post('/client', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const client = new ClientModel(request.body);
        const addedClient = await clientLogic.addClient(client);

        response.status(201).json(addedClient);
    } catch (err: any) {
        next(err);
    }
}
);


router.put('/client/:clientId', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const { clientId } = request.params
        const clientObjectId = new Schema.Types.ObjectId(clientId)
        request.body._id = clientObjectId
        const clientDetailsToUpdate = new ClientModel(request.body)
        const updatedClient = await clientLogic.updateClient(clientDetailsToUpdate);

        response.status(200).json(updatedClient);
    } catch (err: any) {
        next(err);
    }
}
);


router.delete('/client/:clientId', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const { clientId } = request.params
        const clientObjectId = new Schema.Types.ObjectId(clientId)
        await clientLogic.deleteClient(clientObjectId);

        response.sendStatus(204)
    } catch (err: any) {
        next(err);
    }
}
);


export default router;