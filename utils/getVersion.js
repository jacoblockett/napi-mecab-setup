import path from "path"
import fs from "fs/promises"

const cache = {}

export default async function getVersion() {
	if (cache.version) return cache.version

	const packageJsonPath = path.join(import.meta.dirname, "..", "package.json")
	const packageJsonRaw = await fs.readFile(packageJsonPath)
	const packageJson = JSON.parse(packageJsonRaw)

	cache.version = packageJson.version

	return packageJson.version
}
