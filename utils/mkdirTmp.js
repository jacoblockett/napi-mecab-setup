import fs from "fs/promises"

const cache = {}

export default async function mkdirTmp() {
	if (cache.tmpdir) return [cache.tmpdir, cache.removeTmpdir]

	const tmpdir = await fs.mkdtemp("napi-mecab-setup-")
	const removeTmpdir = async () => await fs.rm(tmpdir, { recursive: true, force: true })

	cache.tmpdir = tmpdir
	cache.removeTmpdir = removeTmpdir

	return [tmpdir, removeTmpdir]
}
