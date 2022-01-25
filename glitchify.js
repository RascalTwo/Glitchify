const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch')

async function* getFiles(dir) {
	const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
	for (const dirent of dirents) {
		const res = path.resolve(dir, dirent.name);
		if (dirent.isDirectory()) {
			yield* getFiles(res);
		} else {
			yield res;
		}
	}
}

const asyncIteratorToArray = async iterator => {
	const items = []
	for await (const item of iterator) items.push(item)
	return items;
}

const BOOKMARKLET = "alert(document.querySelector('#sidebar').querySelector('img').src.split('.').slice(-2)[0].split('/').slice(-1)[0])"

const fetchUUID = async uuidOrURL => {
	if (!uuidOrURL.startsWith('http')) return uuidOrURL
	const cache = JSON.parse((await fs.promises.readFile('uuid-cache.json')).toString())
	if (uuidOrURL in cache) return cache[uuidOrURL]
	throw new Error(`UUID fetching not implemented, run this JavaScript instead: ${BOOKMARKLET} `)
	//return fetch(uuidOrURL).then(r => r.text()).then(html => html.split('<section id="sidebar"')[1].split(''))
}

(async () => {
	console.log('Convert static HTML projects with an `assets` folder containing all assets into HTML ready to be uploaded to Glitch')
	console.log('Usage:\t [Source Directory] [Destination Directory] [Glitch UUID/URL]')
	const srcRoot = process.argv[2]
	if (!srcRoot) {
		console.error('Source path required');
		process.exit(1);
	}

	const destRoot = process.argv[3]
	if (!destRoot) {
		console.error('Destination path required');
		process.exit(1);
	}

	const uuidOrURL = process.argv[4];
	if (!uuidOrURL) {
		console.error('UUID or URL required');
		process.exit(1);
	}

	const uuid = await fetchUUID(uuidOrURL);
	const prefix = `https://cdn.glitch.global/${uuid}/`;

	await fs.copy(srcRoot, destRoot, { overwrite: true })
	const files = (await asyncIteratorToArray(getFiles(destRoot))).filter(path => !path.split('/').some(part => part.startsWith('.')))
	for (const filepath of files){
		process.stdout.write(filepath + ': ');
		const content = await (await fs.readFile(filepath)).toString();
		const glitchifiedContent = content.replace(/assets\//gi, prefix)
		if (content !== glitchifiedContent) {
			await fs.writeFile(filepath, glitchifiedContent)
			console.log('Glitch-ified');
		}
		else console.log('Left alone');
	}
})().catch(console.error)