oss-auth-server
===

## Features:
 - [x] CR-D on users
 - [x] Saved in MongoDB
 - [ ] Unicity of phone/e-mail
 - [ ] Send e-mail to new users

## Clone project
```sh
git clone git@github.com:maxleiko/oss-auth-server.git
cd oss-auth-server
```

## Install deps
```sh
npm install
```

## Start a Mongo database
```sh
docker run -d -p 27017:27017 mongo:3.4.6
```

## Start the server in dev mode
```sh
DEBUG=oss-auth-server:* npm start
```
