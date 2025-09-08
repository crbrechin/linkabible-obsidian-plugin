import { App, Plugin, PluginSettingTab, Setting, TFile, Notice, MarkdownView, Modal } from 'obsidian';

interface BibleLinkerSettings {
	biblePath: string;
	enableAutoLink: boolean;
	linkFormat: 'brackets' | 'wikilinks';
	enableValidation: boolean;
}

const DEFAULT_SETTINGS: BibleLinkerSettings = {
	biblePath: '1 Bible',
	enableAutoLink: true,
	linkFormat: 'brackets',
	enableValidation: true
}

export default class LinkaBiblePlugin extends Plugin {
	settings: BibleLinkerSettings;
	private bibleBooks: Map<string, { number: string; name: string; chapters: number }> = new Map();
	private originalBookNames: Map<string, string> = new Map(); // Maps lowercase key to original case

	async onload() {
		await this.loadSettings();
		this.initializeBibleBooks();
		
		// Add commands
		this.addCommand({
			id: 'convert-bible-reference',
			name: 'Convert Bible Reference to Link',
			editorCallback: (editor) => {
				this.convertSelectedText(editor);
			}
		});

		this.addCommand({
			id: 'convert-all-bible-references',
			name: 'Convert All Bible References in Note',
			editorCallback: (editor) => {
				this.convertAllReferences(editor);
			}
		});

		this.addCommand({
			id: 'insert-bible-link',
			name: 'Insert Bible Link',
			callback: () => {
				this.showBibleLinkModal();
			}
		});

		// Add settings tab
		this.addSettingTab(new LinkaBibleSettingTab(this.app, this));

		// Auto-link on paste if enabled
		if (this.settings.enableAutoLink) {
			this.registerEvent(
				this.app.workspace.on('editor-paste', (evt, editor, info) => {
					this.handlePaste(editor, info);
				})
			);
		}

		console.log('Bible Linker plugin loaded');
	}

	onunload() {
		console.log('Bible Linker plugin unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	initializeBibleBooks() {
		const books = {
			// Old Testament
			'Genesis': { number: '01', name: 'Genesis', chapters: 50 },
			'Exodus': { number: '02', name: 'Exodus', chapters: 40 },
			'Leviticus': { number: '03', name: 'Leviticus', chapters: 27 },
			'Numbers': { number: '04', name: 'Numbers', chapters: 36 },
			'Deuteronomy': { number: '05', name: 'Deuteronomy', chapters: 34 },
			'Joshua': { number: '06', name: 'Joshua', chapters: 24 },
			'Judges': { number: '07', name: 'Judges', chapters: 21 },
			'Ruth': { number: '08', name: 'Ruth', chapters: 4 },
			'1 Samuel': { number: '09', name: 'I_Samuel', chapters: 31 },
			'I Samuel': { number: '09', name: 'I_Samuel', chapters: 31 },
			'2 Samuel': { number: '10', name: 'II_Samuel', chapters: 24 },
			'II Samuel': { number: '10', name: 'II_Samuel', chapters: 24 },
			'1 Kings': { number: '11', name: 'I_Kings', chapters: 22 },
			'I Kings': { number: '11', name: 'I_Kings', chapters: 22 },
			'2 Kings': { number: '12', name: 'II_Kings', chapters: 25 },
			'II Kings': { number: '12', name: 'II_Kings', chapters: 25 },
			'1 Chronicles': { number: '13', name: 'I_Chronicles', chapters: 29 },
			'I Chronicles': { number: '13', name: 'I_Chronicles', chapters: 29 },
			'2 Chronicles': { number: '14', name: 'II_Chronicles', chapters: 36 },
			'II Chronicles': { number: '14', name: 'II_Chronicles', chapters: 36 },
			'Ezra': { number: '15', name: 'Ezra', chapters: 10 },
			'Nehemiah': { number: '16', name: 'Nehemiah', chapters: 13 },
			'Esther': { number: '17', name: 'Esther', chapters: 10 },
			'Job': { number: '18', name: 'Job', chapters: 42 },
			'Psalms': { number: '19', name: 'Psalms', chapters: 150 },
			'Proverbs': { number: '20', name: 'Proverbs', chapters: 31 },
			'Ecclesiastes': { number: '21', name: 'Ecclesiastes', chapters: 12 },
			'Song of Solomon': { number: '22', name: 'Song_of_Solomon', chapters: 8 },
			'Song of Songs': { number: '22', name: 'Song_of_Solomon', chapters: 8 },
			'Isaiah': { number: '23', name: 'Isaiah', chapters: 66 },
			'Jeremiah': { number: '24', name: 'Jeremiah', chapters: 52 },
			'Lamentations': { number: '25', name: 'Lamentations', chapters: 5 },
			'Ezekiel': { number: '26', name: 'Ezekiel', chapters: 48 },
			'Daniel': { number: '27', name: 'Daniel', chapters: 12 },
			'Hosea': { number: '28', name: 'Hosea', chapters: 14 },
			'Joel': { number: '29', name: 'Joel', chapters: 3 },
			'Amos': { number: '30', name: 'Amos', chapters: 9 },
			'Obadiah': { number: '31', name: 'Obadiah', chapters: 1 },
			'Jonah': { number: '32', name: 'Jonah', chapters: 4 },
			'Micah': { number: '33', name: 'Micah', chapters: 7 },
			'Nahum': { number: '34', name: 'Nahum', chapters: 3 },
			'Habakkuk': { number: '35', name: 'Habakkuk', chapters: 3 },
			'Zephaniah': { number: '36', name: 'Zephaniah', chapters: 3 },
			'Haggai': { number: '37', name: 'Haggai', chapters: 2 },
			'Zechariah': { number: '38', name: 'Zechariah', chapters: 14 },
			'Malachi': { number: '39', name: 'Malachi', chapters: 4 },

			// New Testament
			'Matthew': { number: '40', name: 'Matthew', chapters: 28 },
			'Mark': { number: '41', name: 'Mark', chapters: 16 },
			'Luke': { number: '42', name: 'Luke', chapters: 24 },
			'John': { number: '43', name: 'John', chapters: 21 },
			'Acts': { number: '44', name: 'Acts', chapters: 28 },
			'Romans': { number: '45', name: 'Romans', chapters: 16 },
			'1 Corinthians': { number: '46', name: 'I_Corinthians', chapters: 16 },
			'I Corinthians': { number: '46', name: 'I_Corinthians', chapters: 16 },
			'2 Corinthians': { number: '47', name: 'II_Corinthians', chapters: 13 },
			'II Corinthians': { number: '47', name: 'II_Corinthians', chapters: 13 },
			'Galatians': { number: '48', name: 'Galatians', chapters: 6 },
			'Ephesians': { number: '49', name: 'Ephesians', chapters: 6 },
			'Philippians': { number: '50', name: 'Philippians', chapters: 4 },
			'Colossians': { number: '51', name: 'Colossians', chapters: 4 },
			'1 Thessalonians': { number: '52', name: 'I_Thessalonians', chapters: 5 },
			'I Thessalonians': { number: '52', name: 'I_Thessalonians', chapters: 5 },
			'2 Thessalonians': { number: '53', name: 'II_Thessalonians', chapters: 3 },
			'II Thessalonians': { number: '53', name: 'II_Thessalonians', chapters: 3 },
			'1 Timothy': { number: '54', name: 'I_Timothy', chapters: 6 },
			'I Timothy': { number: '54', name: 'I_Timothy', chapters: 6 },
			'2 Timothy': { number: '55', name: 'II_Timothy', chapters: 4 },
			'II Timothy': { number: '55', name: 'II_Timothy', chapters: 4 },
			'Titus': { number: '56', name: 'Titus', chapters: 3 },
			'Philemon': { number: '57', name: 'Philemon', chapters: 1 },
			'Hebrews': { number: '58', name: 'Hebrews', chapters: 13 },
			'James': { number: '59', name: 'James', chapters: 5 },
			'1 Peter': { number: '60', name: 'I_Peter', chapters: 5 },
			'I Peter': { number: '60', name: 'I_Peter', chapters: 5 },
			'2 Peter': { number: '61', name: 'II_Peter', chapters: 3 },
			'II Peter': { number: '61', name: 'II_Peter', chapters: 3 },
			'1 John': { number: '62', name: 'I_John', chapters: 5 },
			'I John': { number: '62', name: 'I_John', chapters: 5 },
			'2 John': { number: '63', name: 'II_John', chapters: 1 },
			'II John': { number: '63', name: 'II_John', chapters: 1 },
			'3 John': { number: '64', name: 'III_John', chapters: 1 },
			'III John': { number: '64', name: 'III_John', chapters: 1 },
			'Jude': { number: '65', name: 'Jude', chapters: 1 },
			'Revelation': { number: '66', name: 'Revelations', chapters: 22 },
			'Revelations': { number: '66', name: 'Revelations', chapters: 22 }
		};

		for (const [name, info] of Object.entries(books)) {
			const lowerKey = name.toLowerCase();
			this.bibleBooks.set(lowerKey, info);
			this.originalBookNames.set(lowerKey, name); // Store original case
		}
	}

	parseBibleReference(text: string): { book: string; chapter: number | null; verses: string[] } | null {
		const trimmed = text.trim();
		
		// Try to match book name
		const bookMatch = this.findBookMatch(trimmed);
		if (!bookMatch) return null;

		const { book, remaining } = bookMatch;
		
		if (!remaining.trim()) {
			return { book, chapter: null, verses: [] };
		}

		// Parse chapter and verses
		const chapterVerseMatch = remaining.match(/^(\d+)(?::(.+))?$/);
		if (!chapterVerseMatch) return null;

		const chapter = parseInt(chapterVerseMatch[1]);
		const verseString = chapterVerseMatch[2];

		if (!verseString) {
			return { book, chapter, verses: [] };
		}

		// Parse verses
		const verses = this.parseVerses(verseString);
		return { book, chapter, verses };
	}

	findBookMatch(text: string): { book: string; remaining: string } | null {
		const sortedBooks = Array.from(this.bibleBooks.keys()).sort((a, b) => b.length - a.length);
		
		for (const bookKey of sortedBooks) {
			const bookInfo = this.bibleBooks.get(bookKey);
			if (!bookInfo) continue;
			
			const bookName = this.getBookDisplayName(bookKey);
			const regex = new RegExp(`^${bookName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(.*)$`, 'i');
			const match = text.match(regex);
			if (match) {
				return {
					book: bookName,
					remaining: match[1].trim()
				};
			}
		}
		
		return null;
	}

	getBookDisplayName(key: string): string {
		// Return the original case from our mapping
		return this.originalBookNames.get(key) || key;
	}

	parseVerses(verseString: string): string[] {
		const verses: string[] = [];
		const parts = verseString.split(',');
		
		for (const part of parts) {
			const trimmed = part.trim();
			if (trimmed.includes('-')) {
				const [start, end] = trimmed.split('-').map(v => parseInt(v.trim()));
				if (start && end && start <= end) {
					for (let i = start; i <= end; i++) {
						verses.push(i.toString());
					}
				}
			} else {
				const verseNum = parseInt(trimmed);
				if (verseNum) {
					verses.push(verseNum.toString());
				}
			}
		}
		
		return verses;
	}

	generateBibleLink(reference: string): string {
		const parsed = this.parseBibleReference(reference);
		if (!parsed) return `[[${reference}]]`;

		const { book, chapter, verses } = parsed;
		
		if (!chapter) {
			return `[[${book}]]`;
		} else if (!verses || verses.length === 0) {
			return `[[${book} ${chapter}]]`;
		} else {
			const verseString = verses.length === 1 ? verses[0] : verses.join(',');
			return `[[${book} ${chapter}:${verseString}]]`;
		}
	}

	validateBibleReference(reference: string): { isValid: boolean; message: string } {
		const parsed = this.parseBibleReference(reference);
		if (!parsed) {
			return { isValid: false, message: 'Invalid reference format' };
		}

		const { book, chapter } = parsed;
		const bookKey = book.toLowerCase();
		const bookInfo = this.bibleBooks.get(bookKey);
		
		if (!bookInfo) {
			return { isValid: false, message: `Book "${book}" not found` };
		}

		if (chapter && (chapter < 1 || chapter > bookInfo.chapters)) {
			return { isValid: false, message: `Chapter ${chapter} not found in ${book} (1-${bookInfo.chapters})` };
		}

		return { isValid: true, message: 'Valid reference' };
	}

	convertSelectedText(editor: any) {
		const selectedText = editor.getSelection();
		if (!selectedText) {
			new Notice('Please select some text to convert');
			return;
		}

		const link = this.generateBibleLink(selectedText);
		editor.replaceSelection(link);
		
		if (this.settings.enableValidation) {
			const validation = this.validateBibleReference(selectedText);
			if (validation.isValid) {
				new Notice(`Converted: ${selectedText} → ${link}`);
			} else {
				new Notice(`Warning: ${validation.message}`);
			}
		}
	}

	convertAllReferences(editor: any) {
		const content = editor.getValue();
		const bibleRefRegex = /\b(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1\s+Samuel|2\s+Samuel|I\s+Samuel|II\s+Samuel|1\s+Kings|2\s+Kings|I\s+Kings|II\s+Kings|1\s+Chronicles|2\s+Chronicles|I\s+Chronicles|II\s+Chronicles|Ezra|Nehemiah|Esther|Job|Psalms|Proverbs|Ecclesiastes|Song\s+of\s+Solomon|Song\s+of\s+Songs|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1\s+Corinthians|2\s+Corinthians|I\s+Corinthians|II\s+Corinthians|Galatians|Ephesians|Philippians|Colossians|1\s+Thessalonians|2\s+Thessalonians|I\s+Thessalonians|II\s+Thessalonians|1\s+Timothy|2\s+Timothy|I\s+Timothy|II\s+Timothy|Titus|Philemon|Hebrews|James|1\s+Peter|2\s+Peter|I\s+Peter|II\s+Peter|1\s+John|2\s+John|3\s+John|I\s+John|II\s+John|III\s+John|Jude|Revelation|Revelations)(?:\s+\d+(?::\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*)?)?\b/g;
		
		let newContent = content;
		let match;
		let convertedCount = 0;

		while ((match = bibleRefRegex.exec(content)) !== null) {
			const reference = match[0];
			if (!reference.includes('[[') && !reference.includes(']]')) {
				const link = this.generateBibleLink(reference);
				newContent = newContent.replace(reference, link);
				convertedCount++;
			}
		}

		editor.setValue(newContent);
		new Notice(`Converted ${convertedCount} Bible references to links`);
	}

	handlePaste(editor: any, info: any) {
		// This would handle auto-linking on paste
		// Implementation depends on specific requirements
	}

	showBibleLinkModal() {
		// Create a simple modal for inserting Bible links
		const modal = new BibleLinkModal(this.app, this);
		modal.open();
	}
}

class BibleLinkModal extends Modal {
	plugin: LinkaBiblePlugin;

	constructor(app: App, plugin: LinkaBiblePlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'Insert Bible Link' });

		const input = contentEl.createEl('input', {
			type: 'text',
			placeholder: 'Enter Bible reference (e.g., James 4:1-2)'
		});
		input.style.cssText = 'width: 100%; margin: 10px 0; padding: 8px;';

		const resultDiv = contentEl.createEl('div', {
			text: 'Link will appear here...'
		});
		resultDiv.style.cssText = 'margin: 10px 0; padding: 8px; background: #f0f0f0; border-radius: 4px;';

		const buttonDiv = contentEl.createEl('div');
		buttonDiv.style.cssText = 'margin: 10px 0;';
		
		const insertBtn = buttonDiv.createEl('button', { text: 'Insert Link' });
		const cancelBtn = buttonDiv.createEl('button', { text: 'Cancel' });

		input.addEventListener('input', () => {
			const reference = input.value.trim();
			if (reference) {
				const link = this.plugin.generateBibleLink(reference);
				const validation = this.plugin.validateBibleReference(reference);
				resultDiv.innerHTML = `
					<strong>Link:</strong> ${link}<br>
					<strong>Valid:</strong> ${validation.isValid ? 'Yes' : 'No'}<br>
					<strong>Message:</strong> ${validation.message}
				`;
			} else {
				resultDiv.textContent = 'Link will appear here...';
			}
		});

		insertBtn.addEventListener('click', () => {
			const reference = input.value.trim();
			if (reference) {
				const link = this.plugin.generateBibleLink(reference);
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView) {
					activeView.editor.replaceSelection(link);
				}
				this.close();
			}
		});

		cancelBtn.addEventListener('click', () => {
			this.close();
		});

		input.focus();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class LinkaBibleSettingTab extends PluginSettingTab {
	plugin: LinkaBiblePlugin;

	constructor(app: App, plugin: LinkaBiblePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Bible Linker Settings' });

		new Setting(containerEl)
			.setName('Bible folder path')
			.setDesc('Path to your Bible folder (relative to vault root)')
			.addText(text => text
				.setPlaceholder('1 Bible')
				.setValue(this.plugin.settings.biblePath)
				.onChange(async (value) => {
					this.plugin.settings.biblePath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Enable auto-linking')
			.setDesc('Automatically convert Bible references when pasting text')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableAutoLink)
				.onChange(async (value) => {
					this.plugin.settings.enableAutoLink = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Enable validation')
			.setDesc('Show validation messages when converting references')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableValidation)
				.onChange(async (value) => {
					this.plugin.settings.enableValidation = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', { text: 'Available Commands' });
		containerEl.createEl('p', { text: '• Convert Bible Reference to Link - Convert selected text' });
		containerEl.createEl('p', { text: '• Convert All Bible References in Note - Convert all references in current note' });
		containerEl.createEl('p', { text: '• Insert Bible Link - Open modal to insert a Bible link' });
	}
}
