// Listen to incoming HTTP requests (can only be used on the server).

WebApp.connectHandlers.use('/event', (request, response, next) => {
  let data = {};
  data.session = request.body.session || '';
  data.slideNo = request.body.slideNo || '';
  let validate = ({session, slideNo}) => {
    return !!(session && slideNo);
  };

  console.log(data); // yea

  if (validate(data)) {
    response.writeHead(201);
    response.end('OK.');
    // TODO meteor call to add event to collection.
  } else {
    response.writeHead(400);
    response.end('Malformed data.');
  }
});
