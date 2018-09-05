import {createEvent} from '../../api/events/methods.js';

// Listen to incoming HTTP requests (can only be used on the server).

WebApp.connectHandlers.use('/event', (request, response) => {
  let data = {};
  data.session = request.body.session || '';
  data.slideNo = Number(request.body.slideNo) || '';
  let validate = ({session, slideNo}) => {
    return !!(session && slideNo);
  };

  console.log(data); // yea

  if (!validate(data)) {
    response.writeHead(400);
    response.end('Malformed data.');
    return;
  }

  createEvent.call({...data}, (err, res) => {
    if (err) {
      console.error(err);
      response.writeHead(400);
      response.end('Server error.');
    } else {
      response.writeHead(201);
      response.end('OK.');
    }
  });
});
