import { FilesCollection } from "meteor/ostrio:files";
import { Images } from "../images/images.js";
import { storagePath } from "../storagePath.js";

export const Files = new FilesCollection({
    collectionName: "files",
    storagePath: `${storagePath}/files`, // persist in this spot
    allowClientCode: false, // Disallow remove files from Client
    onBeforeUpload(file) {
        // Allow uploading files under 30MB for now.
        if (file.size <= 30985760 && /pdf|ppt|pptx|key/i.test(file.extension)) {
            return true;
        } else {
            console.error(
                "Please only upload pdf/ppt/pptx, with size equal or less than 30MB."
            );
            return false;
        }
    },

    onAfterUpload(file) {
        //console.log(file);

        let script;
        if (/pdf$/i.test(file.extension)) {
            script = "convert-pdf";
        } else {
            script = "convert-slides";
        }

        const util = Npm.require("util"),
            spawn = Npm.require("child_process").spawn,
            convert = spawn(`${process.env.PWD}/private/${script}`, [
                file.path,
                storagePath,
            ]);

        // reference: https://github.com/VeliovGroup/Meteor-Files/wiki/addFile
        convert.stdout.on("data", function (data) {
            if (data.includes(file._id)) {
                var text = data.toString("utf8");
                const images = text.split("\n");
                images
                    .filter((i) => i.includes(file._id))
                    .map((i) => {
                        console.log("adding image file: " + i);
                        const fileName = i.substring(i.lastIndexOf("/") + 1);

                        // get slide number from image title
                        const slideMatch = i.match(/\d+/g);
                        if (!slideMatch) console.error("no slide matched", i);
                        const slideNo = slideMatch.slice(-1)[0];

                        Images.addFile(i, {
                            fileName,
                            type: "image/png",
                            userId: file.meta.userId,
                            meta: { ...file.meta, slideNo },
                        });
                    });
            } else {
                console.log("stdout: " + data);
            }
        });

        convert.stderr.on("data", function (data) {
            console.log("stderr: " + data);
        });

        convert.on("exit", function (code) {
            console.log("child process exited with code " + code);
        });
    },
});
