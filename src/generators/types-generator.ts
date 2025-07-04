import { OpenApi } from '../types';
import { createClient } from '@hey-api/openapi-ts';
import * as fs from 'node:fs';

export const generateTypes = async (openApi: OpenApi, outputPath: string): Promise<void> => {
    console.log('Generating types...');

    await createClient({
        input: openApi,
        output: {
            path: './.tmp/client',
            clean: true,
            format: false,
            lint: false,
        },
        plugins: ['@hey-api/client-fetch'],
    });

    fs.copyFileSync('./.tmp/client/types.gen.ts', outputPath);
};
