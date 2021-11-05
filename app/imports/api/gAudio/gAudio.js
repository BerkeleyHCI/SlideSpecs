import { FilesCollection } from "meteor/ostrio:files";
import { storagePath } from "../storagePath.js";

export const gAudio = new FilesCollection({
    collectionName: "gAudio",
    storagePath: `${storagePath}/gAudio`,
    allowClientCode: false,
});
