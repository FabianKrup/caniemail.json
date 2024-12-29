import { load, loadAll } from 'js-yaml';

const optionalByteOrderMark = '\\ufeff?';
const platform = typeof process !== 'undefined' ? process.platform : '';
const pattern =
    '^(' +
    optionalByteOrderMark +
    '(= yaml =|---)' +
    '$([\\s\\S]*?)' +
    '^(?:\\2|\\.\\.\\.)\\s*' +
    '$' +
    (platform === 'win32' ? '\\r?' : '') +
    '(?:\\n)?)';

const regex = new RegExp(pattern, 'm');

function computeLocation(match, body) {
    let line = 1;
    let pos = body.indexOf('\n');
    const offset = match.index + match[0].length;

    while (pos !== -1) {
        if (pos >= offset) {
            return line;
        }
        line++;
        pos = body.indexOf('\n', pos + 1);
    }

    return line;
}

export function frontmatterParse(string, options) {
    const match = regex.exec(string);
    if (!match) {
        return {
            attributes: {},
            body: string,
            bodyBegin: 1,
        };
    }

    const yamlContent = match?.[match.length - 1]?.replace(/^\s+|\s+$/g, '');

    if (!yamlContent) {
        return {
            attributes: {},
            body: string,
            bodyBegin: 1,
        };
    }

    let attributes = {};

    if (options?.ignoreDuplicateKeys) {
        loadAll(
            yamlContent,
            (doc) => {
                attributes = {
                    ...attributes,
                    ...doc,
                };
            },
            { json: true },
        );
    } else {
        attributes = load(yamlContent) || {};
    }

    const body = string.replace(match[0], '');
    const line = computeLocation(match, string);

    return {
        attributes,
        body,
        bodyBegin: line,
        frontmatter: yamlContent,
    };
}
