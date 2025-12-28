/**
 * Generates a string for the current date.
 * @param ISOFormat - If true, returns the date in full ISO format (YYYY-MM-DDTHH:mm:ss.sssZ).
 * If false (default), returns the date as YYYY-MM-DD.
 * @returns {string} The formatted date string.
 */
export function generateDate(ISOFormat: boolean = false): string {
    let date: string = new Date().toISOString();
    if (!ISOFormat) {
        date = date.split("T")[0];
    }
    return date;
}

/**
 * Generates a unique ID based on the current timestamp and a random number.
 * @returns {string} A unique string ID.
 */
export function generateZettelID(): string {
    // Date.now() provides temporal uniqueness.
    // Math.random() prevents collisions if called within the same millisecond.
    const randomPart = Math.random().toString(36).substring(2);
    const id = Date.now().toString(36) + randomPart;
    return id;
}

/**
 * Generates a random integer between min and max (inclusive).
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns {number} Random integer
 */
export function generateRandomInt(min: number, max: number): number {
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    return result;
}

/**
 * Sanitizes a filename by removing or replacing invalid characters.
 * @param filename - The filename to sanitize
 * @returns {string} Sanitized filename
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
 * Formats a date string for display.
 * @param dateString - ISO date string
 * @param format - Format type ('short', 'long', 'time')
 * @returns {string} Formatted date string
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
 * Validates if a string is a valid note type.
 * @param type - The type string to validate
 * @returns {boolean} True if valid note type
 */
export function isValidNoteType(type: string): boolean {
    const validTypes = ["fleeting", "literature", "atomic", "permanent"];
    return validTypes.includes(type.toLowerCase());
}


/**
 * Extracts tags from a string of comma-separated values.
 * @param tagString - Comma-separated tag string
 * @returns {string[]} Array of trimmed tags
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
 * Capitalizes the first letter of a string.
 * @param str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str: string): string {
    if (!str) return str;
    const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
    return capitalized;
}

/**
 * Truncates a string to a specified length with ellipsis.
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns {string} Truncated string
 */
export function truncate(str: string, maxLength: number): string {
    if (!str || str.length <= maxLength) {
        return str;
    }

    const truncated = str.substring(0, maxLength - 3) + "...";
    return truncated;
}