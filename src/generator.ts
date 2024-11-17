import * as fs from 'node:fs';
import { createClient } from '@hey-api/openapi-ts';
import { transform } from './types-transformer';
import { EndpointData, OpenApi } from './types';
import { ensure } from './utils/ensure';
import * as path from 'node:path';

const OPENAPI_PATH = path.resolve('./schema/openapi.json');
const OUTPUT_DIR = path.resolve('./output');

const endpointToTypesPair = (endpoint: string) => {
    const endpointParts = endpoint.split('/');
    const endpointName = endpointParts[endpointParts.length - 1];
    const endpointType = endpointName.charAt(0).toUpperCase() + endpointName.slice(1);

    return [`${endpointType}Data`, `${endpointType}Response`];
};

const getClientEndpoint = (endpointId: string, endpointData: EndpointData, template: string) => {
    const endpoint = endpointId.substring(1);
    const description = endpointData.description;
    if (Object.keys(endpointData).length > 2) {
        throw new Error(`Endpoint ${endpoint} has more than one method`);
    }

    const [requestType, responseType] = endpointToTypesPair(endpoint);

    return template
        .replace(/_DESCRIPTION_/g, description)
        .replace(/_ENDPOINT_/g, endpoint)
        .replace(/_REQUEST_TYPE_/g, requestType)
        .replace(/_RESPONSE_TYPE_/g, responseType);
};

const generateClient = async (openApi: OpenApi, output: string) => {
    const endpoints = openApi.paths;

    const template = fs.readFileSync('./src/templates/client.template.ts', 'utf-8');

    const repeatedBlock = template.match(/\/\/<%([\s\S]*?)\/\/%>/g);
    if (!repeatedBlock) {
        throw new Error('No repeated block found');
    }

    let templateBlock = repeatedBlock[0]
        .replace(/\/\/<%/, '')
        .replace(/\/\/%>/, '')
        .trim();
    templateBlock = templateBlock + '\n';

    const clientContent = [
        template.replace(repeatedBlock[0], ''),
        Object.entries(endpoints)
            .map(([endpointId, endpointData]) => getClientEndpoint(endpointId, endpointData, templateBlock))
            .join('\n'),
    ];

    fs.writeFileSync(output, clientContent.join('\n'));
};

export const generate = async () => {
    await createClient({
        input: OPENAPI_PATH,
        output: './.tmp/client',
        client: 'fetch',
    });
    console.log('Client generated');

    const openApi = JSON.parse(fs.readFileSync(OPENAPI_PATH, 'utf-8'));
    ensure(openApi && typeof openApi === 'object');
    ensure('paths' in openApi);

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    await transform('./.tmp/client/types.gen.ts', `${OUTPUT_DIR}/types.ts`);
    await generateClient(openApi as OpenApi, `${OUTPUT_DIR}/client.ts`);
    fs.copyFileSync('./src/templates/index.ts', `${OUTPUT_DIR}/index.ts`);
    fs.copyFileSync('./src/templates/core.ts', `${OUTPUT_DIR}/core.ts`);
};

generate()
    .then(() => {
        console.log('Done');
    })
    .catch((e) => {
        console.error(e);
    });
