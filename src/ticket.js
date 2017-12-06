const axios = require('axios');
const debug = require('debug')('slash-command-template:ticket');
const qs = require('querystring');
const users = require('./users');

/*
 *  Send ticket creation confirmation via
 *  chat.postMessage to the user who created it
 */
const sendConfirmation = (ticket) => {
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: ticket.userId,
    text: 'Lambda School Videos',
    attachments: JSON.stringify([
      {
        title: `Ticket created for ${ticket.userEmail}`,
        // Get this from the 3rd party helpdesk system
        title_link: 'http://example.com',
        text: ticket.text,
        fields: [
          // {
          //   title: 'Title',
          //   value: ticket.title,
          // },
          {
            title: 'Tags',
            value: ticket.tags || 'None provided',
          },
          {
            title: 'Cohort',
            value: ticket.cohort || 'None provided',
            short: true,
          },
        ],
      },
    ]),
  })).then((result) => {
    debug('sendConfirmation: %o', result.data);
  }).catch((err) => {
    debug('sendConfirmation error: %o', err);
    console.error(err);
  });
};

// Create helpdesk ticket. Call users.find to get the user's email address
// from their user ID
const create = (userId, submission) => {
  const ticket = {};

  const fetchUserEmail = new Promise((resolve, reject) => {
    users.find(userId).then((result) => {
      debug(`Find user: ${userId}`);
      resolve(result.data.user.profile.email);
    }).catch((err) => { reject(err); });
  });

  fetchUserEmail.then((result) => {
    ticket.userId = userId;
    ticket.userEmail = result;
    // ticket.title = submission.title;
    ticket.tags = submission.tags;
    ticket.cohort = submission.cohort;
    sendConfirmation(ticket);

    return ticket;
  }).catch((err) => { console.error(err); });
};

module.exports = { create, sendConfirmation };
