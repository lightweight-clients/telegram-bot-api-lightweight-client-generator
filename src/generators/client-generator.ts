import * as fs from 'node:fs';
import { EndpointData, OpenApi } from '../types';

const TEMPLATE_PATH = './src/templates/client.template.ts';

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

export const generateClient = async (openApi: OpenApi, output: string): Promise<void> => {
    console.log(`Generating client...`);

    const endpoints = openApi.paths;

    const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

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
