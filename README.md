# [SlideSpecs](https://jeremywrnr.com/SlideSpecs/)

*Automatic and Interactive Presentation Feedback Collation*

![SlideSpecs_teaser](https://user-images.githubusercontent.com/4837429/215202458-d1d09aaa-ddc6-420d-8109-c95e7bc6c93b.jpg)

Presenters often collect audience feedback through practice talks to refine their presentations. In formative interviews, we find that although text feedback and verbal discussions allow presenters to receive feedback, organizing that feedback into actionable presentation revisions remains challenging. Feedback can be redundant, lack context, or be spread across various emails, notes, and conversations. To collate and contextualize both text and verbal feedback, we present SlideSpecs. SlideSpecs lets audience members provide text feedback (e.g., ‘font too small’) along with an automatically detected context, including relevant slides (e.g., Slide 7) or content tags (e.g., ‘slide design’). In addition, SlideSpecs records and transcribes the spoken group discussion that commonly occurs after practice talks and facilitates linking text critiques to their relevant discussion segments. Finally, SlideSpecs lets the presenter review all text and spoken feedback in a single context-rich interface (e.g., relevant slides, topics, and follow-up discussions). We demonstrate the effectiveness of SlideSpecs by applying it to a range of eight presentations across computer vision, programming notebooks, sensemaking, and more. When surveyed, 85% of presenters and audience members reported they would use the tool again. Presenters reported that using SlideSpecs improved feedback organization, provided valuable context, and reduced redundancy.

### Overview

- This is a Meteor app following [this structure guide](http://guide.meteor.com/structure.html).
- The UI is implemented in [React](https://facebook.github.io/react/index.html).
- More about using React in Meteor [here](http://guide.meteor.com/v1.3/react.html).

### Running the app

Copy and Edit this file to tell meteor where to save files:

```bash
cp imports/api/storagePath.default.js imports/api/storagePath.js
```

Installing and running the app

```bash
meteor npm install
meteor
export GOOGLE_APPLICATION_CREDENTIALS=./app/private/slidespecs.json
open http://localhost:3000
```


##### Audio Concatenation (osx)

Best practices for audio recording: https://cloud.google.com/speech-to-text/docs/best-practices

transcription material: http://www.ushistory.org/declaration/document/

```
brew install sox
```

##### PDF Conversion (osx)

```bash
brew install gs  # dependency
brew install imagemagick      # convert
brew install --cask libreoffice # soffice
```

### Scripts


##### Linting

To lint:

```bash
meteor npm run lint
```

Configuration options (`.eslintrc`)

```json
{
        "extends": [
            "eslint:recommended",
            "plugin:react/recommended",
            "@meteorjs/eslint-config-meteor",
        ],
}
```

##### Data Import/Export

To export data from production, use [`export.sh`](./export.sh). Move the files
in a location specified in `import/api/storagePath.js`. Import the mongoDB
records into a running meteor application with `mongoimport`, shown in the
[`import.sh`](./import.sh) script. Copy from remote server:

     scp -i ~/.ssh/slidespecs slidespecs.berkeley.edu:/Users/jwrnr/Code/research-slidespecs/data.tar.gz .

Installing `mongodb` may be required to use `mongoimport`: `brew install mongodb`



Full paper: [PDF]()

*Published in the Proceedings of the ACM Conference on Intelligent User Interfaces — IUI 2023*

