#Aperto | IBN Bluemix

##Bluemix exploring
 - Orgs
 - Spaces
 - Services & Runtimes
 - Buildpacks

####Challenge!!
 `Create a new Org  & Space. Invite a friend to it so they can commit apps to your space. Create an unbound cloudant db service (to be used later)`

---
##CLI 
 - Bluemix CLI & CF CLI
 - Installing it (https://github.com/cloudfoundry/cli/releases && http://clis.ng.bluemix.net/ui/home.html)  
 - Using it (https://console.ng.bluemix.net/docs/cli/reference/cfcommands/index.html)
 - Plugins (http://clis.ng.bluemix.net/ui/repository.html#cf-plugins && https://console.ng.bluemix.net/docs/cli/cliplug-in.html)
 - Running App Locally  
  - export VCAP
 - Debug in the cloud (https://console.ng.bluemix.net/docs/develop/bluemixlive.html) 
 
####Challenge!!
```
  1) cf login | change api | change space / org 
  2) Create a new Cloudant instance through the CLI
  3) Install a plugin through the cli
  4) cf push the application 
  5) Get application logs from running app.
```
 
---
##Deploying manually via CLI
 - yml to define STUFF
 - Using the VCAP_SERVICES and the VCAP_APP
 - https://console.ng.bluemix.net/docs/manageapps/depapps.html#deployingapps
 
####Challenge!!
```
  1) The app is going to seed all the time; how do we fix it? 
  2) Ensure there is no downtime when deploying the application
  3) Up the amount of memory on the app through the UI, then redeploy
```

---
##Automated (through DevOps Pipeline)e
Through Jazz or Github?
Build in a container
