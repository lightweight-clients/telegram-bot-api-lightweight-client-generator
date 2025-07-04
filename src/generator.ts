import * as fs from 'node:fs';
import * as path from 'node:path';
import { OpenApi } from './types';
import { generateClient } from './generators/client-generator';
import { generateSimpleTypes } from './generators/simple-types-generator';
import assert from 'node:assert';
import { generateTypes } from './generators/types-generator';

const fetchSpecification = async (url: string): Promise<OpenApi> => {
    console.log('Fetching specification');

    const openApiRes = await fetch(url);
    const openApi = await openApiRes.json();
    assert(openApi && typeof openApi === 'object');
    assert('paths' in openApi);

    return openApi;
};

export const generate = async () => {
    const OPENAPI_URL = 'https://raw.githubusercontent.com/lightweight-clients/schemas/refs/heads/master/schemas/telegram-bot-api/openapi.json';
    const OUTPUT_DIR = path.resolve('./output');

    const openApi = await fetchSpecification(OPENAPI_URL);

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.copyFileSync('./src/templates/index.ts', `${OUTPUT_DIR}/index.ts`);
    fs.copyFileSync('./src/templates/core.ts', `${OUTPUT_DIR}/core.ts`);
    await generateClient(openApi, `${OUTPUT_DIR}/client.ts`);
    await generateSimpleTypes(openApi, `${OUTPUT_DIR}/simple-types.ts`);
    await generateTypes(openApi, `${OUTPUT_DIR}/types.ts`);
};

generate()
    .then(() => {
        console.log('Done');
    })
    .catch((e) => {
        console.error(e);
    });
