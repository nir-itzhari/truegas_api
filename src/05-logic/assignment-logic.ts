import { IAssignmentModel, AssignmentModel } from '../03-models/assignment-model';
import { v4 as uuid } from 'uuid';
import { ImageModel } from '../03-models/image-model';
import { IFilterModel } from '../03-models/filter-model';
import path from 'path';
import ErrorModel from '../03-models/error-model';
import imageLogic from './image-logic';
import { ClientModel } from '../03-models/client-model';
import mongoose, { ObjectId, Schema } from 'mongoose';
import { UserModel } from '../03-models/user-model';


// Get all assignments without the image data
async function getAllAssignments(): Promise<IAssignmentModel[]> {
    const assignments = await AssignmentModel.find().select("-imageFile -image")
        .populate({ path: 'user', select: '-_id email' })
        .populate({ path: 'client', select: '-_id -assignment_id' })
        .populate({ path: 'image', select: '-_id name' }).select('-createdAt').lean().exec();
    return assignments as IAssignmentModel[];
}


// Get all assignments for a specific client id without the image data
async function getAssignmentsByClientId(clientId: string): Promise<IAssignmentModel[]> {
    return AssignmentModel.find({ client_id: clientId }).exec()
}


// Function to add an assignment
async function addAssignment(assignment: IAssignmentModel): Promise<IAssignmentModel> {
    try {
        await assignment.validate();


        if (assignment.imageFile && assignment.imageFile.length) {
            const image_id: mongoose.Types.ObjectId[] = [];
            for (const imageExt of assignment.imageFile) {
                const extension = imageExt.name.substring(imageExt.name.lastIndexOf('.'));
                const imageName = `${uuid()}${extension}`;
                const absolutePath = path.join(__dirname, '..', 'assets', 'images', imageName);

                await imageExt.mv(absolutePath);

                const savedImage = await new ImageModel({
                    name: imageName,
                    mimetype: imageExt.mimetype,
                    size: imageExt.size,
                    assignment_id: assignment._id
                }).save();
                image_id.push(savedImage._id);
            }
            assignment.image_id = image_id;
            assignment.imageFile = []
        }

        await UserModel.findByIdAndUpdate({ _id: assignment.user_id }, { $push: { assignment_id: assignment._id } })

        const savedAssignment = await new AssignmentModel(assignment).save();
        await ClientModel.updateMany({ _id: assignment.client_id }, { $push: { assignment_id: savedAssignment._id } }).exec();

        return AssignmentModel.findById(savedAssignment._id)
            .populate({ path: 'user', select: '-_id user_id' })
            .populate({ path: 'client', select: '-_id -assignment_id' })
            .populate({ path: 'image', select: '-_id name' }).exec();

    } catch (error) {
        throw new ErrorModel(400, error.message);
    }
}



// Function to update an assignment - dynamic
async function updateAssignment(assignment_id: mongoose.Types.ObjectId, assignment: IAssignmentModel): Promise<IAssignmentModel> {
    try {
        await assignment.validate();


        const oldAssignment = await AssignmentModel.findById(assignment_id).exec();
        if (!oldAssignment) {
            throw new ErrorModel(404, `המשימה שברצונך לערוך לא נמצאה`);
        }

        let updatedImageIds: mongoose.Types.ObjectId[] = oldAssignment.image_id;
        if (assignment.image_id && assignment.image_id.length) {
            updatedImageIds = [...oldAssignment.image_id];

            for (let i = 0; i < assignment.image_id.length; i++) {
                const index = updatedImageIds.findIndex(id => id.toString() === assignment.image_id[i].toString());
                if (index !== -1) {
                    await imageLogic.updateImage(updatedImageIds[index], assignment.imageFile[i]);
                } else {
                    updatedImageIds.push(assignment.image_id[i]);
                }
            }
        }

        if (assignment.imageFile && assignment.imageFile.length) {
            for (const imageFile of assignment.imageFile) {

                const extension = imageFile.name.substring(imageFile.name.lastIndexOf('.'));
                const imageName = `${uuid()}${extension}`;
                const absolutePath = path.join(__dirname, '..', 'assets', 'images', imageName);
                const newImage = await new ImageModel({
                    name: imageName,
                    mimetype: imageFile.mimetype,
                    size: imageFile.size,
                    assignment_id: assignment_id
                }).save();
                updatedImageIds.push(newImage._id);
                await imageFile.mv(absolutePath);
            }
        }

        const updatedAssignment = await AssignmentModel.findByIdAndUpdate(
            assignment_id,
            {
                date: assignment.date || oldAssignment.date,
                description: assignment.description || oldAssignment.description,
                client_id: assignment.client_id || oldAssignment.client_id,
                user_id: assignment.user_id || oldAssignment.user_id,
                image_id: updatedImageIds,
            },
            { new: true }
        ).exec();

        if (!updatedAssignment) {
            throw new ErrorModel(404, `משימה ${assignment_id} אינה קיימת`);
        }
        return updatedAssignment;

    } catch (error) {
        throw new ErrorModel(400, error.message);
    }
}


// Function to delete an assignment
async function deleteAssignment(_id: Schema.Types.ObjectId): Promise<void> {
    const assignment = await AssignmentModel.findById(_id);
    if (!assignment) {
        throw new ErrorModel(404, `משימה לא נמצאה`);
    }
    const imageIds = assignment.image_id;

    for (let i = 0; i < imageIds.length; i++) {
        await imageLogic.deleteImage(imageIds[i])
    }
    try {
        await AssignmentModel.findByIdAndDelete(_id).exec();

    } catch (error) {
        throw new ErrorModel(400, error.message);
    }
}


// Function to filter assignments
async function filterAssignments(filters: IFilterModel): Promise<IAssignmentModel[]> {

    try {
        await filters.validate();

        let filterCriteria = {};

        // Iterate over the filters and add each filter to the filterCriteria object
        for (const [key, value] of Object.entries(filters)) {
            filterCriteria[key] = value;
        }
        return AssignmentModel.find(filterCriteria).select("-imageFile").exec();

    } catch (error) {
        throw new ErrorModel(400, error.message);
    }

}

export default {
    getAllAssignments,
    getAssignmentsByClientId,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    filterAssignments
}