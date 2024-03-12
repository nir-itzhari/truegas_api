import { IAssignmentModel, AssignmentModel } from '../03-models/assignment-model';
import { v4 as uuid } from 'uuid';
import { ImageModel } from '../03-models/image-model';
import { IFilterModel } from '../03-models/filter-model';
import path from 'path';
import ErrorModel from '../03-models/error-model';
import imageLogic from './image-logic';
import { ClientModel } from '../03-models/client-model';
import mongoose, { Schema } from 'mongoose';
import { UserModel } from '../03-models/user-model';
import { UploadedFile } from 'express-fileupload';
import dayjs from 'dayjs';


async function getAllAssignments(): Promise<IAssignmentModel[]> {
    const assignments = await AssignmentModel.find().select("-imageFile -image")
        .populate({ path: 'user', select: '-_id email' })
        .populate({ path: 'client', select: '-_id -assignment_id' })
        .populate({ path: 'image', select: '-_id name' }).select('-createdAt').lean().exec();
    return assignments as IAssignmentModel[];
}


async function getAssignmentsByUserId(user_id: mongoose.Types.ObjectId): Promise<IAssignmentModel[]> {

    const pipeline = [
        {
            $match: {
                user_id: user_id,
            },
        },
        {
            $lookup: {
                from: 'clients',
                localField: 'client_id',
                foreignField: '_id',
                as: 'client',
            },
        },
        {
            $lookup: {
                from: 'images',
                localField: 'image_id',
                foreignField: '_id',
                as: 'images'
            }
        }
    ];

    const assignments = await AssignmentModel.aggregate(pipeline);

    return assignments;
}



async function addAssignment(assignment: IAssignmentModel): Promise<IAssignmentModel> {
    try {
        await assignment.validate();

        const processImage = async (imageExt: UploadedFile) => {
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
            return savedImage._id;
        };

        const imageIds = [];
        if (assignment.imageFile && assignment.imageFile.length > 0) {
            const imagePromises = assignment.imageFile.map(processImage);
            imageIds.push(...(await Promise.all(imagePromises)));
            assignment.image_id = imageIds;
            assignment.imageFile = [];
        }

        await UserModel.findByIdAndUpdate({ _id: assignment.user_id }, { $push: { assignment_id: assignment._id } });

        const savedAssignment = await new AssignmentModel(assignment).save();

        await ClientModel.updateMany({ _id: assignment.client_id }, { $push: { assignment_id: savedAssignment._id } }).exec();

        const populatedAssignment = await AssignmentModel.findById(savedAssignment._id)
            .populate({ path: 'user', select: '-_id user_id' })
            .populate({ path: 'client', select: '-_id -assignment_id' })
            .populate({ path: 'image', select: '-_id name' }).exec();

        return populatedAssignment;

    } catch (error) {
        throw new ErrorModel(400, error.message);
    }
}




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


async function filterAssignments(filters: IFilterModel): Promise<IAssignmentModel[]> {

    try {
        await filters.validate();

        let filterCriteria = {};

        for (const [key, value] of Object.entries(filters)) {
            filterCriteria[key] = value;
        }
        return AssignmentModel.find(filterCriteria).select("-imageFile").exec();

    } catch (error) {
        throw new ErrorModel(400, error.message);
    }

}

async function getMonthlyAverageIncome(_id: mongoose.Types.ObjectId) {
    const today = new Date();
    const months = Array.from({ length: 12 }, (v, i) => i);
    const result = await Promise.all(months.map(async (month) => {
        const startDate = new Date(today.getFullYear(), today.getMonth() - month, 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() - month + 1, 0);

        const monthName = dayjs(startDate).format('MM-YY');

        const aggregationPipeline = [
            {
                $match: {
                    user_id: _id,
                    date: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalIncome: { $sum: "$price" }
                }
            },
        ];

        const resultOfMonth = await AssignmentModel.aggregate(aggregationPipeline);
        return { month: monthName, totalIncome: resultOfMonth.length ? resultOfMonth[0].totalIncome : 0 };
    }));

    return result;
}


async function getWeeklyAssignments(_id: mongoose.Types.ObjectId) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfSearch = new Date(today);
    endOfSearch.setDate(today.getDate());

    const startDate = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
    const endDate = new Date(endOfSearch.getFullYear(), endOfSearch.getMonth(), endOfSearch.getDate());

    const weekStartSearchDate = dayjs(startDate).format('DD-MM-YY');
    const weekEndSearchDate = dayjs(endDate).format('DD-MM-YY');

    const aggregationPipeline = [
        {
            $match: {
                user_id: _id,
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: null,
                totalIncome: { $sum: "$price" },
                count: { $sum: 1 }
            }
        },
    ];

    const resultOfWeek = await AssignmentModel.aggregate(aggregationPipeline);

    const totalAssignments = await AssignmentModel.countDocuments({ user_id: _id });

    return {
        weekStartSearchDate,
        weekEndSearchDate,
        totalIncome: resultOfWeek.length ? resultOfWeek[0].totalIncome : 0,
        assignmentCount: resultOfWeek.length ? resultOfWeek[0].count : 0,
        totalAssignments
    };
}





export default {
    getAllAssignments,
    getAssignmentsByUserId,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    filterAssignments,
    getMonthlyAverageIncome,
    getWeeklyAssignments
}