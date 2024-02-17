import express, { NextFunction, Request, Response } from 'express';
import { Schema, Types } from 'mongoose';
import { AssignmentModel } from '../03-models/assignment-model';
import assignmentsLogic from '../05-logic/assignment-logic';
import imageLogic from '../05-logic/image-logic';

const router = express.Router();


router.get('/assignments', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const assignments = await assignmentsLogic.getAllAssignments();
        response.json(assignments);
    } catch (err: any) {
        next(err);
    }
}
);


router.get('/assignments/:clientId', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const clientId = request.params.clientId;
        const assignmentsByClientId = await assignmentsLogic.getAssignmentsByClientId(clientId);

        response.json(assignmentsByClientId);
    } catch (err: any) {
        next(err);
    }
}
);


router.post('/assignments', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const ObjectUserId = new Types.ObjectId(request.body.user_id);
        const ObjectClientId = new Types.ObjectId(request.body.client_id);
        request.body.user_id = ObjectUserId;
        request.body.client_id = ObjectClientId;
        request.body.imageFile = request.files?.imageFile;
        // console.log(request.body);
        const assignment = new AssignmentModel(request.body);
        const addedAssignments = await assignmentsLogic.addAssignment(assignment);
        response.status(201).json(addedAssignments);
        // response.sendStatus(200);
    } catch (err: any) {
        next(err);
    }
});


router.put('/assignments/:_id', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const { _id } = request.params
        const assignment_id = new Schema.Types.ObjectId(_id)
        request.body.imageFile = request.files?.imageFile
        const assignment = new AssignmentModel(request.body);
        const updatedAssignments = await assignmentsLogic.updateAssignment(assignment_id, assignment);

        response.json(updatedAssignments);
    } catch (err: any) {
        next(err);
    }
}
);


router.delete('/assignments/:image_id', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const _id = new Schema.Types.ObjectId(request.params.image_id)
        await imageLogic.deleteImage(_id)

        response.sendStatus(204)
    } catch (err) {
        next(err);
    }
}
);


export default router;