/**
 * Transforms the types module to be more readable and usable.
 */
import * as fs from 'node:fs';

const renamePostTypes = (content: string) => {
    return content.replace(/\bPost(\w+)\b/g, '$1');
}

const plainRequestBodies = (content: string) => {
    return content.replace(
        /(export type \w+Data = )\{\n\s+requestBody\??: (\{[^}]+});\n}/g,
        '$1$2');
}

const deleteOpenApi = (content: string) => {
    return content.replace(
        /export type \$OpenApiTs =.*/s,
        '');
}

export const transform = async (inPath: string, outPath: string) => {
    let content = fs.readFileSync(inPath, 'utf-8');

    content = renamePostTypes(content);
    content = plainRequestBodies(content);
    content = deleteOpenApi(content);

    fs.writeFileSync(outPath, content);
}
