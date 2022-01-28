const fs = require('fs-extra');
const path = require('path');

/**
 * Get all filepaths of files within provided {@link directory}.
 *
 * @param {string} directory directory to get all filepaths of files in
 */
async function* getFiles(directory) {
	for (const dirent of await fs.promises.readdir(directory, { withFileTypes: true })) {
		const direntPath = path.resolve(directory, dirent.name);
		if (dirent.isDirectory()) {
			yield* getFiles(direntPath);
		} else {
			yield direntPath;
		}
	}
}

/**
 * Convert async iterable to an array of the items.
 *
 * @param {AsyncIterable<T>} iterable async iterable to convert
 * @returns {T[]} async iterale items
 */
const asyncIterableToArray = async iterable => {
	const items = []
	for await (const item of iterable) items.push(item)
	return items;
}

const BOOKMARKLET = "alert(document.querySelector('#sidebar').querySelector('img').src.split('.').slice(-2)[0].split('/').slice(-1)[0])"

/**
 * Fetch the UUID of a glitch project
 *
 * @param {string} uuidOrURL UUID or URL of glitch project containing UUID
 * @returns {string} UUID of glitch project
 */
const fetchUUID = async uuidOrURL => {
	if (!uuidOrURL.startsWith('http') && uuidOrURL.length === 36) return uuidOrURL
	const cache = JSON.parse((await fs.promises.readFile(path.join(path.dirname(__filename), 'uuid-cache.json'))).toString())
	if (uuidOrURL in cache) return cache[uuidOrURL]
	throw new Error(`UUID fetching not implemented, run this JavaScript instead: ${BOOKMARKLET} `)
}


const HELP_MESSAGE = `Convert static HTML projects with an 'assets' folder containing all assets into HTML ready to be uploaded to Glitch
Usage:\t [Source Directory] [Destination Directory] [Glitch UUID/URL]`

/**
 * @param {string} msg failure message
 */
function fail(msg){
	console.log(HELP_MESSAGE)
	console.error(msg)
	return process.exit(1)
}

(async () => {
	const srcRoot = process.argv[2]
	if (!srcRoot) fail('Source path required');

	const destRoot = process.argv[3]
	if (!destRoot) fail('Destination path required');

	const uuidOrURL = process.argv[4];
	if (!uuidOrURL) fail('UUID or URL required');

	const uuid = await fetchUUID(uuidOrURL);
	const prefix = `https://cdn.glitch.global/${uuid}/`;

	await fs.copy(srcRoot, destRoot, { overwrite: true })
	// Filter out files belonging to a path starting with a `.`: `.git`, etc
	for (const filepath of (await asyncIterableToArray(getFiles(destRoot))).filter(path => !path.split('/').some(part => part.startsWith('.')))){
		process.stdout.write(filepath + ': ');
		const content = (await fs.readFile(filepath)).toString();
		const glitchifiedContent = content.replace(/assets\//gi, prefix)
		if (content !== glitchifiedContent) {
			await fs.writeFile(filepath, glitchifiedContent)
			console.log('Glitch-ified');
		}
		else console.log('Left alone');
	}
})().catch(console.error)