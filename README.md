oss-auth-server
===

## Features:
 - [x] CR-D on users
 - [x] Saved in MongoDB
 - [x] Unicity of e-mail
 - [x] Send e-mail to new users with Google Authenticator secret
 - [x] Validate Google Authenticator token against secret

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
# MAIL_USER=barais MAIL_PASS=****** MAIL_HOST=smtp.inria.fr MAIL_PORT=587  DEBUG=oss-auth-server:* node ./bin/www
```


## Export users
```sh
mongoexport  --db oss-auth-server --collection secrets --out secrets.json
mongoexport  --db oss-auth-server --collection users --out users.json
```


## Import users
```sh
mongoimport  --db oss-auth-server --collection secrets --file secrets.json
mongoexport  --db oss-auth-server --collection users --file users.json
```

## Do not forget

- Install and configure fail2ban for your server

[https://www.digitalocean.com/community/tutorials/how-to-protect-an-nginx-server-with-fail2ban-on-ubuntu-14-04](https://www.digitalocean.com/community/tutorials/how-to-protect-an-nginx-server-with-fail2ban-on-ubuntu-14-04)

- use a service such as [mailjet](https://fr.mailjet.com/) to send your email

- use [forever](https://github.com/foreverjs/forever) to start your service

- use [docker](https://www.docker.com/) to start the database

- use [letsencrypt](https://letsencrypt.org/) to provide https services
