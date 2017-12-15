require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const slackSearch = require('./search');
const debug = require('debug')('slash-command-template:index');

const app = express();

/*
 * Parse application/x-www-form-urlencoded && application/json
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('<h2>The Slash Command and Dialog app is running</h2> <p>Follow the' +
  ' instructions in the README to configure the Slack App and your environment variables!</p>');
});

/*
 * Endpoint to receive /helpdesk slash command from Slack.
 * Checks verification token and opens a dialog to capture more info.
 */
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
        title: 'LS Videos! - TYGE TEST',
        callback_id: 'submit-search',
        submit_label: 'Submit',
        elements: [
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
              { label: 'CS5', value: 'CS5' },
              { label: 'CS6', value: 'CS6' },

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

app.post('/arcCommands', (req, res) => {
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
        title: 'LS Videos',
        callback_id: 'submit-search',
        submit_label: 'Submit',
        elements: [
          {
            label: 'Enter video link here',
            type: 'text',
            name: 'arcLink',
            value: text,
            // value: 'enter link here',
          },
          {
            label: 'Enter video title',
            type: 'text',
            name: 'arcTitle',
            // value: 'enter title here',
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
          {
            label: 'Cohort',
            type: 'select',
            name: 'cohort',
            options: [
              { label: 'CS1', value: 'CS1' },
              { label: 'CS2', value: 'CS2' },
              { label: 'CS3', value: 'CS3' },
              { label: 'CS4', value: 'CS4' },
              { label: 'CS5', value: 'CS5' },
              { label: 'CS6', value: 'CS6' },
              { label: 'CS7', value: 'CS7' },
              { label: 'CS8', value: 'CS8' },
              { label: 'CS9', value: 'CS9' },
              { label: 'CS10', value: 'CS10' },
              { label: 'CS11', value: 'CS11' },
              { label: 'CS12', value: 'CS12' },
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

    ),
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
