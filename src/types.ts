export interface EndpointData {
    description: string;
    post: {
        body: Record<string, unknown>;
        responses: {
            [statusCode: string]: {
                description: string;
                content?: Record<string, unknown>;
            };
        };
    };
}

export type OpenApi = Record<string, unknown> & {
    paths: {
        [path: string]: EndpointData;
    };
};
