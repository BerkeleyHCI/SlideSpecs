import { FilesCollection } from "meteor/ostrio:files";
import { createComment } from "../comments/methods.js";
import { storagePath } from "../storagePath.js";
import { updateSound } from "./methods.js";

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
    const useTranscript = data => {
      const { target, talkId } = file.meta;
      let response = data[0];
      let transcript = response.results
        .map(result => result.alternatives[0].transcript)
        .join("\n").trim();
        
        console.log(transcript)

      if (transcript) {
        const results = JSON.stringify(response.results, null, 4);
        updateSound.call({ soundId: file._id, transcript, results });
        return createComment.call({
          author: "transcript",
          content: `[x](#c${target}) ${transcript}`,
          talk: talkId,
          userOwn: true,
          slides: []
        });
      }
    };

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
        .then(useTranscript)
        .catch(err => {
          console.error("ERROR:", err);
        });
    };

    const speech = Npm.require("@google-cloud/speech"),
      fs = Npm.require("fs"),
      client = new speech.SpeechClient();
    fs.readFile(file.path, useFile);
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
