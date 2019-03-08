import {FilesCollection} from 'meteor/ostrio:files';

// TODO make save folder dynamic, or relative?...
const storagePath = '/Users/jwrnr/Downloads/slidespecs';

export const Sounds = new FilesCollection({
  collectionName: 'sounds',
  storagePath: `${storagePath}/sounds`, // persist in this spot
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    // Allow uploading sounds under 3MB for now.
     // if (file.size <= 3098576 && /wav/i.test(file.extension)) {
    if (/wav/i.test(file.extension)) {
      return true;
    } else {
      return `Invalid sound type/size: ${file.extension} ${file.size}`;
    }
  },
});
