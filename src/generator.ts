import type { OpenApi } from './types';
import * as config from './config.json';
import * as fs from 'node:fs';
import * as path from 'node:path';
import assert from 'node:assert';
import { Eta } from 'eta';
import { createClient } from '@hey-api/openapi-ts';

interface EndpointRenderData {
  name: string;
  description: string;
  baseEndpointName: string;
}

interface ClientRenderData {
  endpoints: EndpointRenderData[];
}

const fetchSpecification = async (): Promise<OpenApi> => {
  console.log('Fetching specification...');

  const openApiRes = await fetch(config.specification_url);
  const openApi = await openApiRes.json();
  assert(openApi && typeof openApi === 'object');
  assert('paths' in openApi);

  return openApi;
};

const getClientRenderData = (openApi: OpenApi): ClientRenderData => {
  const endpoints: EndpointRenderData[] = [];
  for (const [path, methods] of Object.entries(openApi.paths)) {
    assert(path.startsWith('/'), `Path ${path} should start with a slash`);
    assert(path.split('/').length === 2, `Path ${path} should not have nested paths`);
    assert(methods['description'], `Path ${path} should have a description`);
    assert(methods['post'], `Path ${path} should have a POST method`);
    assert(Object.keys(methods).length === 2, `Path ${path} should have exactly two methods (desc and POST)`);

    const endpoint: EndpointRenderData = {
      name: path.slice(1),
      description: methods.description || '',
      baseEndpointName: path.charAt(1).toUpperCase() + path.slice(2),
    };
    endpoints.push(endpoint);
  }
  return { endpoints };
};

const generateEtaFile = async (fileName: string, data: ClientRenderData | object): Promise<void> => {
  console.log(`Generating ${fileName}.eta...`);

  const eta = new Eta({ views: path.resolve(__dirname, 'templates') });
  const content = await eta.renderAsync(`${fileName}.eta`, data);
  await fs.promises.writeFile(`${config.output_folder}/${fileName}.ts`, content, 'utf-8');
};

const generateTypesFile = async (openApi: OpenApi, outputPath: string): Promise<void> => {
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

export const generate = async () => {
  const openApi = await fetchSpecification();

  const renderData = getClientRenderData(openApi);

  fs.mkdirSync(config.output_folder, { recursive: true });

  await generateEtaFile('core', {});
  await generateEtaFile('index', {});
  await generateEtaFile('client', renderData);
  await generateEtaFile('simple-types', renderData);
  await generateTypesFile(openApi, `${config.output_folder}/types.ts`);
};

generate()
  .then(() => {
    console.log('Done');
  })
  .catch((e) => {
    console.error(e);
  });
