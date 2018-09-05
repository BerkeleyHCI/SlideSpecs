// Using iron-router to handle post request.

/*
Router.route('post', {
  path: '/eventUpdate/',
  where: 'server',
  action: function() {
    let data = {};
    data.session = this.request.body.session || '';
    data.slideNo = this.request.body.slideNo || '';
    let validate = ({session, slideNo}) => {
      return !!(session && slideNo);
    };

    console.log(data); // yea

    if (validate(data)) {
      this.response.statusCode = 201;
      this.response.setHeader('Content-Type', 'application/json');
      this.response.end("{status: 'Slide event updated OK.'}\n");
      // TODO meteor call to add event.
    } else {
      this.response.statusCode = 400;
      this.response.setHeader('Content-Type', 'application/json');
      this.response.end("{status: 'malformed data'}\n");
    }
  },
});
 * */
