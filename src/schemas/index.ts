export const pluginManifestSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['id', 'name', 'version', 'widgets'],
  properties: {
    id: { type: 'string', pattern: '^[a-zA-Z0-9-_]+$' },
    name: { type: 'string', minLength: 1 },
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    description: { type: 'string' },
    author: { type: 'string' },
    widgets: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name', 'description', 'configUrl'],
        properties: {
          id: { type: 'string', pattern: '^[a-zA-Z0-9-_]+$' },
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          icon: { type: 'string' },
          configUrl: { type: 'string' },
          sizes: {
            type: 'array',
            items: { type: 'string', enum: ['small', 'medium', 'large'] }
          }
        },
        additionalProperties: false
      }
    }
  },
  additionalProperties: false
}

export const widgetConfigSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['type', 'title', 'updateInterval'],
  properties: {
    type: { type: 'string', enum: ['text', 'table', 'chart', 'indicator'] },
    title: { type: 'string' },
    updateInterval: { type: 'number', minimum: 0 },
    settingsSchema: { type: 'object' },
    dataSource: {
      type: 'object',
      required: ['url'],
      properties: {
        url: { type: 'string', pattern: '^https://.*$' },
        method: { type: 'string', enum: ['GET', 'POST'] },
        headers: { type: 'object' },
        transform: {
          type: 'object',
          required: ['type'],
          properties: {
            type: { type: 'string', enum: ['jsonpath', 'pick', 'format'] },
            expression: { type: 'string' },
            fields: { type: 'array', items: { type: 'string' } },
            format: { type: 'string' }
          }
        }
      },
      additionalProperties: false
    },
    template: {
      type: 'object',
      required: ['html'],
      properties: {
        html: { type: 'string' },
        sanitize: { type: 'boolean' }
      },
      additionalProperties: false
    },
    styles: { type: 'object' }
  },
  additionalProperties: false
}
