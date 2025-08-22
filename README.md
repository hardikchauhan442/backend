
## ❯ Getting Started

### Step 1: Set up the Development Environment

You need to set up your development environment before you can do anything.

Install [Node.js and NPM](https://nodejs.org/en/download/)

- on OSX use [homebrew](http://brew.sh) `brew install node`
- on Windows use [chocolatey](https://chocolatey.org/) `choco install nodejs`

Install yarn globally

```bash
yarn global add yarn
```

Install a database Like postgres, mysql or mongodb.

> If you work with a mac, we recommend to use homebrew for the installation.

### Step 2: Create new Project

Fork or download this project. Configure your package.json for your new project.

Then copy the `.env.example` file and rename it to `.env`. In this file you have to add your database connection information.

Create a new database with the name you have in your `.env`-file.

Then setup your application environment.

```PORT = 3000
NODE_ENV = development  // environment variable

DB_USERNAME =  // Database Username
DB_PASSWORD =  // Database Password
DB_NAME =      // Database Name
DB_HOSTNAME =  // Database HOST Name
DB_PORT =      // Database PORT
DB_DRIVER =    // Database type like (postgres,mysql,mongodb)

SECRET =    // JWT scret key for auth token
```

> This installs all dependencies with yarn. After that it migrates the database and seeds some test data into it. So after that your development environment is ready to use.

### Step 3: Serve your App

Go to the project dir and start your app with this yarn script.

```bash
yarn start dev
```

> This starts a local server using `nodemon`, which will watch for any file changes and will restart the server according to these changes.
> The server address will be displayed to you as `http://0.0.0.0:3000`.

![divider]

## ❯ Scripts and Tasks

### Install

- Install all dependencies with `yarn install`

### Linting

- Run code quality analysis using `yarn run lint:check`. This runs tslint.
- Run code quality fix using `yarn run lint:fix`. This runs tslint.
- There is also a vscode task for this called `lint`.

### Running in dev mode

- Run `yarn run dev` to start nodemon with ts-node, to serve the app.
- The server address will be displayed to you as `http://localhost:3000`


### Database Migration

- Run `npx sequelize migration:create --name <migration-file-name>` to create a new migration file.
- To migrate your database run `npx sequelize-cli db:migrate`.
- To revert your latest migration run `npx sequelize-cli db:migrate:undo:all --to   <migration-file-name>`.


### Database Seeding

- Run ` npx sequelize-cli db:seed:all` to seed your seeds into the database.



## ❯ API Routes

The route prefix is `/api/v1` by default.

| Route          | Description |
| -------------- | ----------- |
| **/api**       | Shows us the name, description and the version of the package.json |
| **/api/users** | Example entity endpoint |
| **/api/admin**  | Example entity endpoint |



## ❯ Project Structure

| Name                              | Description |
| --------------------------------- | ----------- |
| **.vscode/**                      | VSCode tasks, launch configuration and some other settings |
| **dist/**                         | Compiled source files will be placed here |
| **src/**                          | Source files |
| **src/config/**          | REST API Configuration |
| **src/controllers/**          | REST API Controllers |
| **src/logger/**          |Logs REST API calls |
| **src/middlewares/**          | Express Middlewares like helmet security features |
| **src/models/**               | Sequelize Models |
| **src/routes/**               | REST API Routing |
| **src/validation/**           | Custom validators, which can be used in the request classes |
| .env                      | Environment configurations |



## ❯ Logging

Our logger is [winston](https://github.com/winstonjs/winston)..
We created a simple annotation to inject the logger in your service (see example below).

```typescript
import { createLogger,} from 'winston';

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
  silly: 6,
};

const transportsClone: any = transports;

const config = {
  // change level if in dev environment versus production
  levels: logLevels,
};

export const logger = createLogger(config);
```