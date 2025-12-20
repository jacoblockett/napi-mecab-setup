import fs from "fs"
import os from "os"
import path from "path"
import { ErrUnsupportedSystem, ErrMissingNapiMecabPackage } from "../error.js"

const cache = {}

export function getSystem() {
	if (cache.system) return cache.system

	const system = `${os.platform()}-${os.arch()}`

	if (!["win32-x64", "linux-x64", "darwin-arm64"].includes(system)) ErrUnsupportedSystem(system)

	cache.system = system

	return system
}

export function getPkgRoot() {
	if (cache.pkgRoot) return cache.pkgRoot

	const pkgRoot = path.join(process.cwd(), "node_modules", "napi-mecab")

	if (!fs.existsSync(pkgRoot)) ErrMissingNapiMecabPackage(pkgRoot)

	cache.pkgRoot = pkgRoot

	return pkgRoot
}
