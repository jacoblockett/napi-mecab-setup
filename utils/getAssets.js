import path from "path"
import { getSystem } from "./getEnvironment.js"
import { ErrAPIRequestFailed, ErrMissingAsset } from "../error.js"
import getVersion from "./getVersion.js"
import getLanguageCodes from "./getLanguageCodes.js"

export default async function getAssets() {
	const version = await getVersion()
	const info = await getInfo(version)
	const prebuildAsset = findPrebuild(info)
	const dictionaryAssets = findDictionaries(info)

	return [prebuildAsset, ...dictionaryAssets]
}

async function getInfo(version) {
	const url = `https://api.github.com/repos/jacoblockett/napi-mecab-setup/releases/tags/v${version}`
	const res = await fetch(url)

	if (!res.ok) ErrAPIRequestFailed(url, res)

	return res.json()
}

function findPrebuild(info) {
	const system = getSystem()
	const assetZipName = `prebuild-${system}.zip`
	const assetName = `prebuild-${system}`
	const asset = info.assets.find(s => s.name === assetZipName)

	if (!asset) ErrMissingAsset(assetZipName)

	asset.name = assetName
	asset.zipName = assetZipName
	asset.outPath = "prebuilds"

	return asset
}

function findDictionaries(info) {
	const languageCodes = getLanguageCodes()
	const dictionaryAssets = []

	for (const languageCode of languageCodes) {
		const assetZipName = `${languageCode}-dict.zip`
		const assetName = `${languageCode}-dict`
		const asset = info.assets.find(s => s.name === assetZipName)

		if (!asset) ErrMissingAsset(assetZipName)

		asset.name = assetName
		asset.zipName = assetZipName
		asset.outPath = path.join("dict", assetName)
		dictionaryAssets.push(asset)
	}

	return dictionaryAssets
}
