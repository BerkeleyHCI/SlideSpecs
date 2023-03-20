import { FilesCollection } from "meteor/ostrio:files";
import { createComment } from "../comments/methods.js";
import { storagePath } from "../storagePath.js";
import { updateSound } from "./methods.js";

export const Sounds = new FilesCollection({
    collectionName: "sounds",
    storagePath: `${storagePath}/sounds`, // persist in this spot
    allowClientCode: false, // Disallow remove files from Client
    onBeforeUpload(file) {
        console.log("Audio upload disabled.");
        return false;

        if (
            file.size > 1000 &&
            file.size <= 29485760 &&
            /wav|flac/i.test(file.extension)
        ) {
            return true;
        } else {
            return `Invalid sound type/size: ${file.extension} ${file.size}`;
        }
    },
    onAfterUpload(file) {
        console.log({ title: "uploaded sound file", file });
    },
});
