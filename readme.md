<br/><br/>
<div style="text-align:center">
<img height="250" src="http://multisite-dev-www-1.cirg.washington.edu/wp-content/uploads/2014/10/CIRG-draft.png"/>
<img height="230" width="20" src="http://ihe.cirg.washington.edu/1x1-ffffffff.png"/>
<img height="230" width="4" src="http://ihe.cirg.washington.edu/1x1.png"/>
<img height="230" width="25" src="http://ihe.cirg.washington.edu/1x1-ffffffff.png"/>
<img height="230" src="https://www.washington.edu/brand/files/2014/09/Signature_Stacked_Purple_Hex.png"/>
</div>
<br/><br/>

# Healthy Weight SMART on FHIR Application

[![Build Status](https://travis-ci.org/uwcirg/healthy-weight.svg?branch=gh-pages)](https://travis-ci.org/uwcirg/healthy-weight)

This repository contains the healthy weight SMART on FHIR application used in the
HIMSS 2017 interoperability showcase. For more information see the [CIRG website](http://cirg.washington.edu/).

## Demo

To run the app in the Epic sandbox, do the following:

1. Log in at [open.epic.com](https://open.epic.com/) using the `fhir.cirg` Gmail account (for those of us often logged into Google first, the easiest way to do this is to use a fresh browswer, perhaps one that doesn't preserve information between sessions, like the inconveniently named "Epic" browser, or Chrome in incognito mode, etc.   Or, just log out of your google ID before going to open.epic.com)
2. Go to the [launchpad](https://open.epic.com/Launchpad/OAuth2Sso, or MY APPS -> Launchpad, "...with OAuth2" tab), select the desired patient and enter the following for the rest:

  >  **NAME OF YOUR APP:** `Healthy Weight` (or leave it unchanged)<br/>
  > **YOUR APP'S LAUNCH URL:** `https://ihe.cirg.washington.edu/himss/healthy-weight/launch`<br/>
  > **YOUR APP'S OAUTH2 REDIRECT URL:** `https://ihe.cirg.washington.edu/himss/healthy-weight`<br/>
  > **CLIENTID:** `b0f2c2a2-1ccb-4a5c-921b-d297edf78222`

3. Click <kbd>LAUNCH APP</kbd>

## Technical

The healthy weight app is a [SMART on FHIR](http://docs.smarthealthit.org/) application
that implements the [public app authorization workflow](http://docs.smarthealthit.org/authorization/)
using the **smart-on-fhir** [client-js library](https://github.com/smart-on-fhir/client-js).

Once authorized, it pulls basic demographics, along with patient height (LOINC [8302-2](http://s.details.loinc.org/LOINC/8302-2.html?sections=Comprehensive)) and weight (LOINC [3141-9](http://s.details.loinc.org/LOINC/3141-9.html?sections=Comprehensive)), and displays
the calculated BMI on top of some background population data.

The application framework used is [Vue.js](https://vuejs.org/), and [Travis CI](https://travis-ci.org/uwcirg/healthy-weight) is used to build and deploy the
application on every commit.

## License

[![CC BY-SA](https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-sa.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
