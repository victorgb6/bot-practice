'use strict';

let Wit = null;
let bot = null;
try {
  Wit = require('node-wit').Wit;
  bot = require('./index');
  console.log('Wit:', Wit);
} catch (e) {
  console.error(e.stack);
}

const accessToken = process.env.WIT_TOKEN || 'NTH3EN3Q47PMQQHL7YECGPIPYDSU4YMY';

// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {tid: telegramUserId, context: sessionState}
const sessions = {};

const findOrCreateSession = (chatId, tid) => {
  let sessionId;
  // Let's see if we already have a session for the user tid
  Object.keys(sessions).forEach(k => {
    if (sessions[k].tid === tid) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    // No session found for user tid, let's create a new one
    sessionId = chatId;
    sessions[sessionId] = {tid: tid, context: {}};
  }
  return sessionId;
};


//Telegram Code
const tMessage = (id, text) => {
  return bot.sendMessage(id, text);
};

//Telegram message listener
bot.on('message', (msg) => {
  console.log('Got this message', msg);
  const sender = msg.from.id;
  const chatId = msg.chat.id;
  const sessionId = findOrCreateSession(chatId, sender);
  const text = msg.text;

  if (text) {
    Wit.runActions(
      sessionId, // the user's current session
      text, // the user's message
      sessions[sessionId].context // the user's current session state
    ).then((context) => {
      // Our bot did everything it has to do.
      // Now it's waiting for further messages to proceed.
      console.log('Waiting for next user messages');

      /*if (context['done']) {
        delete sessions[sessionId];
      }*/

      // Updating the user's current session state
      sessions[sessionId].context = context;
    })
    .catch((err) => {
      console.error('Oops! Got an error from Wit: ', err.stack || err);
    })
  }
});


// Quickstart example

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const actions = {
  send({sessionId}, {text}) {
    // Our bot has something to say!
    // Let's retrieve the Telegram user whose session belongs to
    const recipientId = sessions[sessionId].tid;
    if (recipientId) {
      // Yay, we found our recipient!
      // Let's forward our bot response to her.
      // We return a promise to let our bot know when we're done sending
      return tMessage(recipientId, text)
      .then(() => null)
      .catch((err) => {
        console.error(
          'Oops! An error occurred while forwarding the response to',
          recipientId,
          ':',
          err.stack || err
        );
      });
    } else {
      console.error('Oops! Couldn\'t find user for session:', sessionId);
      // Giving the wheel back to our bot
      return Promise.resolve()
    }
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

const client = new Wit({accessToken, actions});
