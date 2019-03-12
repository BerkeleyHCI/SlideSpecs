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
    const speech = Npm.require("@google-cloud/speech"),
      fs = Npm.require("fs"),
      client = new speech.SpeechClient();
    fs.readFile(file.path, useFile);

    const useFile = (err, content) => {
      const audioBytes = content.toString("base64");
      const audio = {
        content: audioBytes
      };
      const config = {
        languageCode: "en-US",
        enableWordTimeOffsets: true
      };
      const request = {
        audio: audio,
        config: config
      };

      // Detects speech in the audio file
      client
        .recognize(request)
        .then(data => {
          const response = data[0];
          const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join("\n");
          console.log(`Transcription: ${transcription}`);
        })
        .catch(err => {
          console.error("ERROR:", err);
        });
    };
  }
});

/*
 onAfterUpload(file) {
    let fullData;
    const util = Npm.require("util"),
      spawn = Npm.require("child_process").spawn,
      convert = spawn(`${process.env.PWD}/private/transcribe`, [file.path]);

    const JSONTest = text => {
      try {
        return JSON.parse(text);
      } catch (error) {
        return false;
      }
    };

    convert.stdout.on("data", function(data) {
      const text = data.toString("utf8");
      const json = JSONTest(text)
      if (json) {
        console.log("got json:", text);
      return;

      createComment.call(i, {
        fileName,
        type: "image/png",
        userId: file.meta.userId,
        meta: { ...file.meta, slideNo }
      });
      } else {
        console.log("stdout:", text);
      }
        
    });

    convert.stderr.on("error", function(data) {
      console.log("stderr: " + data);
    });

    convert.on("exit", function(code) {
      console.log("child process exited with code " + code);
    });
  }
*/
