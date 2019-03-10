import { FilesCollection } from "meteor/ostrio:files";
import { storagePath } from "../storagePath.js";

export const Sounds = new FilesCollection({
  collectionName: "sounds",
  storagePath: `${storagePath}/sounds`, // persist in this spot
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    // if (file.size <= 3098576 && /wav/i.test(file.extension)) {
    if (/wav/i.test(file.extension)) {
      return true;
    } else {
      return `Invalid sound type/size: ${file.extension} ${file.size}`;
    }
  },

  onAfterUpload(file) {
    console.log(file);
    // do transcription here, add as a a comment.
  }
});
