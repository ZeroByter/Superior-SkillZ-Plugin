# Superior-SkillZ-Plugin
A better, superior SkillZ webkit plugin meant to replace the original, malfunctioning one.

![What it looks like to go to 'localhost:50000'](https://i.imgur.com/7fhBRkm.png1)

A lot of young and inspired coders (including myself) who are taking part in the Israeli national coding competition SkillZ are dependent on a software provided by the SkillZ team in order to work on their bot in their own familiar IDE workstation while still being able to reliably upload their code to the webkit for testing.

This plugin software provided by the SkillZ team is outdated, crashes often, and when it does work it barely does; and so I have decided to take matters into my own hands...

## Usage

Usage of this new replacement plugin is almost identical to the old one.

First, you must place the '.exe' file at the root directory of your project.

Then, likewise with the original webkit plugin, you have to go to chrome, navigate to [https://localhost:50000](https://localhost:50000) and authorize Chrome (or whatever browser you are using) to ignore the wrong SSL certificate warning, and you're set!

Once you do that, you won't have to do it again, and you may work on your bot in peace.

## Dependencies

In order to save storage space and to not make this project too big, I have not included the required Node.js modules.
If you wish to run this raw script yourself, you need:
- readline
- node-watch
- socket.io
- express