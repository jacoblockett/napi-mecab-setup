import path from "path"
import fs from "fs"
import { Readable } from "stream"
import { pipeline } from "stream/promises"
import https from "https"
import cliProgress from "cli-progress"
import AdmZip from "adm-zip"
import { ErrAPIRequestFailed, ErrWriteFailed } from "../error.js"
import mkdirTmp from "./mkdirTmp.js"
import { getPkgRoot } from "./getEnvironment.js"

export const bars = new cliProgress.MultiBar(
	{
		clearOnComplete: false,
		hideCursor: true,
		format: "{name} | {bar} | {status} | {processed}/{totalSize} MB",
		forceRedraw: true,
		synchronousUpdate: true
	},
	{
		barCompleteChar: "=",
		barIncompleteChar: "-",
		barGlue: "",
		formatValue: v => v
	}
)
const agent = new https.Agent({ keepAlive: true, maxSockets: Infinity, timeout: 60000 })

export default async function downloadAsset(asset) {
	const [tmpdir, removeTmpdir] = await mkdirTmp()
	const bar = bars.create(asset.size + 1, 0, {
		name: asset.name.padEnd(18, " "),
		status: "Downloading",
		processed: "0",
		totalSize: bytesToMegabytes(asset.size)
	})
	const zipPath = path.join(tmpdir, asset.zipName)
	const ws = fs.createWriteStream(zipPath)
	const res = await fetch(asset.url, { agent, headers: { Accept: "application/octet-stream" } })

	if (!res.ok) {
		removeTmpdir()
		ErrAPIRequestFailed(asset.url, res)
	}

	const rs = Readable.fromWeb(res.body)
	let processed = 0

	rs.on("data", chunk => {
		processed += chunk.length

		bar.update(processed, {
			processed: bytesToMegabytes(processed),
			totalSize: bytesToMegabytes(asset.size),
			status: "Downloading"
		})
	})

	try {
		await pipeline(rs, ws)
	} catch (err) {
		removeTmpdir()
		ErrWriteFailed(zipPath, err)
	}

	const zip = new AdmZip(zipPath)
	const pkgRoot = getPkgRoot()
	const outPath = path.join(pkgRoot, asset.outPath)

	await new Promise(resolve => {
		const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
		let index = 0
		const interval = setInterval(() => {
			const currentFrame = frames[index++ % frames.length]

			bar.update(asset.size, {
				processed: bytesToMegabytes(asset.size),
				totalSize: bytesToMegabytes(asset.size),
				status: `Unzipping ${currentFrame}`.padEnd(11, " ")
			})
		}, 50)

		zip.extractAllToAsync(outPath, true, true, err => {
			clearInterval(interval)

			if (err) {
				removeTmpdir()
				ErrWriteFailed()
			}

			resolve()
		})
	})

	bar.update(bar.total, {
		processed: bytesToMegabytes(bar.total),
		totalSize: bytesToMegabytes(asset.size),
		status: "Done".padEnd(11, " ")
	})
	bar.stop()
}

function bytesToMegabytes(bytes) {
	return (bytes / (1024 * 1024)).toFixed(2)
}
