# SlideSpecs

cloning:

    git clone https://github.com/berkeleyhci/SlideSpecs
    cd SlideSpecs/app
    meteor npm install

running:

    open http://localhost:3000
    meteor

deploying

    ssh bayscope # bayscope2.eecs
    cd Desktop/peer-feedback
    git pull

meteor bundle (future deploy option)

    cd app && meteor build --server-only ../output
    # TODO - move this to server, install reqs, run

##### Data Import/Export

To export data from production, use [`export.sh`](./export.sh). Move the files
in a location specified in `import/api/storagePath.js`. Import the mongoDB
records into a running meteor application with `mongoimport`, shown in the
[`import.sh`](./import.sh json-folder/) script. Copy from remote server:

     scp -i ~/.ssh/slidespecs slidespecs.berkeley.edu:/Users/jwrnr/Code/research-slidespecs/data.tar.gz .

Installing `mongodb` may be required to use `mongoimport`: `brew install mongodb`

[more instructions here](/app)
