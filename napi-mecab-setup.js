#!/usr/bin/env node

const fs = require("fs")
const os = require("os")
const path = require("path")
const axios = require("axios")
const AdmZip = require("adm-zip")
const {
	ErrUnsupportedLanguageCode,
	ErrUnsupportedSystem,
	ErrMissingNapiMecabPackage,
	ErrAPIRequestFailed,
	ErrMissingAsset,
	ErrWriteFailed
} = require("./error.js")

const SUPPORTED_LANGUAGES = {
	jp: true,
	ko: true
}

;(async function () {
	// Parse arguments for language codes
	const args = process.argv.slice(2)
	let languageCodes = args.reduce((pre, cur) => {
		const codes = cur
			.split(",")
			.filter(s => s)
			.map(s => s.toLowerCase())

		for (const code of codes) {
			if (!SUPPORTED_LANGUAGES[code]) ErrUnsupportedLanguageCode(code)
			if (!pre.includes(code)) pre.push(code)
		}

		return pre
	}, [])

	if (!languageCodes.length) languageCodes = Object.keys(SUPPORTED_LANGUAGES)

	// Determine if environment is set up correctly
	const system = `${os.platform()}-${os.arch()}`
	const pkgRoot = path.join(process.cwd(), "node_modules", "napi-mecab")

	if (!["win32-x64", "linux-x64", "darwin-arm64"].includes(system)) ErrUnsupportedSystem(system)
	if (!fs.existsSync(pkgRoot)) ErrMissingNapiMecabPackage(pkgRoot)

	// Begin downloads
	console.log(`Downloading prebuilds for ${system} system and ${languageCodes.join(", ")} languages.`)

	const packageJsonPath = path.join(__dirname, "package.json")
	const packageJson = require(packageJsonPath)
	const version = packageJson.version

	console.log("Requesting asset information.")

	const infoUrl = `https://api.github.com/repos/jacoblockett/napi-mecab-setup/releases/tags/v${version}`
	const res = await axios.get(infoUrl)

	if (res.status !== 200) ErrAPIRequestFailed(infoUrl, res)

	const assets = res.data.assets
	const prebuildAssetName = `prebuild-${system}.zip`
	const prebuildAsset = assets.find(s => s.name === prebuildAssetName)

	if (!prebuildAsset) ErrMissingAsset(prebuildAssetName)

	prebuildAsset.outPath = path.join(pkgRoot, "prebuilds", system)

	const dictionaryAssets = languageCodes.map(code => {
		const dictionaryAssetName = `${code}-dict.zip`
		const dictionaryAsset = assets.find(s => s.name === dictionaryAssetName)

		if (!dictionaryAsset) ErrMissingAsset(dictionaryAssetName)

		dictionaryAsset.outPath = path.join(pkgRoot, "dict", `${code}-dict`)
	})
	const tmpDir = fs.mkdtempSync("napi-mecab-setup")
	const rmTmpDir = () => fs.rmSync(tmpDir, { recursive: true, force: true })

	for (const asset of [prebuildAsset, ...dictionaryAssets]) {
		console.log(`Downloading asset ${asset.name}`)

		const writePath = path.join(tmpDir, asset.name)
		const writer = fs.createWriteStream(writePath)
		const res = await axios.get(asset.url, {
			headers: { Accept: "application/octet-stream", "User-Agent": "napi-mecab-setup" },
			responseType: "stream"
		})

		if (res.status !== 200) {
			rmTmpDir()
			ErrAPIRequestFailed(asset.url, res)
		}

		res.data.pipe(writer)

		await new Promise(resolve => {
			writer.on("finish", resolve)
			writer.on("error", err => {
				rmTmpDir()
				ErrWriteFailed(writePath, err)
			})
		})

		const zip = new AdmZip(writePath)

		zip.extractAllTo(asset.outPath, true)
	}

	rmTmpDir()

	console.log("Successfully downloaded all assests.")
})()
