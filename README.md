# aperto-blue-list

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and NPM](nodejs.org) >= v4.4.0
- [Grunt](http://gruntjs.com/) (`npm install -g grunt-cli`)
- [Cloudant](https://cloudant.com/) - define a `VCAP_SERVICES` env variable to match

```
{"cloudantNoSQLDB":[{
    "name":"dev-db",
    "credentials":{
      "username":"admin",
      "password":"admin",
      "host":"localhost",
      "port":8443,
      "url":"http://admin:admin@localhost:8443"
    }
  }]
}
```
This should be encapsulated with a single quote on each side.
```
export VCAP_SERVICES='{ "cloudantNoSQLDB": [ { "name": "Cloudant NoSQL DB-ur", "label": "cloudantNoSQLDB", "plan": "Shared", "credentials": { "username": "admin", "password": "admin", "host": "host.cloudant.com","port": 443,"url": "https://username:password@host.cloudant.com"}}]}'
```

### Developing

1. Run `npm install` to install server dependencies.

2. Run `export VCAP_SERVICES=$YOUR_VCAP_OBJECT` in a the same shell you run grunt in where `$YOUR_VCAP_OBJECT` is the JSON object with the url of the db defined in it.

3. Run `grunt serve` to start the development server. It should automatically open the client in your browser when ready.

## Build & development

Run `grunt build` for building and `grunt serve` for preview.

## Testing

Running `grunt test` will run the unit tests with karma.
