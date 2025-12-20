#!/usr/bin/env node

import parseArgs from "./utils/getLanguageCodes.js"
import { getPkgRoot, getSystem } from "./utils/getEnvironment.js"
import getAssets from "./utils/getAssets.js"
import mkdirTmp from "./utils/mkdirTmp.js"
import downloadAsset, { bars } from "./utils/downloadAsset.js"

const languageCodes = parseArgs()
const system = getSystem()

// run to call error early
getPkgRoot()

console.log(
	`Downloading prebuild for ${system} system and ${languageCodes.join(", ")} language prebuild${
		languageCodes.length === 1 ? "" : "s"
	}.`
)

const assets = await getAssets()
const [, removeTmpdir] = await mkdirTmp()

await Promise.all(assets.map(downloadAsset))

bars.stop()
removeTmpdir()

console.log("Successfully downloaded all assets.")
