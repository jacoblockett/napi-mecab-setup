const exit = (...messages) => {
    for (const message of messages) {
        console.error(message)
    }
    process.exit(1)
}
const ErrUnsupportedLanguageCode = code => exit(`"${code}" is not a supported language code.`)
const ErrUnsupportedSystem = system => exit(`napi-mecab is compatible with win32-x64, linux-x64, and darwin-arm64 systems. Your ${system} system is not compatible.`)
const ErrMissingNapiMecabPackage = pkgRoot => exit(
    `"${pkgRoot}" does not exist!`,
    "You must run napi-mecab-setup from within the root directory of a node project with napi-mecab installed already.",
    `Use "npm install napi-mecab" or equivalent to install the package first.`
)
const ErrAPIRequestFailed = (url, res) => exit(`Request to ${url} failed due to status code ${res.status} (${res.statusText}). Try again in a few minutes. If the issue persists, submit an issue at https://github.com/jacoblockett/napi-mecab-setup/issues.`)
const ErrMissingAsset = name => `Couldn't find asset for ${name}.`
const ErrWriteFailed = (writePath, err) => `Failed to write to ${writePath}: ${err.message}`

module.exports = {
    ErrUnsupportedLanguageCode,
    ErrUnsupportedSystem,
    ErrMissingNapiMecabPackage,
    ErrAPIRequestFailed,
    ErrMissingAsset,
    ErrWriteFailed
}