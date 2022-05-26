const { App } = require('@slack/bolt');
const request = require('request');

// Initializes your app with your bot token and signing secret
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    // socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: process.env.PORT || 3000
});

// Listens to incoming messages that contain "manage users"
app.message('manage users', async({ message, say }) => {
    // say() sends a message to the channel where the event was triggered
    await say({
        blocks: [{
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Hello <@${message.user}>, Please use one of the below format for your request to: \n\n Find a user’s attributes: *query <user_email>* \n\n List all users: *list* \n\n Create a new user with attributes: *create <user_email> firstName=<user_firstName> lastName=<user_lastName>* \n\n Update an existing user’s attribute(s): *update <user_email> firstName=<user_firstName> lastName=<user_lastName> mobilePhone=<user_mobilePhone> secondEmail=<user_secondEmail> email=<user_email>*`
                }
            },
            {
                "type": "divider"
            }
        ],
        text: `Hello there <@${message.user}>!`
    });
});

/**
 * Listen to incoming messages that contain "create"
 * Create a new user by proving the first name, last name, email address and login email 
 */
app.message('create', async({ message, say }) => {
    const queryString = message.text.split(' ');
    const email = queryString[1].split(':')[1] ? queryString[1].split(':')[1].split('|')[0] : queryString[1];
    var profileObj = { "email": email, "login": email };
    for (var i = 2; i < queryString.length; i++) {
        if (queryString[i].indexOf('=') != -1) {
            // This is an attribute with a key/value pair
            var keyValue = queryString[i].split('=');
            var key = keyValue[0];
            var value = keyValue[1];
            profileObj[key] = value;
        }
    }

    const profile = { "profile": profileObj };
    // console.log('profiel >>: ', profile);

    createUser(profile).then((result) => {
        var results = '';
        Object.keys(profileObj).forEach(key => {
            let value = profileObj[key];
            results += key + ': ' + value + '\n';
        });
        const response = JSON.parse(result);
        if (response.errorCode) {
            say(`[Creation: Failed]\n\n ${response.errorCauses[0].errorSummary} \n\n ${results}`);
        } else if (response.status === 'STAGED' || response.status === 'ACTIVE') {
            say(`[Creation: Success]\n\n ${results}`);
        }
    }).catch((error) => {
        console.error('Error: ', error);
    });
});

/**
 * Listen to incoming messages that contain "query"
 * Find a user by his/her login email address
 */
app.message('query', async({ message, say }) => {
    const queryString = message.text.split(' ');
    const email = queryString[1].split(':')[1] ? queryString[1].split(':')[1].split('|')[0] : queryString[1];

    getUser(email).then((result) => {
        const response = JSON.parse(result);
        // console.log('getUser details', response);

        if (response.errorCode) {
            say(`User couldn't be found: \n\n ${response.errorSummary}`);
        } else if (response.status === 'STAGED' || response.status === 'ACTIVE') {
            var results = '';
            Object.keys(response.profile).forEach(key => {
                let value = response.profile[key];
                results += key + ': ' + value + '\n';
            });
            // console.log(results);
            say(`${results}`);
        }
    }).catch((error) => {
        console.error('Error: ', error);
    });
});

/**
 * Update a user
 */
app.message('update', async({ message, say }) => {
    const queryString = message.text.split(' ');
    const email = queryString[1].split(':')[1] ? queryString[1].split(':')[1].split('|')[0] : queryString[1];
    var profileObj = {};
    for (var i = 2; i < queryString.length; i++) {
        if (queryString[i].indexOf('=') != -1) {
            // This is an attribute with a key/value pair
            var keyValue = queryString[i].split('=');
            var key = keyValue[0];
            var value = keyValue[1];
            profileObj[key] = value;
        }
    }
    const profile = { "profile": profileObj };

    getUser(email).then((result) => {
        const response = JSON.parse(result);
        // console.log('getUser details', response);

        if (response.errorCode) {
            say(`User couldn't be found: \n\n ${response.errorSummary}`);
        } else if (response.status === 'STAGED' || response.status === 'ACTIVE') {
            const userId = response.id;
            // console.log('userId >>>', userId);

            updateUser(userId, profile).then((result) => {
                var results = '';
                Object.keys(profileObj).forEach(key => {
                    let value = profileObj[key];
                    results += key + ': ' + value + '\n';
                });

                if (response.errorCode) {
                    say(`[Update: Failed]\n\n ${response.errorCauses[0].errorSummary} \n\n Email: ${email}\n\n ${results}`);
                } else if (response.status === 'STAGED' || response.status === 'ACTIVE') {
                    say(`[Update: Success]\n\n Email: ${email}\n\n ${results}`);
                }
            }).catch((error) => {
                console.error('Error: ', error);
            });
        }
    }).catch((error) => {
        console.error('Error: ', error);
    });
});

/**
 * List all users
 */
app.message('list', async({ message, say }) => {

    getUsers().then((result) => {
        const response = JSON.parse(result);

        if (response.errorCode) {
            say(`User couldn't be found: \n\n ${response.errorSummary}`);
        } else if (response.length > 0) {
            var results = '';
            for (var i = 0; i < response.length; i++) {
                results += response[i].profile.firstName + ' ' + response[i].profile.lastName + ' - ' + response[i].profile.email + '\n';
            }
            // console.log('results \n\n', results);
            say(`Users: \n\n ${results}`);
        }
    }).catch((error) => {
        console.error('Error: ', error);
    });
});

/**
 * Create a new user by providing his/her profile details which consist of first name, last name, email, and login email
 * @param {*} profile 
 * @returns 
 */
function createUser(profile) {

    return new Promise((resolve, reject) => {
        var options = {
            'method': 'POST',
            'url': process.env.OKTA_ISSUER_URI + '/api/v1/users?activate=false',
            'headers': {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'SSWS ' + process.env.OKTA_API_TOKEN
            },
            body: JSON.stringify(profile)

        };
        request(options, (error, response) => {
            if (error) {
                console.error(error);
                reject(error);
            } else if (response.body.error) {
                console.error('Error: ', response.body.error);
                reject(new Error(response.body.error));
            }
            resolve(response.body);
        });
    });
}

/**
 * Get a user details by his/her login email address
 * @param {*} email 
 * @returns 
 */
function getUser(email) {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'GET',
            'url': process.env.OKTA_ISSUER_URI + '/api/v1/users/' + email,
            'headers': {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'SSWS ' + process.env.OKTA_API_TOKEN
            }
        };
        request(options, (error, response) => {
            if (error) {
                console.error(error);
                reject(error);
            } else if (response.body.error) {
                console.error('Error: ', response.body.error);
                reject(new Error(response.body.error));
            }
            resolve(response.body);
        });
    });
}

function getUsers() {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'GET',
            'url': process.env.OKTA_ISSUER_URI + '/api/v1/users?limit=200',
            'headers': {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'SSWS ' + process.env.OKTA_API_TOKEN
            }
        };
        request(options, (error, response) => {
            if (error) {
                console.error(error);
                reject(error);
            } else if (response.body.error) {
                console.error('Error: ', response.body.error);
                reject(new Error(response.body.error));
            }
            resolve(response.body);
        });
    });
}

function updateUser(userId, profile) {

    return new Promise((resolve, reject) => {
        var options = {
            'method': 'POST',
            'url': process.env.OKTA_ISSUER_URI + '/api/v1/users/' + userId,
            'headers': {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'SSWS ' + process.env.OKTA_API_TOKEN
            },
            body: JSON.stringify(profile)

        };
        request(options, (error, response) => {
            if (error) {
                console.error(error);
                reject(error);
            } else if (response.body.error) {
                console.error('Error: ', response.body.error);
                reject(new Error(response.body.error));
            }
            resolve(response.body);
        });
    });
}

(async() => {
    // Start your app
    await app.start();

    console.log('⚡️ Bolt app is running!');
})();