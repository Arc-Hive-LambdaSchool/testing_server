
const axios = require('axios');
const debug = require('debug')('slash-command-template:search');
const qs = require('querystring');
const users = require('./users');

/*
 *  Send ticket creation confirmation via
 *  chat.postMessage to the user who created it
 */
const sendConfirmation = (slackSearch) => {
  console.log(slackSearch);
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: slackSearch.userId,
    text: 'hive command test',
    attachments: JSON.stringify([
      {
        title: `Link to airtable!`,
        // Get this from the 3rd party helpdesk system
        title_link: 'https://airtable.com/tblWIvD0du6JQqdlx/viwOTYwUI4rsn7E0e',
        text: slackSearch.text,
        fields: [
          {
            title: 'Tags',
            value: slackSearch.tags || 'None provided',
          },
          {
            title: 'Cohort',
            value: slackSearch.cohort || 'None provided',
            short: true,
          },
          {
            title: 'Brownbag!',
            value: slackSearch.brownbag || 'No',
          }
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

const arcConfirmation = (slackSearch) => {
  console.log(slackSearch);
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    response_type: "in_channel",
    channel: `#${slackSearch.cohort}`,
    text: `@channel`,
    attachments: JSON.stringify([
      {
        title: `Ticket created for user`,
        // Get this from the 3rd party helpdesk system
        title_link: 'http://example.com',
        text: slackSearch.text,
        fields: [
          {
            title: 'Link',
            value: slackSearch.arcLink,
          },
          {
            title: 'Title',
            value: slackSearch.arcTitle,
          },
          {
            title: 'Tags',
            value: slackSearch.tags,
          },
          {
            title: 'Cohort',
            // value: slackSearch.cohort, `@channel ${slackSearch.cohort}`,
            value: `${slackSearch.cohort}`,
            short: true,
          },
          {
            title: 'Brownbag',
            value: slackSearch.brownbag || 'No',
          },
        ],
      },
    ]),
  })).then((result) => {
    debug('arcConfirmation: %o', result.data);
  }).catch((err) => {
    debug('arcConfirmation error: %o', err);
    console.error(err);
  });
};


// Create helpdesk slackSearch. Call users.find to get the user's email address
// from their user ID
const create = (userId, submission) => {
  const slackSearch = {};

  const fetchUserEmail = new Promise((resolve, reject) => {
    users.find(userId).then((result) => {
      debug(`Find user: ${userId}`);
      resolve(result.data.user.profile.email);
    }).catch((err) => { reject(err); });
  });

  fetchUserEmail.then((result) => {
    slackSearch.userId = userId;
    slackSearch.userEmail = result;
    slackSearch.tags = submission.tags;
    slackSearch.cohort = submission.cohort;
    slackSearch.brownbag = submission.brownbag;
    slackSearch.arcLink = submission.arcLink;
    slackSearch.arcTitle = submission.arcTitle;
    if (slackSearch.arcLink) {
      arcConfirmation(slackSearch);
  } else {
      sendConfirmation(slackSearch);
  }
    return slackSearch;
  }).catch((err) => { console.error(err); });
};

module.exports = { create, sendConfirmation };
