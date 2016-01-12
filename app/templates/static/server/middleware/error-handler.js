// jshint unused:false
import path from 'path';
import errors from 'feathers-errors';

export default function(app) {
  return function(error, req, res, next) {
    if (typeof error === 'string') {
      error = new errors.GeneralError(error);
    }
    else if ( !(error instanceof errors.FeathersError) ) {
      let oldError = error;
      error = new errors.GeneralError(oldError.message, {errors: oldError.errors});

      if (oldError.stack) {
        error.stack = oldError.stack;
      }
    }

    const code = parseInt(error.code, 10) !== NaN ? parseInt(error.code, 10) : 500;

    // Don't show stack trace if it is a 404 error
    if (code === 404) {
      error.stack = null;
    }

    res.status(code);

    res.format({
      'text/html': function() {
        const file = code === 404 ? '404.html' : '500.html';
        res.sendFile(path.join(app.get('public'), file));
      },

      'application/json': function () {
        let output = {
          code,
          message: error.message,
          name: error.name
        };

        if (app.settings.env !== 'production') {
          output.stack = error.stack;
        }

        res.json(output);
      }
    });
  };
}
