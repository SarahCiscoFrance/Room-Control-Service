#!/bin/bash


-- Set speaker volume to 80%
set volume output volume 80

-- Close all apps (except Note)
tell application "System Events"
  set allApps to displayed name of (every process whose background only is false) as list
end tell

set exclusions to {"Note"}

repeat with thisApp in allApps
  set thisApp to thisApp as text
  if thisApp is not in exclusions then
    tell application thisApp to if it is running then quit
  end if
end repeat


-- Change the desktop background
tell application "Finder"
	set desktop picture to POSIX file "/Users/Sarah/Pictures/Virtual_Background_2.jpg"
end tell

-- Force Webex to restart
tell application "Webex" to quit
delay 3
tell application "Webex" to activate
delay 3

-- Go Back to Desktop
tell application "Finder"
	set visible of every process whose visible is true and name is not "Finder" to false
	set the collapsed of windows to true
end tell
