
const axios = require('axios');
const debug = require('debug')('slash-command-template:search');
const qs = require('querystring');
const users = require('./users');
const index = require('./index.js');
// const bcrypt = require('bcrypt');
// const salt = bcrypt.genSaltSync(10);
// const hash = bcrypt.hashSync(process.env.KEYWORD, salt);

const sendConfirmation = (slackSearch) => {
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: slackSearch.userId,
    text: 'hive command test',
    attachments: JSON.stringify([
      {
        // title: `Link to airtable`,
        // // Get this from the 3rd party helpdesk system
        // title_link: 'https://airtable.com/tblWIvD0du6JQqdlx/viwOTYwUI4rsn7E0e',
        // text: slackSearch.text,
        title: `Ticket created for ${slackSearch.userName}`,
        fields: [
          {
            title: 'Tags',
            value: slackSearch.tags || 'None provided',
            short: true,
          },
          {
            title: 'Cohort',
            value: slackSearch.cohort || 'None provided',
            short: true,
          },
          {
            title: 'Brownbag!',
            value: slackSearch.brownbag || 'No',
            short: true,
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

// const arcConfirmation = (slackSearch) => {
//   if (bcrypt.compareSync(slackSearch.keyword, hash)) {
//     axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
//       token: process.env.SLACK_ACCESS_TOKEN,
//       // response_type: "in_channel",
//       channel: slackSearch.userId,
//       text: '@channel',
//       attachments: JSON.stringify([
//         {
//           title: 'arc test w/ keyword successful',
//           title_link: 'http://example.com',
//           text: slackSearch.text,
//           fields: [
//             {
//               title: 'Link',
//               value: slackSearch.arcLink,
//             },
//             {
//               title: 'Title',
//               value: slackSearch.arcTitle,
//             },
//             {
//               title: 'Other Tags',
//               value: slackSearch.allLabels,
//             },
//           ],
//         },
//       ]),
//     })).then((result) => {
//       debug('arcConfirmation: %o', result.data);
//     }).catch((err) => {
//       debug('arcConfirmation error: %o', err);
//       console.error(err);
//     });
//   } else {
//     axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
//       token: process.env.SLACK_ACCESS_TOKEN,
//       // response_type: "in_channel",
//       channel: slackSearch.userId,
//       text: 'CANNOT UPLOAD TO AIRTABLE!! Please enter correct keyword',
//       attachments: JSON.stringify([
//         {
//           title: 'Fields entered:',
//           fields: [
//             {
//               title: 'Link',
//               value: slackSearch.arcLink,
//             },
//             {
//               title: 'Title',
//               value: slackSearch.arcTitle,
//             },
//             {
//               title: 'Instructor',
//               value: slackSearch.arcInstructor,
//             },
//             {
//               title: 'Other Tags',
//               value: slackSearch.allLabels,
//             },
//           ],
//         },
//       ]),
//     })).then((result) => {
//       debug('arcConfirmation: %o', result.data);
//     }).catch((err) => {
//       debug('arcConfirmation error: %o', err);
//       console.error(err);
//     });
//   }
// };

const arcConfirmation2 = (slackSearch) => {
  // if (process.env.USER_EMAILS.includes(slackSearch.userEmail))
  if (process.env.KEYWORD === slackSearch.keyword) 
  {
    axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
      token: process.env.SLACK_ACCESS_TOKEN,
      // response_type: "in_channel",
      channel: slackSearch.userId,
      text: '@channel',
      attachments: JSON.stringify([
        {
          title: 'arc w/ email auth success',
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
              title: 'Other Tags',
              value: slackSearch.allLabels,
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
  } else {
    axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
      token: process.env.SLACK_ACCESS_TOKEN,
      // response_type: "in_channel",
      channel: slackSearch.userId,
      text: 'YOU DO NOT HAVE ACCESS TO UPLOAD TO AIRTABLE!!!  Please contact an administrator if you require access.',
      attachments: JSON.stringify([
        {
          title: 'Fields entered:',
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
              title: 'Instructor',
              value: slackSearch.arcInstructor,
            },
            {
              title: 'Other Tags',
              value: slackSearch.allLabels,
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
  }
};

const timestampConfirmation = (slackSearch) => {
  const newLink = slackSearch.arcLink + '?t=' + slackSearch.arcTime;
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: slackSearch.userId,
    text: '@channel',
    attachments: JSON.stringify([
      {
        title: 'timestamp test',
        fields: [
          {
            title: 'Title',
            value: slackSearch.arcTitle,
          },
          {
            title: 'Instructor',
            value: slackSearch.arcInstructor,
          },
          {
            title: 'new link',
            value: newLink,
          },
          {
            title: 'Tags',
            value: slackSearch.tags || 'None provided',
            short: true,
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

const create = (userId, submission) => {
  const slackSearch = {};

  const fetchUserName = new Promise((resolve, reject) => {
    users.find(userId).then((result) => {
      debug(`Find user: ${userId}`);
      resolve(result.data.user.profile.email);
    }).catch((err) => { reject(err); });
  });

  fetchUserName.then((result) => {
    slackSearch.userId = userId;
    slackSearch.userEmail = result;
    slackSearch.tags = submission.tags;
    slackSearch.cohort = submission.cohort;
    slackSearch.brownbag = submission.brownbag;
    slackSearch.arcLink = submission.arcLink;
    slackSearch.arcTitle = submission.arcTitle;
    slackSearch.arcInstructor = submission.arcInstructor;
    slackSearch.allLabels = submission.allLabels;
    slackSearch.keyword = submission.keyword;
    slackSearch.arcTime = submission.arcTime;
    if (slackSearch.arcTime) {
      timestampConfirmation(slackSearch);
    } else if (slackSearch.arcLink) {
      arcConfirmation2(slackSearch);
    } else {
      sendConfirmation(slackSearch);
    }
    return slackSearch;
  }).catch((err) => { console.error(err); });
};

module.exports = { create, sendConfirmation };
