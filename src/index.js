require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const slackSearch = require('./search');
const debug = require('debug')('slash-command-template:index');
const users = require('./users');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('<h2>The Slash Command and Dialog app is running</h2> <p>Follow the' +
  ' instructions in the README to configure the Slack App and your environment variables.</p>');
});

app.post('/commands', (req, res) => {
  // extract the verification token, slash command text,
  // and trigger ID from payload
  const { token, text, trigger_id } = req.body;

  // check that the verification token matches expected value
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    // create the dialog payload - includes the dialog structure, Slack API token,
    // and trigger ID
    const dialog = {
      token: process.env.SLACK_ACCESS_TOKEN,
      trigger_id,
      dialog: JSON.stringify({
        title: 'LS Videos!',
        callback_id: 'submit-search',
        submit_label: 'Submit',
        elements: [
          // {
          //   label: 'Title',
          //   // type: 'text',
          //   // name: 'title',
          //   value: 'https://pacific-waters-60975.herokuapp.com/',
          //   // hint: '30 second summary of the problem',
          // },
          {
            label: 'Tags',
            type: 'select',
            name: 'tags',
            optional: true,
            options: [
              { label: 'JS', value: 'JS' },
              { label: 'React', value: 'React' },
              { label: 'Redux', value: 'Redux' },
              { label: 'Auth', value: 'Auth' },
              { label: 'C', value: 'C' },
              { label: 'Testing', value: 'Testing' },
            ],
          },
          {
            label: 'Cohort',
            optional: true,
            type: 'select',
            name: 'cohort',
            options: [
              { label: 'CS1', value: 'CS1' },
              { label: 'CS2', value: 'CS2' },
              { label: 'CS3', value: 'CS3' },
              { label: 'CS4', value: 'CS4' },
            ],
          },
          {
            label: 'Brownbag?',
            optional: true,
            type: 'select',
            name: 'brownbag',
            options: [
              { label: 'Yes', value: 'true' },
            ]
          }
        ],
      }),
    };

    // open the dialog by calling dialogs.open method and sending the payload
    axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
      .then((result) => {
        debug('dialog.open: %o', result.data);
        res.send('');
      }).catch((err) => {
        debug('dialog.open call failed: %o', err);
        res.sendStatus(500);
      });
  } else {
    debug('Verification token mismatch');
    res.sendStatus(500);
  }
});

app.post('/button', (req, res) => {
  const { token, trigger_id } = req.body;

  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    const dialog = {
      token: process.env.SLACK_ACCESS_TOKEN,
      trigger_id,
      dialog: JSON.stringify({
        text: "Would you like to play a game?",
        attachments: [
            {
                text: "Choose a game to play",
                fallback: "You are unable to choose a game",
                callback_id: "wopr_game",
                color: "#3AA3E3",
                attachment_type: "default",
                actions: [
              {
                name: "game",
                text: "Chess",
                type: "button",
                value: "chess"
              },
              {
                name: "game",
                text: "Falken's Maze",
                type: "button",
                value: "maze"
              },
              {
                name: "game",
                text: "Thermonuclear War",
                style: "danger",
                type: "button",
                value: "war",
                confirm: {
                  title: "Are you sure?",
                  text: "Wouldn't you prefer a good game of chess?",
                  ok_text: "Yes",
                  dismiss_text: "No"
                }
              }
            ]
          }
        ]
      }),
    };

    axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
      .then((result) => {
        debug('dialog.open: %o', result.data);
        res.send('');
      }).catch((err) => {
        debug('dialog.open call failed: %o', err);
        res.sendStatus(500);
      });
  } else {
    debug('Verification token mismatch');
    res.sendStatus(500);
  }
});

app.post('/arcCommands', (req, res) => {
  const { token, text, trigger_id, user_id } = req.body;

  const findUser = (userId) => {
 
    const fetchUserName = new Promise((resolve, reject) => {
      users.find(userId).then((result) => {
        debug(`Find user: ${userId}`);
        resolve(result.data.user.profile.real_name);
      }).catch((err) => { reject(err); });
    });
  
    fetchUserName.then((result) => {
      openDialog(result);
      return;
    }).catch((err) => { console.error(err); });
  };

  findUser(user_id);

  const openDialog = (userName) => {
    if (token === process.env.SLACK_VERIFICATION_TOKEN) {
      const dialog = {
        token: process.env.SLACK_ACCESS_TOKEN,
        trigger_id,
        dialog: JSON.stringify({
          title: text,
          callback_id: 'submit-search',
          submit_label: 'Submit',
          elements: [
            {
              label: 'Video Link',
              type: 'text',
              name: 'arcLink',
              value: text,
            },
            {
              label: 'Video Title',
              type: 'text',
              name: 'arcTitle',
            },      
            {
              label: 'Instructor',
              type: 'text',
              name: 'arcInstructor',
              value: userName,
            },
            // {
            //   label: 'Enter keyword',
            //   type: 'text',
            //   name: 'keyword',
            // },
            {
              label: 'Other Tags',
              type: 'textarea',
              name: 'allLabels',
              optional: true,
              hint: '(separate with commas) e.g. CS1, CS2, JS, React, Redux, Brownbag, etc...'
            },
          ],
        }),
      };
  
      axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
        .then((result) => {
          debug('dialog.open: %o', result.data);
          res.send('');
        }).catch((err) => {
          debug('dialog.open call failed: %o', err);
          res.sendStatus(500);
        });
    } else {
      debug('Verification token mismatch');
      res.sendStatus(500);
    }
  };
});

app.post('/timestamp', (req, res) => {
  const { token, text, trigger_id, user_id } = req.body;

  const findUser = (userId) => {
 
    const fetchUserName = new Promise((resolve, reject) => {
      users.find(userId).then((result) => {
        debug(`Find user: ${userId}`);
        resolve(result.data.user.profile.real_name);
      }).catch((err) => { reject(err); });
    });
  
    fetchUserName.then((result) => {
      openDialog(result);
      return;
    }).catch((err) => { console.error(err); });
  };

  findUser(user_id);

  const openDialog = (userName) => {
    if (token === process.env.SLACK_VERIFICATION_TOKEN) {
      const dialog = {
        token: process.env.SLACK_ACCESS_TOKEN,
        trigger_id,
        dialog: JSON.stringify({
          title: 'add a timestamp',
          callback_id: 'submit-search',
          submit_label: 'Submit',
          elements: [
            {
              label: 'Video Link',
              type: 'text',
              name: 'arcLink',
              value: text,
            },
            {
              label: 'Video Title',
              type: 'text',
              name: 'arcTitle',
            },      
            {
              label: 'Instructor',
              type: 'text',
              name: 'arcInstructor',
              value: userName,
            },
            {
              label: 'Enter time',
              type: 'text',
              name: 'arcTime',
              hint: 'e.g. 1h2m35s'
            },
            {
              label: 'Tags',
              type: 'select',
              name: 'tags',
              options: [
                { label: 'JS', value: 'JS' },
                { label: 'React', value: 'React' },
                { label: 'Redux', value: 'Redux' },
                { label: 'Auth', value: 'Auth' },
                { label: 'C', value: 'C' },
                { label: 'Testing', value: 'Testing' },
              ],
            },
          ],
        }),
      };
  
      axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
        .then((result) => {
          debug('dialog.open: %o', result.data);
          res.send('');
        }).catch((err) => {
          debug('dialog.open call failed: %o', err);
          res.sendStatus(500);
        });
    } else {
      debug('Verification token mismatch');
      res.sendStatus(500);
    }
  };
});

app.post('/interactive-component', (req, res) => {
  const body = JSON.parse(req.body.payload);

  // check that the verification token matches expected value
  if (body.token === process.env.SLACK_VERIFICATION_TOKEN) {
    debug(`Form submission received: ${body.submission.trigger_id}`);

    // immediately respond with a empty 200 response to let
    // Slack know the command was received
    res.send('');

    // create Helpdesk ticket
    slackSearch.create(body.user.id, body.submission);
  } else {
    debug('Token mismatch');
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});
