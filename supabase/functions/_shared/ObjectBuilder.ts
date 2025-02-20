import { z } from "npm:zod";

type PrimitiveType = 'string' | 'number' | 'boolean';

// This is the type that can appear in the `type` property
type ObjectToolParameterType =
  | PrimitiveType
  | { [key: string]: ObjectToolParameter }  // for nested objects
  | [{ [key: string]: ObjectToolParameter }];  // for arrays of objects (notice the tuple type)

interface ObjectToolParameter {
  type: ObjectToolParameterType;
  description?: string;
  enum?: string[];
}

export type ObjectTool = {
  [key: string]: ObjectToolParameter;
};

export default class ToolObjectBuilder {
  private tools = {} as any;

  public addParameter(name: string, param: ObjectToolParameter) {
    let schema: any;

    if (typeof param.type === 'string') {
      // Handle primitive types
      switch (param.type) {
        case 'string':
          schema = z.string();
          break;
        case 'number':
          schema = z.number();
          break;
        case 'boolean':
          schema = z.boolean();
          break;
      }

      // Add enum validation if present
      if (param.enum) {
        schema = z.enum(param.enum as [string, ...string[]]);
      }
    } else if (Array.isArray(param.type)) {
      // Handle array types
      const arrayItemSchema = this.buildArrayItemSchema(param.type[0]);
      schema = z.array(arrayItemSchema);
    } else {
      // Handle nested object types
      schema = this.buildObjectSchema(param.type);
    }

    if (param.description) {
      schema = schema.describe(param.description);
    }

    this.tools[name] = schema;
    return this;
  }

  private buildArrayItemSchema(itemSchema: { [key: string]: ObjectToolParameter }): any {
    const schema: any = {};
    Object.entries(itemSchema).forEach(([key, param]) => {
      schema[key] = this.buildParameterSchema(param);
    });
    return z.object(schema).strict();
  }

  private buildObjectSchema(objectSchema: { [key: string]: ObjectToolParameter }): any {
    const schema: any = {};
    Object.entries(objectSchema).forEach(([key, param]) => {
      schema[key] = this.buildParameterSchema(param);
    });
    return z.object(schema).strict();
  }

  private buildParameterSchema(param: ObjectToolParameter): any {
    if (typeof param.type === 'string') {
      let schema: any;
      switch (param.type) {
        case 'string':
          schema = z.string();
          break;
        case 'number':
          schema = z.number();
          break;
        case 'boolean':
          schema = z.boolean();
          break;
        default:
          throw new Error(`Unsupported primitive type: ${param.type}`);
      }
      if (param.enum) {
        schema = z.enum(param.enum as [string, ...string[]]);
      }
      return param.description ? schema.describe(param.description) : schema;
    }

    if (Array.isArray(param.type)) {
      const arraySchema = this.buildArrayItemSchema(param.type[0]);
      return param.description ?
        z.array(arraySchema).describe(param.description) :
        z.array(arraySchema);
    }

    return this.buildObjectSchema(param.type);
  }

  getTools() {
    return this.tools;
  }
}

export function getObjectToolkit(tool: ObjectTool) {
  const builder = new ToolObjectBuilder();

  function processParameter(name: string, param: ObjectToolParameter | ObjectToolParameterType) {
    if (typeof param === 'string') {
      builder.addParameter(name, { type: param });
    } else if (Array.isArray(param)) {
      builder.addParameter(name, { type: param });
    } else if ('type' in param) {
      builder.addParameter(name, param as ObjectToolParameter);
    } else {
      builder.addParameter(name, { type: param });
    }
  }

  if (typeof tool === 'string' || Array.isArray(tool)) {
    processParameter('root', tool);
  } else {
    Object.entries(tool).forEach(([key, param]) => {
      processParameter(key, param);
    });
  }

  // Create a single schema from all the tools
  return z.object(builder.getTools()).strict();
}

// const objectToolExample: ObjectTool = {
//   hh: {
//     type: 'string',
//     enum: ['gold', 'silver', 'red', 'blue'],
//     description: 'Color selection (gold|silver|red|blue)'
//   },
//   ter: { type: "string" },
//   def: {
//     type: {
//       a: {
//         type: 'number',
//         description: 'A numeric value'
//       },
//       c: {
//         type: 'string',
//         description: 'A text value'
//       },
//       d: {
//         type: 'boolean',
//         description: 'A boolean value'
//       },
//       gg: {
//         type: [{
//           i: { type: 'string', description: 'Array item text field' },
//           j: { type: 'boolean', description: 'Array item boolean field' },
//           k: { type: 'string', description: 'Array item another text field' },
//           l: { type: 'number', description: 'Array item numeric field' }
//         }],
//         description: 'An array of objects'
//       }
//     },
//     description: 'A nested object structure'
//   },
//   abc: {
//     type: 'string',
//     description: 'A simple string field'
//   }
// };

// console.log("Running test...");
// const schema = getObjectToolkit(objectToolExample);

// try {
//   const test = schema.parse({
//     hh: "gold",
//     ter: "test",
//     abc: "test string",
//     def: {
//       a: 1,
//       c: "test",
//       d: true,
//       gg: [{
//         i: "test",
//         j: true,
//         k: "test",
//         l: 1
//       }]
//     }
//   });
//   console.log("Validation successful:", test);
// } catch (error) {
//   if (error instanceof z.ZodError) {
//     console.error("Validation failed:", JSON.stringify(error.errors, null, 2));
//   } else {
//     console.error("Unexpected error:", error);
//   }
// }