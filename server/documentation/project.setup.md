# Projet Setup

## This file contains an set of instructions on how to set up and the server

Before running make sure you have a copy of updated `.env`. The file is a plain text file used inA .env file is a plain text file used in software development to store environment variables (settings like API keys, database credentials) as KEY=VALUE pairs, keeping sensitive data out of code and allowing different configurations for development, testing, or production without changing the main application logic.

> **Warning!**
> The `.env` file contains API keys and database credentials. Because of this, please! **DO NOT COMMIT the `.env` file!!** always make sure it is included in the **`.gitignore` file**

## Important keys to understand

**NODE_ENV variable**: This key reflects to the current environment stage. It has two values:

1. **development:** must be set on the local setup.
2. **production:** should be set on cloud service provider ([Render](https://render.com/))

## How to run the server?

Following the required steps above, below is the next steps to properly run the server:

1. Make sure you are currently on the `server` folder. For example: `D:\Project\trackio\server`

- If not, you can navigate to the right folder by entering the command `cd server` (the `cd` command means `change directory` + `file name`)

2. Run the server by entering the command `npm run dev`. Base on run script at [package.json](../package.json) (`"dev": "node --watch-path ./ src/index.js",`)
