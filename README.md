# Markdown Note ORM

`markdown-note-orm` is a specialized library designed primarily for Obsidian Plugins to interact with and manipulate Markdown files programmatically. It treats Markdown files as structured objects, providing an ORM-like interface to manage YAML frontmatter and document sections.

## Features

* **Environment Agnostic:** Works in both Node.js (via `NodeFileAdapter`) and Obsidian (via `ObsidianVaultAdapter`).
* **Structured Frontmatter:** Manage YAML metadata with type-safe properties.
* **Section-Based Content Management:** Automatically parses Markdown by headers, allowing you to append or modify specific sections.
* **Serialization:** Easily convert structured objects back into standard Markdown strings.

## Installation

```bash
npm install markdown-note-orm
```

## Quick Start

### 1. Initialize an Adapter

Choose the appropriate adapter for your environment.

**For Obsidian Plugins:**

```typescript
import { ObsidianVaultAdapter } from 'markdown-note-orm';
const adapter = new ObsidianVaultAdapter(this.app); // 'this.app' is the Obsidian App instance

```

**For Node.js scripts:**

```typescript
import { NodeFileAdapter } from 'markdown-note-orm';
const adapter = new NodeFileAdapter("./my-vault");

```

### 2. Loading and Manipulating a Note

The `NoteModel` class is the primary entry point for note manipulation.

```typescript
import { NoteModel } from 'markdown-note-orm';

// Load a note
const note = await NoteModel.load(adapter, "folder/note.md");

// Access the title (extracted from filename)
console.log(note.title); // "note"

// Manage Frontmatter
note.properties.set("status", "complete");
note.properties.addTag("research");

// Manage Content Sections
note.content.appendToSection("Summary", "This is a new line of text.");

// Serialize and Save
const finalContent = note.serialize();
await adapter.write(note.path, finalContent);

```

## Core Components

### FrontmatterManager

Handles the YAML block at the top of the file.

* `get(key)`: Retrieve a metadata value.
* `set(key, value)`: Update or add a value.
* `addTag(tag)`: Utility to handle Obsidian-style tags.

### ContentManager

Parses the body of the Markdown file into distinct sections based on headers.

* `addSection(title, level, content)`: Add a new header and its text.
* `getSection(title)`: Retrieve content from a specific header.
* `appendToSection(title, text)`: Appends text to an existing header or creates a new one.

### Adapters

The library uses the `IVaultAdapter` interface to remain compatible across platforms.

* `NodeFileAdapter`: Uses `fs/promises` for local file system access.
* `ObsidianVaultAdapter`: Uses Obsidian's internal `vault` and `metadataCache` for optimal performance.

## License

MIT