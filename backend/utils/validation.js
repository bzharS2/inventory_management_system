const MAX_NAME = 100;
const MAX_DESCRIPTION = 500;
const MAX_BARCODE = 50;
const MAX_QUANTITY = 1_000_000;
const MAX_PRICE = 1_000_000;
const MAX_ID = 2_147_483_647;

function parsePositiveInt(value, max = MAX_QUANTITY) {
    if (typeof value === "number") {
        if (!Number.isInteger(value) || value < 1 || value > max) {
            return null;
        }
        return value;
    }

    if (typeof value === "string" && /^\d+$/.test(value.trim())) {
        const parsed = Number(value.trim());
        if (!Number.isInteger(parsed) || parsed < 1 || parsed > max) {
            return null;
        }
        return parsed;
    }

    return null;
}

function parseId(value) {
    return parsePositiveInt(value, MAX_ID);
}

function parsePrice(value) {
    let parsed;

    if (typeof value === "number") {
        parsed = value;
    } else if (typeof value === "string" && /^(?:\d+\.?\d*|\.\d+)$/.test(value.trim())) {
        parsed = Number(value.trim());
    } else {
        return null;
    }

    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > MAX_PRICE) {
        return null;
    }

    return Math.round(parsed * 100) / 100;
}

function parseText(value, maxLen) {
    let text = value;

    if (typeof text === "number" && Number.isFinite(text)) {
        text = String(text);
    }

    if (typeof text !== "string") {
        return null;
    }

    const trimmed = text.trim();
    if (!trimmed || trimmed.length > maxLen) {
        return null;
    }

    return trimmed;
}

function parseBarcode(value) {
    return parseText(value, MAX_BARCODE);
}

function parseIsoDate(value) {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return null;
    }

    return trimmed;
}

function escapeLike(value) {
    return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function isDuplicateKeyError(error) {
    return Boolean(error && error.code === "ER_DUP_ENTRY");
}

module.exports = {
    MAX_NAME,
    MAX_DESCRIPTION,
    parsePositiveInt,
    parseId,
    parsePrice,
    parseText,
    parseBarcode,
    parseIsoDate,
    escapeLike,
    isDuplicateKeyError
};
