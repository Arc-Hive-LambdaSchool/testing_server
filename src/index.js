require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const slackSearch = require('./search');
const debug = require('debug')('slash-command-template:index');
const users = require('./users');
const jwt = require('jsonwebtoken');
const request = require('request');


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


app.post('/slackzoom', (req, res) => {
  const { token, text, trigger_id } = req.body;

  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    const dialog = {
      token: process.env.SLACK_ACCESS_TOKEN,
      trigger_id,
      dialog: JSON.stringify({
        title: 'Start a zoom meeting',
        callback_id: 'submit-search',
        submit_label: 'Submit',
        elements: [
          {
            label: 'Title of lecture',
            type: 'text',
            name: 'topic',
            value: text,
          },
          {
            label: 'Zoom email address',
            type: 'text',
            name: 'zoomEmail',
          },
          {
            label: 'Tags',
            type: 'text',
            name: 'tags',
            optional: true,
          },
          {
            label: 'Cohort',
            optional: true,
            type: 'text',
            name: 'cohort',
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
              value: ` by ${userName}`,
              hint: 'enter title'
            },      
            // {
            //   label: 'Instructor',
            //   type: 'text',
            //   name: 'arcInstructor',
            //   value: userName,
            // },
            {
              label: 'Enter keyword',
              type: 'text',
              name: 'keyword',
            },
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

  if (body.token === process.env.SLACK_VERIFICATION_TOKEN) {
    debug(`Form submission received: ${body.submission.trigger_id}`);

    res.send('');

    slackSearch.create(body.user.id, body.submission);
  } else {
    debug('Token mismatch');
    res.sendStatus(500);
  }
});

/*=======================================================================
=========================================================================
* ZOOM ROUTES
=========================================================================
========================================================================*/

/*************************************************************************
* ==============ZOOM CREATE ROUTE==============
**************************************************************************/

app.post('/zoom', (req, res) => { // Changed get to post
  const payload = {
    "iss": process.env.ZOOM_KEY,
    "exp": Math.floor(Date.now() / 1000) + (60 * 60)
  };
  const token = jwt.sign(payload, process.env.ZOOM_SECRET);
  const z = {
    method: 'POST',
    uri: 'https://api.zoom.us/v2/users/ta@lambdaschool.com/meetings',
    headers: {
      Authorization: 'Bearer' + token,
      "alg": 'HS256',
      "typ": 'JWT',
    },
    body: {
      "topic": req.body.topic,
      "type": 1,
      "host_id": "268933",
      "settings": {
        "auto_recording": "cloud",
      },
    },
    json: true
  };
  request(z, (error, response, body) => {
    if (error) {
      console.log(error);
      return;
    }
    const zoomData = {
      cohort: req.body.cohort,
      zoomLink: body.join_url
    }
    slackSearch.startZoom(zoomData);
    res.send(response);
  });
  // res.send('ZOOM ZOOM');
});

/*************************************************************************
* ==============ZOOM-SLACK ROUTE==============
**************************************************************************/

app.post('/slackzoom', (req, res) => {
  const { token, text, trigger_id } = req.body;

  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    const dialog = {
      token: process.env.SLACK_ACCESS_TOKEN,
      trigger_id,
      dialog: JSON.stringify({
        title: 'Start a zoom meeting',
        callback_id: 'submit-search',
        submit_label: 'Submit',
        elements: [
          {
            label: 'Title of lecture',
            type: 'text',
            name: 'topic',
            value: text,
          },
          {
            label: 'Zoom email address',
            type: 'text',
            name: 'zoomEmail',
          },
          {
            label: 'Password',
            type: 'text',
            name: 'password',
          },
          {
            label: 'Cohort',
            type: 'text',
            name: 'cohort',
          },
          {
            label: 'Tags',
            optional: true,
            type: 'text',
            name: 'tags',
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
});

/*************************************************************************
* ==============ZOOM-RECORDING ROUTE==============
**************************************************************************/
let yt_token;

app.post('/recordings', (req, res) => {
  // Sample nodejs code for videos.insert
  const SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl', 'https://www.googleapis.com/auth/youtube.upload'];
  console.log('586: ' + yt_token);


  const videosInsert = (oAuthTravler, requestData) => {
    console.log('596 RequestData: ' + requestData);
    const service = google.youtube('v3');
    const parameters = requestData['params'];
    parameters['auth'] = oAuthTravler;
    parameters['media'] = { body: fs.createReadStream(requestData['mediaFilename']) };
    parameters['notifySubscribers'] = false;
    parameters['resource'] = requestData['properties'];
    const req = service.videos.insert(parameters, ((err, data) => {
      if (err) {
        console.log('The API returned an error: ' + err);
      }
      if (data) {
        console.log(util.inspect(data, false, null));
      }
      process.exit();
    }));
  };

  const params = {
    'params': {
      'part': 'snippet,status'
    },
    'properties': {
      'snippet.categoryId': '22',
      // 'snippet.defaultLanguage': '',
      'snippet.description': 'Lambda School Lecture',
      // 'snippet.tags[]': '',
      'snippet.title': 'Mongo III',
      // 'status.embeddable': '',
      // 'status.license': '',
      'status.privacyStatus': 'unlisted',
      // 'status.publicStatsViewable': ''
      },
      'mediaFilename': 's3://zoom-cmr/cmr/replay/2017/12/19/205210934/58B0368B-32C1-4B2C-AC2A-0DD163AB9FC0/GMT20171219-194245_JSON-V_1280x800.mp4',
    };

  videosInsert(oAuthTravler, params);
  res.send('It probably worked');
});

app.get('/recordings', (req, res) => {
  // console.log('GET');
  // console.log(req.params);
  // console.log(req.query.code);
  // youtube_code = req.query.code;
  res.send(req.query.code);
});

/*=======================================================================
=========================================================================
* AUTH ROUTES
=========================================================================
========================================================================*/
let oAuthTravler;
/*************************************************************************
* ==============INITIAL YOUTUBE AUTH ROUTE==============
**************************************************************************/
app.get('/auth', (req, res) => {
  const SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl', 'https://www.googleapis.com/auth/youtube.upload'];
  const creds = {
    client_secret: process.env.YOUTUBE_CLIENT_SECRET,
    client_id: process.env.YOUTUBE_CLIENT_ID,
    redirect_uri: 'https://pacific-waters-60975.herokuapp.com/auth-confirmation',
  };

  const authorize = (credentials) => {
    const clientSecret = credentials.client_secret;
    const clientId = credentials.client_id;
    const redirectUrl = credentials.redirect_uri;
    const auth = new googleAuth();
    oAuthTraveler = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    getNewToken(oAuthTraveler);
  };
  const getNewToken = (oAuthTraveler) => {
    const authUrl = oAuthTraveler.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    opn(authUrl, {app: 'google chrome'});
    res.redirect(authUrl);
  };
  authorize(creds);
});

app.get('/auth-confirmation', (req, res) => {
  const code = req.query.code;

  const receiveToken = (code) => {
    oAuthTraveler.getToken(code, ((err, token) => {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      console.log(token);
      oAuthTraveler.credentials = token;
      yt_token = token;
    }));
  };

  receiveToken(code);
  res.send(yt_token);
});

app.get('/success', (req, res) => {
    res.send('YAAAAAAAAAAAAAAYYYYYYYYYYYYY');
});

app.get('/fail', (req, res) => {
  res.send('FAIL FAIL FAIL');
});


/*
const MONGO_URL = 'mongodb://arc_hive_admin:arc hive 555@ds013475.mlab.com:13475/arc_hive_testdb';
MongoClient.connect(MONGO_URL, (err, db) => {
  if (err) {
    return console.log(err);
  }
  // Do something with db here, like inserting a record
  db.collection('arc_hive_testdb').insertOne(
    {
      text: 'Hopefully this works!'
    },
    function (err, res) {
      if (err) {
        db.close();
        return console.log(err);
      }
      // Success
      db.close();
    }
  )
});
*/

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});
