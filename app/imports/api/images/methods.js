import { ValidatedMethod } from "meteor/mdg:validated-method";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Images } from "./images.js";

export const renameImage = new ValidatedMethod({
    name: "images.rename",
    validate: new SimpleSchema({
        imageId: { type: String },
        newName: { type: String },
    }).validator(),
    run({ imageId, newName }) {
        this.unblock(); // <-- Use to make this method asynchronous
        const good = Images.collection.update(
            { _id: imageId },
            {
                $set: { name: newName },
            }
        );
        return good;
    },
});

export const deleteImage = new ValidatedMethod({
    name: "images.delete",
    validate: new SimpleSchema({
        imageId: { type: String },
    }).validator(),
    run({ imageId }) {
        try {
            Images.remove({ id: imageId });
        } catch (e) {
            console.error(e);
        }
    },
});

export const deleteTalkImages = new ValidatedMethod({
    name: "images.deleteTalkImages",
    validate: new SimpleSchema({
        talkId: { type: String },
    }).validator(),
    run({ talkId }) {
        try {
            Images.remove({ "meta.talkId": talkId });
        } catch (e) {
            console.error(e);
        }
    },
});
