'use strict';

let Wit = null;
let interactive = null;
let log = null;
let bot = null;
try {
  Wit = require('node-wit').Wit;
  interactive = require('node-wit').interactive;
  log = require('node-wit').log;
  bot = require('index');
} catch (e) {
  Wit = require('node-wit').Wit;
  interactive = require('node-wit').interactive;
  log = require('node-wit').log;
  bot = require('index');
}

const accessToken = (() => {
  if (process.argv.length !== 3) {
    console.log('usage: node examples/quickstart.js <wit-access-token>');
    process.exit(1);
  }
  return process.argv[2];
})();



// Quickstart example

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const actions = {
  send(request, response) {
    const {sessionId, context, entities} = request;
    const {text, quickreplies} = response;
    return new Promise(function(resolve, reject) {
      console.log('sending...', JSON.stringify(response));
      return resolve();
    });
  },
  getForecast({context, entities}) {
    let climate = ['sunny','cloudy','rainy','foggy'];
    return new Promise(function(resolve, reject) {
      var location = firstEntityValue(entities, 'location')
      if (location) {
        context.forecast = climate[Math.floor(Math.random() * climate.length)];
        delete context.missingLocation;
      } else {
        context.missingLocation = true;
        delete context.forecast;
      }
      return resolve(context);
    });
  },
};

const client = new Wit({accessToken,
  actions,
  logger: new log.Logger(log.INFO)});
interactive(client);
