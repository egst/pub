export const moduleGeneration = {
    type: 'json_schema',
    json_schema: {
        name: 'code',
        strict: true,
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string'
                },
                comments: {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                },
                code: {
                    type: 'string'
                }
            },
            required: ['status', 'comments', 'code'],
            additionalProperties: false
        }
    }
}

export const moduleAdjustment = {
    type: 'json_schema',
    json_schema: {
        name: 'code',
        strict: true,
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string'
                },
                comments: {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                },
                description: {
                    type: 'string'
                },
                code: {
                    type: 'string'
                }
            },
            required: ['status', 'comments', 'description', 'code'],
            additionalProperties: false
        }
    }
}

export const json = {
    type: 'json_object',
}
