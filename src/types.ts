export interface EndpointData {
    description: string;
}

export interface OpenApi {
    paths: {
        [path: string]: EndpointData;
    };
}
