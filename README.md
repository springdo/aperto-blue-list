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

### Developing

1. Run `npm install` to install server dependencies.

2. Run `export VCAP_SERVICES=$YOUR_VCAP_OBJECT` in a the same shell you run grunt in where `$YOUR_VCAP_OBJECT` is the JSON object with the url of the db defined in it.

3. Run `grunt serve` to start the development server. It should automatically open the client in your browser when ready.

## Build & development

Run `grunt build` for building and `grunt serve` for preview.

## Testing

Running `npm test` will run the unit tests with karma.
