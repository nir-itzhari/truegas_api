import express, { NextFunction, Request, Response } from 'express';
import mongoose, { Schema, Types } from 'mongoose';
import { AssignmentModel } from '../03-models/assignment-model';
import assignmentsLogic from '../05-logic/assignment-logic';
import imageLogic from '../05-logic/image-logic';
import verifyLoggedIn from '../02-middleware/verify-logged-in';

const router = express.Router();


router.get('/assignments', verifyLoggedIn, async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const assignments = await assignmentsLogic.getAllAssignments();
        response.json(assignments);
    } catch (err: any) {
        next(err);
    }
});


router.get('/assignments/:user_id/:first/:rows', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const ObjectUserId = new mongoose.Types.ObjectId(request.params.user_id);
        const { first, rows } = request.params;
        const assignmentsByClientId = await assignmentsLogic.getAssignmentsByUserId(ObjectUserId, +first, +rows);

        response.json(assignmentsByClientId);
    } catch (err: any) {
        next(err);
    }
});


router.post('/assignments', verifyLoggedIn, async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const ObjectUserId = new Types.ObjectId(request.body.user_id);
        const ObjectClientId = new Types.ObjectId(request.body.client_id);
        request.body.user_id = ObjectUserId;
        request.body.client_id = ObjectClientId;
        request.body.imageFile = request.files?.imageFile;
        const assignment = new AssignmentModel(request.body);
        const addedAssignments = await assignmentsLogic.addAssignment(assignment);
        response.status(201).json(addedAssignments);
    } catch (err: any) {
        next(err);
    }
});


router.put('/assignments/:_id', verifyLoggedIn, async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const { _id } = request.params
        const assignment_id = new mongoose.Types.ObjectId(_id)
        request.body.imageFile = request.files?.imageFile
        const assignment = new AssignmentModel(request.body);
        const updatedAssignments = await assignmentsLogic.updateAssignment(assignment_id, assignment);

        response.json(updatedAssignments);
    } catch (err: any) {
        next(err);
    }
}
);


router.delete('/assignments/:image_id', verifyLoggedIn, async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const _id = new mongoose.Types.ObjectId(request.params.image_id)
        await imageLogic.deleteImage(_id)

        response.sendStatus(204)
    } catch (err) {
        next(err);
    }
}
);

router.get('/assignments/chart/:_id', verifyLoggedIn, async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const _id = new mongoose.Types.ObjectId(request.params._id)
        const monthlyAverageIncome = await assignmentsLogic.getMonthlyAverageIncome(_id)
        response.json(monthlyAverageIncome)
    } catch (err) {
        next(err);
    }
}
);

router.get('/assignments/count-card/:_id', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const _id = new mongoose.Types.ObjectId(request.params._id)
        const weeklyAssignments = await assignmentsLogic.getWeeklyAssignments(_id)
        response.json(weeklyAssignments)
    } catch (err) {
        next(err);
    }
}
);

export default router;