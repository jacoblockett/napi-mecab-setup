import { ErrUnsupportedLanguageCode } from "../error.js"

const SUPPORTED_LANGUAGES = {
	jp: true,
	ko: true
}
const cache = {}

export default function getLanguageCodes() {
	if (cache.languageCodes) return cache.languageCodes

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

	cache.languageCodes = languageCodes

	return languageCodes
}
