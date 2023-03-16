import { UploadedFile } from 'express-fileupload';
import { unlinkSync } from 'fs';
import { Schema, Connection } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { IImageModel, ImageModel } from '../03-models/image-model';
import path from 'path';
import ErrorModel from "../03-models/error-model";
import { AssignmentModel } from '../03-models/assignment-model';



async function updateImage(oldImageId: Schema.Types.ObjectId, newImage: UploadedFile): Promise<IImageModel> {
    const oldImage = await ImageModel.findById(oldImageId).exec();
    if (!oldImage) {
        throw new ErrorModel(404, `Image with _id ${oldImageId} not found`);
    }
    const oldImageName = oldImage.name;
    const oldImageAbsolutePath = path.join(__dirname, '..', 'assets', 'images', oldImageName);
    const extension = newImage.name.substring(newImage.name.lastIndexOf('.'));
    const imageUrl = `${uuid()}${extension}`;
    const absolutePath = path.join(__dirname, '..', 'assets', 'images', imageUrl);


    try {
        unlinkSync(oldImageAbsolutePath);
        await newImage.mv(absolutePath);
        const updatedImage = await ImageModel.findByIdAndUpdate(oldImageId, { name: imageUrl }, { new: true }).exec();
        return updatedImage;
    } catch (error) {
        throw new ErrorModel(500, error.message);
    }
}


async function deleteImage(imageId: Schema.Types.ObjectId): Promise<void> {
    try {
        const imageToDelete = await ImageModel.findById(imageId).exec();
        if (!imageToDelete) {
            throw new ErrorModel(404, `Image with _id ${imageId} not found`);
        }
        const absolutePath = path.join(__dirname, '..', 'assets', 'images', imageToDelete.name);
        unlinkSync(absolutePath);
        await ImageModel.findByIdAndDelete(imageId).exec();
        const assignmentImagesIds = await AssignmentModel.find({ image_id: imageId });

        for (const assignment of assignmentImagesIds) {
            const indexToDelete = assignment.image_id.findIndex(id => id == imageId);
            assignment.image_id.splice(indexToDelete, 1)

            await AssignmentModel.findByIdAndUpdate(assignment._id, { $set: { image_id: assignment.image_id } }).exec();
        }
    } catch (error) {
        throw new ErrorModel(500, error.message);
    }
}


export default {
    updateImage,
    deleteImage
}

