/**
 * Generates a string representing the current date.
 * Useful for timestamps or file naming conventions.
 *
 * @param {boolean} [ISOFormat=false] - If true, returns the full ISO string (e.g., `2023-10-05T14:48:00.000Z`).
 * If false, returns only the date portion (e.g., `2023-10-05`).
 * @returns {string} The formatted date string.
 *
 * @example
 * generateDate(); // "2023-10-05"
 * generateDate(true); // "2023-10-05T14:48:00.000Z"
 */
export function generateDate(ISOFormat: boolean = false): string {
    let date: string = new Date().toISOString();
    if (!ISOFormat) {
        date = date.split("T")[0];
    }
    return date;
}

/**
 * Generates a robust unique ID suitable for Zettelkasten notes.
 * Combines a base-36 timestamp with a base-36 random number to ensure uniqueness.
 *
 * @returns {string} A unique alphanumeric string ID.
 *
 * @example
 * const id = generateZettelID(); // e.g. "ln8x9j2k5y1z"
 */
export function generateZettelID(): string {
    // Date.now() provides temporal uniqueness.
    // Math.random() prevents collisions if called within the same millisecond.
    const randomPart = Math.random().toString(36).substring(2);
    const id = Date.now().toString(36) + randomPart;
    return id;
}

/**
 * Generates a cryptographically insecure random integer between a minimum and maximum value (inclusive).
 *
 * @param {number} min - The minimum possible value.
 * @param {number} max - The maximum possible value.
 * @returns {number} A random integer between min and max.
 *
 * @example
 * const roll = generateRandomInt(1, 6); // Returns 1, 2, 3, 4, 5, or 6
 */
export function generateRandomInt(min: number, max: number): number {
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    return result;
}

/**
 * Sanitizes a string to make it safe for use as a filename on most operating systems.
 * - Replaces invalid characters (`<`, `>`, `:`, `"`, `/`, `\`, `|`, `?`, `*`) with dashes.
 * - Replaces spaces with dashes.
 * - Collapses multiple dashes into one.
 * - Trims leading and trailing dashes.
 *
 * @param {string} filename - The raw filename string.
 * @returns {string} The sanitized, safe filename.
 *
 * @example
 * sanitizeFilename("My Note: Part 1?"); // "My-Note-Part-1"
 */
export function sanitizeFilename(filename: string): string {
    // Remove or replace characters that are invalid in filenames
    const sanitized = filename
        .replace(/[<>:"/\\|?*]/g, "-") // Replace invalid chars with dash
        .replace(/\s+/g, "-") // Replace spaces with dash
        .replace(/-+/g, "-") // Replace multiple dashes with single dash
        .replace(/^-|-$/g, ""); // Remove leading/trailing dashes

    return sanitized;
}

/**
 * Formats a raw date string into a localized string for display purposes.
 * Currently configured for Chinese locale (`zh-CN`).
 *
 * @param {string} dateString - A valid date string (e.g., ISO 8601).
 * @param {"short" | "long" | "time"} [format="short"] - The desired output format.
 * - `short`: "YYYY/M/D"
 * - `long`: "YYYY年M月D日"
 * - `time`: "YYYY/M/D HH:mm:ss"
 * @returns {string} The formatted date string.
 *
 * @example
 * formatDate("2023-01-01"); // "2023/1/1"
 * formatDate("2023-01-01", "long"); // "2023年1月1日"
 */
export function formatDate(
    dateString: string,
    format: "short" | "long" | "time" = "short",
): string {
    const date = new Date(dateString);

    let formatted: string;
    switch (format) {
        case "long":
            formatted = date.toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
            break;
        case "time":
            formatted = date.toLocaleString("zh-CN");
            break;
        case "short":
        default:
            formatted = date.toLocaleDateString("zh-CN");
            break;
    }

    return formatted;
}

/**
 * Validates whether a provided string matches one of the known Zettelkasten note types.
 *
 * @param {string} type - The note type to check.
 * @returns {boolean} `true` if valid, `false` otherwise.
 *
 * @example
 * isValidNoteType("Atomic"); // true
 * isValidNoteType("random"); // false
 */
export function isValidNoteType(type: string): boolean {
    const validTypes = ["fleeting", "literature", "atomic", "permanent"];
    return validTypes.includes(type.toLowerCase());
}

/**
 * Parses a comma-separated string into an array of individual tags.
 * Handles trimming whitespace and removing empty entries.
 *
 * @param {string} tagString - The raw string input (e.g., "pkm,  obsidian ,, coding").
 * @returns {string[]} An array of cleaned tags (e.g., `["pkm", "obsidian", "coding"]`).
 */
export function parseTags(tagString: string): string[] {
    if (!tagString || tagString.trim() === "") {
        return [];
    }

    const tags = tagString
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

    return tags;
}

/**
 * Capitalizes the first letter of a given string.
 * Returns the original string if it is empty or null.
 *
 * @param {string} str - The input string.
 * @returns {string} The string with the first character uppercase.
 *
 * @example
 * capitalize("obsidian"); // "Obsidian"
 */
export function capitalize(str: string): string {
    if (!str) return str;
    const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
    return capitalized;
}

/**
 * Truncates a string to a maximum length and appends an ellipsis (`...`) if truncated.
 * Use this for UI elements where space is limited (e.g., sidebars).
 *
 * @param {string} str - The string to truncate.
 * @param {number} maxLength - The maximum character length allowed (including the ellipsis).
 * @returns {string} The truncated string.
 *
 * @example
 * truncate("Hello World", 8); // "Hello..."
 */
export function truncate(str: string, maxLength: number): string {
    if (!str || str.length <= maxLength) {
        return str;
    }

    const truncated = str.substring(0, maxLength - 3) + "...";
    return truncated;
}
