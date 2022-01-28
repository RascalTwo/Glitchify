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
node glitchify my-static-project my-static-project-glitchified 012345678901234567-890123456789012345
```

## Explanation

When using static assets on glitch.com, it's required to absolutely link to them via a CDN link provided after the uploading of the assets.

If one has many assets, this can be a tedious process - renaming each relative URL to point to this new CDN.

This script first makes a copy of the project directory, and runs through all the files - ignoring files within folders starting with `.`, like `.git` and such.

For each file it processes, it replaces the text `assets/` with the projects glitch.com CDN prefix, which is formatted as such:

> https://cdn.glitch.global/PROJECT-UUID/
