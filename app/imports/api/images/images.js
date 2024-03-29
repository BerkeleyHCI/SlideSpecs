import { FilesCollection } from "meteor/ostrio:files";
import { storagePath } from "../storagePath.js";

export const Images = new FilesCollection({
    collectionName: "images",
    storagePath: `${storagePath}/images`, // persist in this spot
    allowClientCode: false, // Disallow remove files from Client
    onBeforeUpload(file) {
        // Allow uploading images under 3MB for now.
        if (file.size <= 3098576 && /png|jpg|jpeg|gif/i.test(file.extension)) {
            return true;
        } else {
            return `Invalid image type/size: ${file.extension} ${file.size}`;
        }
    },
});
