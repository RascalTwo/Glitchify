# Glitchify

Do you want to upload your static webpage to glitch.com, but _do not_ enjoy having to update all your static media references?

Well this is the the script for you - given a project directory in which static assets are contained within an `assets` folder and relatively linked to from within your various files - simply run this script and said files will be ready to be uploaded to glitch.com with no manual changes needed!

## Requirements

- A folder containing files that have relative links to files within an `assets` directory

## Installation

```sh
npm install
```

## Usage

```sh
node glitchify [Source Directory] [Destination Directory] [Glitch UUID]
node glitchify my-static-project my-static-project-glitchified 01234567-8901-4234-5678-901234567890
```

## Explanation

When using static assets on glitch.com, it's required to absolutely link to them via a CDN link provided after the uploading of the assets.

If one has many assets, this can be a tedious process - renaming each relative URL to point to this new CDN.

This script first makes a copy of the project directory, and runs through all the files - ignoring files within folders starting with `.`, like `.git` and such.

For each file it processes, it replaces the text `assets/` with the projects glitch.com CDN prefix, which is formatted as such:

> https://cdn.glitch.global/GLITCH-UUID/

### Glitch UUID

Every glitch project has a UUID generated just for it, and when the assets are served for these projects, they're all served from a single path under this UUID

There are two known ways to obtain this UUID

- Scrape from the URL of the projects Avatar logo, which are always served from:

> https://cdn.glitch.global/project-avatar/GLITCH-UUID.png

- Upload an asset, and scrape the UUID from that the provided URL for said asset, which appears as:

> https://cdn.glitch.com/GLITCH-UUID/ASSET-FILENAME

The current recommended way by this project is to run a tiny bit of JavaScript to perform the first step for you automatically, from the project edit page:

```javascript
alert(document.querySelector('#sidebar img').src.split('.').slice(-2)[0].split('/').slice(-1)[0])
```

This is 100% safe to execute, but if an explanation is desired:

- Gets the first `img` element that's a descendant of the `#sidebar` element
- Parses the UUID out of it
  - Split the string by `.`s
    - `[ 'https://cdn', 'glitch', 'global/project-avatar/GLITCH-UUID', 'png?TIMESTAMP' ]`
  - Get the 2nd-to-last segment
    - `'global/project-avatar/GLITCH-UUID'`
  - Split this by `/`s
    - `[ 'global', 'project-avatar', '05cefe55-c6f8-4385-b4db-7509ddfff0ad' ]`
  - Get the last segment
- Alerts that UUID to the user for copying
