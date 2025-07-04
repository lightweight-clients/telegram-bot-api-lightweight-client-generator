/**
 * Transforms the types module to be more readable and usable.
 */
import { EndpointData, OpenApi } from '../types';
import assert from 'node:assert';
import * as fs from 'node:fs';

const addRequestBodies = (endpoint: string, content: EndpointData, customTypes: Set<string>): void => {
    assert(content.description, 'Endpoint data should have description');
    customTypes.add(`export type ${endpoint}Request = types.Post${endpoint}Data['body']`);
};

const addSuccessfulResponses = (endpoint: string, endpointData: EndpointData, customTypes: Set<string>): void => {
    assert(endpointData.post.responses, 'Endpoint data post method should have responses');
    assert(endpointData.post.responses['200'], `Endpoint ${endpoint} should have a 200 response`);

    customTypes.add(`export type ${endpoint}OkResponse = types.Post${endpoint}Responses['200']`);
};

export const generateSimpleTypes = async (openApi: OpenApi, outputPath: string): Promise<void> => {
    console.log('Generating simple types...');

    const customTypes = new Set<string>();
    const types = openApi as OpenApi;

    customTypes.add("import * as types from './types';");

    for (const [key, value] of Object.entries(types.paths)) {
        assert(key[0] === '/', `Endpoint ${key} should start with a slash`);
        assert(key.lastIndexOf('/') === 0, `Endpoint ${key} should not have more than one slash`);

        assert(value.description, 'Endpoint data should have description');
        assert(value.post, 'Endpoint data should have post method');
        assert(Object.keys(value).length === 2, 'Endpoint data should only have post method');

        const endpoint = key.substring(1);
        const baseEndpointName = endpoint.charAt(0).toUpperCase() + endpoint.slice(1);

        addRequestBodies(baseEndpointName, value, customTypes);
        addSuccessfulResponses(baseEndpointName, value, customTypes);
    }

    console.log(`Writing to ${outputPath}`);
    const content = [...customTypes].join('\n');
    await fs.promises.writeFile(outputPath, content, 'utf-8');
};
