# Chat Application with Ionic 7, React, Electron, and PubNub Chat SDK

![Powered by PubNub](https://github.com/antoniormrzz/ionic-7-electron-chat/assets/45634189/a9c8883e-bc7e-4177-a2bb-4b8b6ce9c4a9)
 PubNub logo and name belong to [PubNub](https://www.pubnub.com/).
 
This repository contains a chat application built with Ionic 7, React, Electron, and the PubNub Chat SDK. It serves as a demonstration of the capabilities of the Chat SDK and provides an example for building your own chat applications.
This is not an official example repository of [the Chat SDK](https://www.npmjs.com/package/@pubnub/chat). Please refer to [The Official Docs](https://www.pubnub.com/docs/chat/chat-sdk/build/sample-chat) for that.

## Table of Contents

- [Features](#features)
- [Official Documentation](#documentation)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

## Features

Covers most of the PubNub Chat SDK version 0.1.0 functionality:

- Log in as test users
- Create one-on-one, group, and public conversations
- Add other users to conversations at later points
- Message other users and groups
- Reply to, Forward, React to, Report, Delete, and Pin messages
- Typing indicator, last seen, read receipts, count unread messages, online users in conversation
- Fully functional threads to comment and discuss a certain message
- Mention users, Link to other conversations, Format Links
- Send Images, GIFs, Videos, Audio, and other files 
- Report users
- Get notified by listening for predefined and custom events (mentions, messages, reports, etc)

## Official Documentation
- [Official Docs](https://www.pubnub.com/docs/chat/chat-sdk/overview)
- [Why Chat SDK?](https://www.pubnub.com/docs/chat/chat-sdk/learn/why-chat-sdk)
- [Getting Started](https://www.pubnub.com/docs/chat/chat-sdk/build/configuration)
- [(Advanced) Authentication and Authorization](https://www.pubnub.com/docs/general/security/access-control)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/antoniormrzz/ionic-7-electron-chat.git
   ```
   
2. Change to the project directory:

   ```bash
   cd ionic-7-electron-chat
   ```
3. Install dependencies:

   ```bash
   npm install
   ```
4. Create a `.env.local` file in the project's root directory and add your demo keys:
   ```bash
   VITE_PUBNUB_PUBLISH_KEY=pub-c-...
   VITE_PUBNUB_SUBSCRIBE_KEY=sub-c-...
   ```
Learn how to get your free demo keys [here](https://www.pubnub.com/docs/chat/chat-sdk/build/configuration).

## Usage

- To run the app in your browser (recommended for [HMR](https://webpack.js.org/concepts/hot-module-replacement/)):

   ```bash
   npm run dev
   ```
- To run the app in Electron:

   ```bash
   npm start
   ```

## License
I don't remember, but take what you need from my code, lol.
