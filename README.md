# 📖 LinkaBible - Obsidian Plugin

An Obsidian plugin that automatically generates proper links for Bible references in your vault. Simply type or paste Bible references and they'll be converted to clickable Obsidian links.

## Features

- ✅ **Automatic Link Generation**: Convert Bible references to proper Obsidian links
- ✅ **All 66 Books Supported**: Complete Old and New Testament coverage
- ✅ **Flexible Reference Formats**: Books, chapters, verses, ranges, and multiple verses
- ✅ **Smart Validation**: Built-in reference validation with helpful error messages
- ✅ **Multiple Input Methods**: Commands, modal, and auto-conversion
- ✅ **Customizable Settings**: Configure Bible folder path and behavior

## Installation

### Manual Installation

1. Download the plugin files to your Obsidian vault's `.obsidian/plugins/bible-linker/` folder
2. Enable the plugin in Obsidian's Community Plugins settings
3. Configure the Bible folder path in the plugin settings

### Development Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to build the plugin in development mode
4. Copy the generated files to your Obsidian vault

## Usage

### Commands

The plugin provides three main commands (accessible via Command Palette `Ctrl/Cmd + P`):

1. **Convert Bible Reference to Link** - Convert selected text to a Bible link
2. **Convert All Bible References in Note** - Convert all Bible references in the current note
3. **Insert Bible Link** - Open a modal to insert a Bible link

### Reference Formats

| Format | Example | Output |
|--------|---------|--------|
| Book only | `Genesis` | `[[Genesis]]` |
| Chapter only | `Genesis 1` | `[[Genesis 1]]` |
| Single verse | `Genesis 1:1` | `[[Genesis 1:1]]` |
| Verse range | `Genesis 1:1-5` | `[[Genesis 1:1-5]]` |
| Multiple verses | `Romans 8:28,31` | `[[Romans 8:28,31]]` |
| Mixed format | `Romans 8:28,31-35` | `[[Romans 8:28,31-35]]` |

### Examples

```
Input:  James 4:1-2
Output: [[James 4:1-2]]

Input:  Genesis 1
Output: [[Genesis 1]]

Input:  Psalms 23:1-6
Output: [[Psalms 23:1-6]]

Input:  Romans 8:28,31
Output: [[Romans 8:28,31]]
```

## File Structure Requirements

Your Bible files should be organized as:

```
1 Bible/
├── 01_Genesis/
│   ├── Chapter_01.md
│   ├── Chapter_02.md
│   └── ...
├── 59_James/
│   ├── Chapter_01.md
│   ├── Chapter_02.md
│   ├── Chapter_03.md
│   ├── Chapter_04.md
│   └── Chapter_05.md
└── ...
```

## Settings

Configure the plugin in Settings → Community Plugins → Bible Linker:

- **Bible folder path**: Path to your Bible folder (default: "1 Bible")
- **Enable auto-linking**: Automatically convert references when pasting
- **Enable validation**: Show validation messages when converting

## Supported Books

### Old Testament (39 books)
Genesis, Exodus, Leviticus, Numbers, Deuteronomy, Joshua, Judges, Ruth, 1 Samuel, 2 Samuel, 1 Kings, 2 Kings, 1 Chronicles, 2 Chronicles, Ezra, Nehemiah, Esther, Job, Psalms, Proverbs, Ecclesiastes, Song of Solomon, Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel, Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi

### New Testament (27 books)
Matthew, Mark, Luke, John, Acts, Romans, 1 Corinthians, 2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1 Thessalonians, 2 Thessalonians, 1 Timothy, 2 Timothy, Titus, Philemon, Hebrews, James, 1 Peter, 2 Peter, 1 John, 2 John, 3 John, Jude, Revelation

## Development

### Building

```bash
# Install dependencies
npm install

# Build for development
npm run dev

# Build for production
npm run build
```

### File Structure

```
bible-linker/
├── main.ts              # Main plugin code
├── manifest.json        # Plugin manifest
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── esbuild.config.mjs   # Build configuration
└── versions.json        # Version compatibility
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have feature requests, please open an issue on the GitHub repository.
