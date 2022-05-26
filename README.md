# moveworks-identity-chatbot
This exercise consist of building an identity chatbot to help HR managers to easily make changes, add new users and list users to the company employee directory through the chatbot.

This demo contains following features:

- Find a user
- List all users
- Create new users
- Update an existing user profile

# Prerequisites

- Nodejs LTS
- Github
- Slack account
- Okta account
- Ngork account

## Quick Start

This section shows you how to prepare, and run the sample application on your local environment.

### Slack
#### Create a workspace
To get started, we’ll need a workspace to install our bot in. A [Slack workspace](https://slack.com/intl/en-ng/help/articles/212675257-Join-a-Slack-workspace#:~:text=A%20Slack%20workspace%20is%20made,separate%20account%20for%20each%20one) is a way to group communication within an organization. Everyone in an organization can belong to one workspace, which is then subdivided into multiple channels.

Install Slack on your device and create a [new workspace](https://slack.com/create#email). Slack will then send a 6-digit code to your email that you can use for verification. Now for the fun part! Give your workspace a name; for this example, we’ll create a workspace called moveworks.

#### Create a new Slack application
Now, we’ll create a new Slack app. Slack apps are small applications that provide specific functionalities within a workspace. You can install a preexisting Slack application by signing into your Slack workspace and searching for applications within the Slack app directory.

The Slack app we’ll create is a knowledge base that helps HR managers quickly manage users within the organisation.

To create a new Slack application, head to the [Slack API](https://api.slack.com/apps/) dashboard. Click the Create New App button on the top right. Give your bot a name, then select what workspace you would like to install the app to. We’ve called ours MoveworksHR.

#### oAuth and Permissions
We need to give our new application certain permissions for it to access data and perform actions within our Slack workspace.

On your Slack dashboard, you’ll find the **OAuth and Permissions** menu option on the left sidebar. Once you navigate here, scroll down to **Scopes**. We need our chatbot to be able to read instant messages from users and respond to those messages.

#### Install the app to your workspace
With that done, we can now install the app to our workspace. From the left sidebar, navigate to **Settings** > **Install Apps** > **Install to Workspace**.

### Install

## ngrok agent
The ngrok agent is the command line application that you will use to start your tunnels. The easiest way to get started is to use your favorite package manager to install ngrok. I used rew on my MacOS.
1. Install the ngrok agent
    ``` bash
    brew install ngrok/ngrok/ngrok
    ```
2. Connect your agent to your ngrok account

Now that the ngrok agent is installed, let's connect it to your ngrok Account. If you haven't already, sign up (or log in) to the ngrok Dashboard and get your Authtoken. The ngrok agent uses the authtoken (sometimes called tunnel credential) to log into your account when you start a tunnel.

Copy the value and run this command to add the authtoken in your terminal.
    ``` bash
    ngrok config add-authtoken TOKEN
    ```
4. Start ngrok

    ```
    ngrok http 3000
    ```
Copy the Forwarding URL which you will need to use in your slack app setting in the following app features once enabled:

- **Interactivity & Shortcuts** > **Intercative**
- **Event Subscriptions** > **Enable Events**

## Chatbot app

1. Using the Terminal app, enter the `install` command in your project directory. This command installs libraries that are required to run the sample application.
    ```
    # install dependencies
    npm install
    ```
2. Start the application by entering the following command.
    ```
    npm start
    ```
3. Your sample application should start on port `http://localhost:3000` or whatever port you have set.


## Resources

- You can find full Slack SDK document (Bolt JS) at [Getting started](https://slack.dev/bolt-js/tutorial/getting-started)
- You can the Core Okta API documentation at [Core Okta API](https://developer.okta.com/docs/reference/core-okta-api/)
