import { FilesCollection } from "meteor/ostrio:files";
import { createComment } from "../images/methods.js";
import { storagePath } from "../storagePath.js";

export const Sounds = new FilesCollection({
  collectionName: "sounds",
  storagePath: `${storagePath}/sounds`, // persist in this spot
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    // needs to be under 10 mb for google to be happy
    if (
      file.size > 1000 &&
      file.size <= 10485760 &&
      /wav/i.test(file.extension)
    ) {
      // 100Mb
      return true;
    } else {
      return `Invalid sound type/size: ${file.extension} ${file.size}`;
    }
  },

  onAfterUpload(file) {
    const script = "transcribe.sh";
    const util = Npm.require("util"),
      spawn = Npm.require("child_process").spawn,
      convert = spawn(`${process.env.PWD}/private/transcribe.sh`, [file.path]);

    // reference: https://github.com/VeliovGroup/Meteor-Files/wiki/addFile
    convert.stdout.on("data", function(data) {
      const text = data.toString("utf8");
      console.log(text);
      return;

      createComment.call(i, {
        fileName,
        type: "image/png",
        userId: file.meta.userId,
        meta: { ...file.meta, slideNo }
      });
    });

    convert.stderr.on("data", function(data) {
      console.log("stderr: " + data);
    });

    convert.on("exit", function(code) {
      console.log("child process exited with code " + code);
    });

    // do transcription here, add as a a comment.
    // Detects speech in the audio file
    // client
    //   .recognize(request)
    //   .then(data => {
    //     const response = data[0];
    //     const transcription = response.results
    //       .map(result => result.alternatives[0].transcript)
    //       .join('\n');
    //     console.log(`Transcription: ${transcription}`);
    //   })
    //   .catch(err => {
    //     console.error('ERROR:', err);
    //   });
  }
});
