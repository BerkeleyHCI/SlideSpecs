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

[more instructions here](/app)
