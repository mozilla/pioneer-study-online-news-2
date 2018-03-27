# Test plan

## Overview

This add-on runs a 3 week study that takes place in 3 phases that are each 1 
week long.

At the start of the study we present the user with a survey.

During the first phase we simply log the users dwell time on 
websites.

During the second phase we continue to log the users dwell time but 
each user is put into one of three buckets. They are either in:

- a control group where nothing happens
- a bias treatment group which receives a special doorhanger popup once a day 
  when they visit any of the 500 websites listed in `bias-domains.json`. This 
  doorhanger includes a visual indicator of the bias rating of the website. 
- a ranking treatment group which receives a special doorhanger popup once 
  a day when they visit any of the websites listed in `ranking-domains.json`.
  This doorhanger includes a visual indicator of the alex ranking of the website.

During the last phase we return to simply logging user dwell time.

At the end of the study a final survey is show to the user.

## Installation

Please install the [Firefox Pioneer add-on](https://addons.mozilla.org/firefox/addon/firefox-pioneer/) to test this study.

If you install the add-on without the Firefox Pioneer add-on installed, the study 
add-on will be immediately uninstalled and will send an ineligible event ping to
Telemetry.

There are some preferences for this add-on which can be set before the add-on is
installed. If they are set once the add-on has been installed you will need to 
restart the browser for the change to take effect.

### Available preferences

#### `extensions.pioneer-online-news-2.telemetryEnv`

**Values:** `stage`, `prod`

**Default:** `prod`

If you have configured telemetry to submit to the stage environment you should
set this to `stage` to ensure that the correct encryption key is used.

#### `extensions.pioneer-online-news-2.updateTimerInterval`

**Default:** `21600000` (6 hours)

This sets the frequency in milliseconds that the state should be updated.

#### `extensions.pioneer-online-news-2.showDoorhangerInterval`

**Default:** `86400000` (1 day)

This sets the minimum time in milliseconds before the each doorhanger should be 
reshown to a user.

#### `extensions.pioneer-online-news-2.logSubmissionInterval`

**Default:** `10800000` (3 hours)

This sets the minimum time in milliseconds before the log data is submitted to 
Telemetry and then the log is purged.

#### `extensions.pioneer-online-news-2.preTreatmentDuration`

**Default:** `604800000` (1 week)

This sets the duration in milliseconds of the first phase of the study.

#### `extensions.pioneer-online-news-2.treatmentDuration`

**Default:** `604800000` (1 week)

This sets the duration in milliseconds of the second phase of the study.

#### `extensions.pioneer-online-news-2.postTreatmentDuration`

**Default:** `604800000` (1 week)

This sets the duration in milliseconds of the third phase of the study.

#### `extensions.pioneer-online-news-2.postStudyDuration`

**Default:** `604800000` (1 week)

This sets the duration in milliseconds after the study ends during which to show the final 
survey doorhanger. After this duration is over the add-on will be uninstalled.

#### `extensions.pioneer-online-news-2.studyBranch`

**Values:** `bias-treatment`, `ranking-treatment`, `control`

This is set during the second phase of the study.

The `bias-treatment` branch is where the bias rating doorhanger is shown.

The `ranking-treatment` branch is where the Alexa ranking doorhanger is shown.

The `control` branch is where no doorhanger is shown.

#### `extensions.pioneer-online-news-2.logUploadAttemptInterval`

**Default:** `900000` (15 minutes)

This sets the frequency in milliseconds at which the add-on attempts to upload the log. If the
time specified in [`extensions.pioneer-online-news-2.logSubmissionInterval`](#extensionspioneer-online-news-2logsubmissioninterval) has 
not passed it will not be uploaded. You should make sure this is always less
than [`extensions.pioneer-online-news-2.logSubmissionInterval`](#extensionspioneer-online-news-2logsubmissioninterval).


### Installing the add-on

1. In your Firefox profile open `about:config`
2. Find the pref `extensions.legacy.enabled` and make sure it is set to `true`.
3. Find the pref `devtools.chrome.enabled` and make sure it is set to `true`.
4. Go to `about:addons` > `extensions`.
5. Open the drop-down menu with the cog icon in the upper right corner and choose
   `Install Add-on From File`.

## Test Conditions

### Before each test

Before running each test please make sure you create a new clean profile. The 
easiest way is to go to `about:profiles`. More information can be found here:
https://developer.mozilla.org/Firefox/Multiple_profiles

### Tests to perform

#### Test the state update timer and phase duration

Before beginning this test it is best to set the appropriate preference in your
profile. 

You can set [`extensions.pioneer-online-news-2.updateTimerInterval`](#extensionspioneer-online-news-2updatetimerinterval) to something 
small like once every minute `60000`. Which will cause the add-on to check for a 
change in state every minute. The way that timers are created is different for 
values under 10 minutes (`600000`). So it is recommended to do at least one test
with the timer set to at least 10 minutes.

You should also lower the phase durations to something more sane for testing 
than the defaults which are on the scale of weeks. You should make sure that
the duration of each phase is longer than the update timer interval that you 
set before this.

Once these preference have been set install the add-on. You should see a survey
doorhanger at the start of each phase that prompts you to take a survey.

You may also wish to adjust the 
[`extensions.pioneer-online-news-2.showDoorhangerInterval`](#extensionspioneer-online-news-2showdoorhangerinterval) preference to test that
the survey doorhangers are re-shown to the user, at most 3 times per phase, at 
the set interval.

#### Test the dwell time logging

You should not need to tweak any preferences before testing this feature. Simply
install the add-on. You should now be in the first phase of the study which will
include the logging feature. You can navigate to a few websites to create 
`focus-start` and `focus-end` events in the log. If you idle on the page (do not
move the mouse or interact with your computer) for five second it will begin
the idle logging by create an `idle-start` event and as soon as there is user
interaction an `idle-end` event will be created. The idle events will only be
created when the browser is in focus. 

You can get the contents of the log by opening the browser console from 
`Tools > Web Developer > Browser Console` and running the following lines of 
code:

```js
Cu.import("resource://pioneer-study-online-news-2/lib/LogStorage.jsm");
LogStorage.getAll().then(v => { console.log(v); });
```

This should log an array of objects to the console which you can inspect further
to see the exact contents of the log you should have a number of objects that each
look something like:

```js
{
  url: "http://www.website.com/something.html",
  details: "focus-start",
  timestamp: 123456789
}
```

#### Test the bias rating doorhanger

You do not *need* to tweak any preferences before testing this feature, however 
you may choose to reduce [`extensions.pioneer-online-news-2.showDoorhangerInterval`](#extensionspioneer-online-news-2showdoorhangerinterval)
to test that the doorhanger only gets shown once per interval. 

After installing the add-on open the browser console from 
`Tools > Web Developer > Browser Console` and run the following lines of code:

```js
Cu.import("resource://pioneer-study-online-news-2/lib/Phases.jsm");
Phases.gotoNextPhase();
```

This will manually advance you to the second phase of the study where you can
observe the doorhanger behaviour.

There are three branches to this phase: 
- the `control` branch where the doorhanger is not shown to the user. 
- the `bias-treatment` branch where the bias doorhanger is shown to the user.
- the `ranking-treatment` branch where the Alex ranking doorhanger is shown.

You can change this preference at any time to switch the branch that you are 
testing. No restart should be necessary for the change to take effect.

You may now navigate to any of the websites listed in `bias-domains.json` and 
depending on which branch you are in you should see a doorhanger with a bias
rating, for the website, indicated. You should also see a pair of buttons that 
allow you to agree or disagree with the rating. Click either of these buttons
or the close button (X) in the corner of the doorhanger will permanently dismiss
the doorhanger for the given website. However, if you do not click any of the
buttons the doorhanger will be shown when visiting the website again after the 
interval specified in [`extensions.pioneer-online-news-2.showDoorhangerInterval`](#extensionspioneer-online-news-2showdoorhangerinterval).

#### Test that telemetry pings are being sent

Please note that you will not be able to read the payload data that is being
sent to telemetry as it will all be encrypted before submission. You can assume 
that the data is correct and correctly formatted. You can however check the
`schemaName` property of the ping to ensure that the correct ping(s) are being
submitted.

The easiest way to confirm that a ping is sent is to go to `about:telemetry` and
click on "current ping" in the top left corner. This should open a dropdown where
you can select "Archived ping data" and you can filter down the ping type to 
"pioneer-study". You can then select the relevant ping from the select box and 
click on "Raw JSON" in the bottom left corner of the screen to see the actual
contents of the ping.

##### Test the log ping

The log pings are batched and a submission is attempted 3 hours, however they 
are only submitted once a day. You may change the 
[`extensions.pioneer-online-news-2.logSubmissionInterval`](#extensionspioneer-online-news-2logsubmissioninterval)
preference to less than 3 hours and it will submit the log every 3 hours. You
will need to restart Firefox or set this pref before installing for this pref 
change to take effect.

To generate a log simply visit a few websites after installing the add-on.

These pings should have the `schemaName` set to `online-news-log`.

##### Test that the survey doorhanger is not reshown after clicking through

Before beginning this test you will probably want to set 
[`extensions.pioneer-online-news-2.logSubmissionInterval`](#extensionspioneer-online-news-2logsubmissioninterval) to something smaller
so that the survey doorhanger is reshown quicker than 24 hours.

You will also need to update the 
[`extensions.pioneer-online-news-2.updateTimerInterval`](#extensionspioneer-online-news-2updatetimerinterval) setting to less than
the setting above.

The survey doorhanger should be shown a maximum of three times, unless you
click on the **"Take the survey"** button, in which case it should not be 
shown again.

We should test that this works as expected when the button is clicked, and 
also when the button is not clicked.

##### Test that the add-on is correctly uninstalled after opting out

After installing all three add-ons, simply uninstally the Firefox Pioneer
add-on and restart the browser. All three add-ons should now be uninstalled.

##### Test that the add-on is correctly uninstalled after expiry

After installing all three add-ons there should be a pref 
`extensions.pioneer-online-news-2.expirationDate` that was created. If you
change the value of this pref to `1` and restart, the study add-on and
this sideloaded patch add-on should be uninstalled. 


##### Event pings

You may additionally see event pings (pings with the `schemaName` set to `event`)
which are triggered when the study ends. These are also triggered if you attempt
to install the add-on without the [Firefox Pioneer add-on](https://addons.mozilla.org/firefox/addon/firefox-pioneer/) installed.
