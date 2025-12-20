# Napi-Mecab-Setup

This is a post-install script used to download prebuilt binaries for use with [napi-mecab](https://www.npmjs.com/package/napi-mecab). The script will determine which MeCab build to use for your system and download the requested dictionaries as well.

## Usage:

```bash
# Choose your package manager flavor, and execute directly within
# your project that has already installed napi-mecab
npx napi-mecab-setup [...languageCodes]

# Examples
# Download all language dictionaries
npx napi-mecab-setup

# Download individual language dictionaries
npx napi-mecab-setup jp
npx napi-mecab-setup ko

# Download multiple language dictionaries (syntax is flexible)
npx napi-mecab-setup jp,ko
npx napi-mecab-setup jp, ko
npx napi-mecab-setup jp ko

# Throws an error when an unsupported language code is passed in
npx napi-mecab-setup ru
```

## Supported Languages

| Language | Language Code |
| -------- | ------------- |
| Japanese | jp            |
| Korean   | ko            |

## Note on a Particular Error

If your setup failed, you may encounter an error that looks like this:

```bash
# ... Other error messages above
Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c, line 76
```

This is bug with the Nodejs runtime - you can ignore it and use the messages above it to determine why the setup failed.
