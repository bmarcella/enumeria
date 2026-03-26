/* eslint-disable @typescript-eslint/no-explicit-any */
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({
  allErrors: true,
  strict: false,
});

addFormats(ajv);

export function validateWithJsonSchema(opts: {
  schema?: Record<string, any> | null;
  data: any;
  label: string;
}) {
  const { schema, data, label } = opts;

  if (!schema) {
    return;
  }

  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    const details =
      validate.errors?.map((e) => {
        const path = e.instancePath || '/';
        return `${path} ${e.message ?? 'invalid'}`;
      }) ?? [];

    throw new Error(`${label} schema validation failed: ${details.join('; ')}`);
  }
}
