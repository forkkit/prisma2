import { GeneratorConfig } from '@prisma/generator-helper'
import 'flat-map-polyfill' // unfortunately needed as it's not properly polyfilled in TypeScript
import indent from 'indent-string'
import path from 'path'
import { DMMFClass } from '../runtime/dmmf'
import { BaseField, DMMF } from '../runtime/dmmf-types'
import pluralize from 'pluralize'
import {
  capitalize,
  GraphQLScalarToJSTypeTable,
  lowerCase,
} from '../runtime/utils/common'
import { InternalDatasource } from '../runtime/utils/printDatasources'
import { DatasourceOverwrite } from './extractSqliteSources'
import {
  flatMap,
  getFieldArgName,
  getIncludeName,
  getModelArgName,
  getPayloadName,
  getSelectName,
  getSelectReturnType,
  Projection,
  getArgName,
} from './utils'
import { uniqueBy } from '../runtime/utils/uniqueBy'
import { GetPrismaClientOptions } from '../runtime/getPrismaClient'
import klona from 'klona'

const tab = 2

export function JS(gen: Generatable): string {
  if (gen.toJS) {
    return gen.toJS()
  }

  return ''
}

export function TS(gen: Generatable): string {
  return gen.toTS()
}

interface CommonCodeParams {
  runtimePath: string
  clientVersion: string
  engineVersion: string
}

const commonCodeJS = ({
  runtimePath,
  clientVersion,
  engineVersion,
}: CommonCodeParams): string => `
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  getPrismaClient,
  debugLib,
  sqltag
} = require('${runtimePath}')

const path = require('path')
const debug = debugLib('prisma-client')

debug("Client Version ${clientVersion}")
debug("Engine Version ${engineVersion}")

/**
 * Prisma Client JS version: ${clientVersion}
 * Query Engine version: ${engineVersion}
 */
exports.prismaVersion = {
  client: "${clientVersion}",
  engine: "${engineVersion}"
}

exports.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
exports.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError;
exports.PrismaClientRustPanicError = PrismaClientRustPanicError;
exports.PrismaClientInitializationError = PrismaClientInitializationError;
exports.PrismaClientValidationError = PrismaClientValidationError;

/**
 * Re-export of sql-template-tag
 */

exports.sql = sqltag.sqltag
exports.empty = sqltag.empty
exports.join = sqltag.join
exports.raw = sqltag.raw
`

const commonCodeTS = ({
  runtimePath,
  clientVersion,
  engineVersion,
}: CommonCodeParams): string => `import {
  DMMF,
  DMMFClass,
  Engine,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  sqltag as sql,
  empty,
  join,
  raw,
} from '${runtimePath}';

export { PrismaClientKnownRequestError }
export { PrismaClientUnknownRequestError }
export { PrismaClientRustPanicError }
export { PrismaClientInitializationError }
export { PrismaClientValidationError }

/**
 * Re-export of sql-template-tag
 */
export { sql, empty, join, raw }

/**
 * Prisma Client JS version: ${clientVersion}
 * Query Engine version: ${engineVersion}
 */
export declare type PrismaVersion = {
  client: string
}

export declare const prismaVersion: PrismaVersion 

/**
 * Utility Types
 */

/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches a JSON object.
 * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. 
 */
declare type JsonObject = {[Key in string]?: JsonValue}
 
/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches a JSON array.
 */
declare interface JsonArray extends Array<JsonValue> {}
 
/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches any valid JSON value.
 */
declare type JsonValue = string | number | boolean | null | Date | JsonObject | JsonArray
 
declare type SelectAndInclude = {
  select: any
  include: any
}

declare type HasSelect = {
  select: any
}

declare type HasInclude = {
  include: any
}

declare type CheckSelect<T, S, U> = T extends SelectAndInclude
  ? 'Please either choose \`select\` or \`include\`'
  : T extends HasSelect
  ? U
  : T extends HasInclude
  ? U
  : S

/**
 * Get the type of the value, that the Promise holds.
 */
export declare type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

/**
 * Get the return type of a function which returns a Promise.
 */
export declare type PromiseReturnType<T extends (...args: any) => Promise<any>> = PromiseType<ReturnType<T>>


export declare type Enumerable<T> = T | Array<T>;

export declare type TrueKeys<T> = {
  [key in keyof T]: T[key] extends false | undefined | null ? never : key
}[keyof T]

/**
 * Subset
 * @desc From \`T\` pick properties that exist in \`U\`. Simple version of Intersection
 */
export declare type Subset<T, U> = {
  [key in keyof T]: key extends keyof U ? T[key] : never;
};
declare class PrismaClientFetcher {
  private readonly prisma;
  private readonly debug;
  private readonly hooks?;
  constructor(prisma: PrismaClient<any, any>, debug?: boolean, hooks?: Hooks | undefined);
  request<T>(document: any, dataPath?: string[], rootField?: string, typeName?: string, isList?: boolean, callsite?: string, collectTimestamps?: any): Promise<T>;
  sanitizeMessage(message: string): string;
  protected unpack(document: any, data: any, path: string[], rootField?: string, isList?: boolean): any;
}
`

interface TSClientOptions {
  clientVersion: string
  engineVersion: string
  document: DMMF.Document
  runtimePath: string
  browser?: boolean
  datasources: InternalDatasource[]
  generator?: GeneratorConfig
  platforms?: string[]
  sqliteDatasourceOverrides?: DatasourceOverwrite[]
  schemaDir: string
  outputDir: string
}

interface Generatable {
  toJS?(): string
  toTS(): string
}

export class TSClient implements Generatable {
  protected readonly dmmf: DMMFClass
  protected readonly dmmfString: string
  constructor(protected readonly options: TSClientOptions) {
    this.dmmfString = escapeJson(JSON.stringify(options.document))
    this.dmmf = new DMMFClass(klona(options.document))
  }
  public toJS(): string {
    // 'document' is being printed into the file as "dmmf"
    const {
      generator,
      sqliteDatasourceOverrides,
      outputDir,
      schemaDir,
      datasources,
    } = this.options

    const config: Omit<GetPrismaClientOptions, 'document' | 'dirname'> = {
      generator,
      sqliteDatasourceOverrides,
      relativePath: path.relative(outputDir, schemaDir),
      internalDatasources: datasources,
      clientVersion: this.options.clientVersion,
    }

    return `${commonCodeJS(this.options)}

/**
 * Build tool annotations
 * In order to make \`ncc\` and \`node-file-trace\` happy.
**/

${
  this.options.platforms
    ? this.options.platforms
        .map((p) => `path.join(__dirname, 'query-engine-${p}');`)
        .join('\n')
    : ''
}

/**
 * Annotation for Vercel
**/
path.join(__dirname, 'schema.prisma');

/**
 * Enums
 */
// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275
function makeEnum(x) { return x; }

${this.dmmf.schema.enums.map((type) => new Enum(type).toJS()).join('\n\n')}


/**
 * DMMF
 */
const dmmfString = ${JSON.stringify(this.dmmfString)}

// We are parsing 2 times, as we want independent objects, because
// DMMFClass introduces circular references in the dmmf object
const dmmf = JSON.parse(dmmfString)
exports.dmmf = JSON.parse(dmmfString)

/**
 * Create the Client
 */

const config = ${JSON.stringify(config, null, 2)}
config.document = dmmf
config.dirname = __dirname

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient`
  }
  public toTS(): string {
    return `${commonCodeTS(this.options)}

/**
 * Client
**/

${new PrismaClientClass(
  this.dmmf,
  this.options.datasources,
  this.options.outputDir,
  this.options.browser,
  this.options.generator,
  this.options.sqliteDatasourceOverrides,
  this.options.schemaDir,
).toTS()}

${/*new Query(this.dmmf, 'query')*/ ''}

/**
 * Enums
 */

// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

${this.dmmf.schema.enums.map((type) => new Enum(type).toTS()).join('\n\n')}

${Object.values(this.dmmf.modelMap)
  .map((model) => new Model(model, this.dmmf).toTS())
  .join('\n')}

/**
 * Deep Input Types
 */

${this.dmmf.inputTypes
  .map((inputType) => new InputType(inputType).toTS())
  .join('\n')}

/**
 * Batch Payload for updateMany & deleteMany
 */

export type BatchPayload = {
  count: number
}

/**
 * DMMF
 */
export declare const dmmf: DMMF.Document;
export {};
`
  }
}

class Datasources implements Generatable {
  constructor(protected readonly internalDatasources: InternalDatasource[]) {}
  public toTS(): string {
    const sources = this.internalDatasources
    return `export type Datasources = {
${indent(sources.map((s) => `${s.name}?: string`).join('\n'), 2)}
}`
  }
}

class PrismaClientClass implements Generatable {
  constructor(
    protected readonly dmmf: DMMFClass,
    protected readonly internalDatasources: InternalDatasource[],
    protected readonly outputDir: string,
    protected readonly browser?: boolean,
    protected readonly generator?: GeneratorConfig,
    protected readonly sqliteDatasourceOverrides?: DatasourceOverwrite[],
    protected readonly cwd?: string,
  ) {}
  private get jsDoc(): string {
    const { dmmf } = this

    const example = dmmf.mappings[0]
    return `/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js (ORM replacement)
 * @example
 * \`\`\`
 * const prisma = new PrismaClient()
 * // Fetch zero or more ${capitalize(example.plural)}
 * const ${lowerCase(example.plural)} = await prisma.${lowerCase(
      example.model,
    )}.findMany()
 * \`\`\`
 *
 * 
 * Read more in our [docs](https://github.com/prisma/prisma/blob/master/docs/prisma-client-js/api.md).
 */`
  }
  public toTS(): string {
    const { dmmf } = this

    return `
${new Datasources(this.internalDatasources).toTS()}

export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'

export interface PrismaClientOptions {
  /**
   * Overwrites the datasource url from your prisma.schema file
   */
  datasources?: Datasources

  /**
   * @default "colorless"
   */
  errorFormat?: ErrorFormat

  /**
   * @example
   * \`\`\`
   * // Defaults to stdout
   * log: ['query', 'info', 'warn']
   * 
   * // Emit as events
   * log: [
   *  { emit: 'stdout', level: 'query' },
   *  { emit: 'stdout', level: 'info' },
   *  { emit: 'stdout', level: 'warn' }
   * ]
   * \`\`\`
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
   */
  log?: Array<LogLevel | LogDefinition>

  /**
   * You probably don't want to use this. \`__internal\` is used by internal tooling.
   */
  __internal?: {
    debug?: boolean
    hooks?: Hooks
    engine?: {
      cwd?: string
      binaryPath?: string
    }
    measurePerformance?: boolean
  }
}

export type Hooks = {
  beforeRequest?: (options: {query: string, path: string[], rootField?: string, typeName?: string, document: any}) => any
}

/* Types for Logging */
export type LogLevel = 'info' | 'query' | 'warn'
export type LogDefinition = {
  level: LogLevel
  emit: 'stdout' | 'event'
}

export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
export type GetEvents<T extends Array<LogLevel | LogDefinition>> = GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]>

export type QueryEvent = {
  timestamp: Date
  query: string
  params: string
  duration: number
  target: string
}

export type LogEvent = {
  timestamp: Date
  message: string
  target: string
}
/* End Types for Logging */

// tested in getLogLevel.test.ts
export declare function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

${this.jsDoc}
export declare class PrismaClient<T extends PrismaClientOptions = {}, U = keyof T extends 'log' ? T['log'] extends Array<LogLevel | LogDefinition> ? GetEvents<T['log']> : never : never> {
  /**
   * @private
   */
  private fetcher;
  /**
   * @private
   */
  private readonly dmmf;
  /**
   * @private
   */
  private connectionPromise?;
  /**
   * @private
   */
  private disconnectionPromise?;
  /**
   * @private
   */
  private readonly engineConfig;
  /**
   * @private
   */
  private readonly measurePerformance;
  /**
   * @private
   */
  private engine: Engine;
  /**
   * @private
   */
  private errorFormat: ErrorFormat;

${indent(this.jsDoc, tab)}
  constructor(optionsArg?: T);
  on<V extends U>(eventType: V, callback: V extends never ? never : (event: V extends 'query' ? QueryEvent : LogEvent) => void): void;
  /**
   * Connect with the database
   */
  connect(): Promise<void>;
  /**
   * @private
   */
  private runDisconnect;
  /**
   * Disconnect from the database
   */
  disconnect(): Promise<any>;
  /**
   * Makes a raw query
   * @example
   * \`\`\`
   * // With parameters use prisma.raw\`\`, values will be escaped automatically
   * const result = await prisma.raw\`SELECT * FROM User WHERE id = \${1} OR email = \${'ema.il'};\`
   * // Or
   * const result = await prisma.raw('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'ema.il')
  * \`\`\`
  * 
  * Read more in our [docs](https://github.com/prisma/prisma/blob/master/docs/prisma-client-js/api.md#raw-database-access).
  */
  raw<T = any>(query: string | TemplateStringsArray, ...values: any[]): Promise<T>;

${indent(
  dmmf.mappings
    .filter((m) => m.findMany)
    .map((m) => {
      const methodName = lowerCase(m.model)
      return `\
/**
 * \`prisma.${methodName}\`: Exposes CRUD operations for the **${
        m.model
      }** model.
  * Example usage:
  * \`\`\`ts
  * // Fetch zero or more ${capitalize(m.plural)}
  * const ${lowerCase(m.plural)} = await prisma.${methodName}.findMany()
  * \`\`\`
  */
get ${methodName}(): ${m.model}Delegate;`
    })
    .join('\n\n'),
  2,
)}
}`
  }
}

class PayloadType implements Generatable {
  constructor(protected readonly type: OutputType) {}

  public toTS(): string {
    const { type } = this
    const { name } = type

    const argsName = getArgName(name, false)

    const include = this.renderRelations(Projection.include)
    const select = this.renderRelations(Projection.select)

    return `\
export type ${getPayloadName(name)}<
  S extends boolean | null | undefined | ${argsName},
  U = keyof S
> = S extends true
  ? ${name}
  : S extends undefined
  ? never
  : S extends ${argsName} | ${getModelArgName(name, DMMF.ModelAction.findMany)}
  ? 'include' extends U
    ? ${name} ${include.length > 0 ? ` & ${include}` : ''}
  : 'select' extends U
    ? ${select}
  : ${name}
: ${name}
`
  }
  private renderRelations(projection: Projection): string {
    const { type } = this
    // TODO: can be optimized, we're calling the filter two times
    const relations = type.fields.filter((f) => f.outputType.kind === 'object')
    if (relations.length === 0 && projection === Projection.include) {
      return ''
    }
    const selectPrefix =
      projection === Projection.select
        ? `P extends keyof ${type.name} ? ${type.name}[P]
: `
        : ''
    return `{
      [P in TrueKeys<S['${projection}']>]:${selectPrefix}
${indent(
  relations
    .map(
      (f) => `P extends '${f.name}'
? ${this.wrapType(
        f,
        `${getPayloadName(
          (f.outputType.type as DMMF.OutputType).name,
        )}<S['${projection}'][P]>`,
      )} :`,
    )
    .join('\n'),
  6,
)} never
    }`
  }
  private wrapType(field: DMMF.SchemaField, str: string): string {
    const { outputType } = field
    if (outputType.isRequired && !outputType.isList) {
      return str
    }
    if (outputType.isList) {
      return `Array<${str}>`
    }
    if (!outputType.isRequired) {
      return `${str} | null`
    }
    return str
  }
}

export class Model implements Generatable {
  protected outputType?: OutputType
  protected mapping?: DMMF.Mapping
  constructor(
    protected readonly model: DMMF.Model,
    protected readonly dmmf: DMMFClass,
  ) {
    const outputType = dmmf.outputTypeMap[model.name]
    this.outputType = new OutputType(outputType)
    this.mapping = dmmf.mappings.find((m) => m.model === model.name)!
  }
  protected get argsTypes(): Generatable[] {
    const { mapping, model } = this
    if (!mapping) {
      return []
    }

    const argsTypes: Generatable[] = []
    for (const action in DMMF.ModelAction) {
      const fieldName = mapping[action]
      if (!fieldName) {
        continue
      }
      const field = this.dmmf.getField(fieldName)
      if (!field) {
        throw new Error(
          `Oops this must not happen. Could not find field ${fieldName} on either Query or Mutation`,
        )
      }
      if (action === 'updateMany' || action === 'deleteMany') {
        argsTypes.push(
          new MinimalArgsType(field.args, model, action as DMMF.ModelAction),
        )
      } else {
        argsTypes.push(
          new ArgsType(field.args, model, action as DMMF.ModelAction),
        )
      }
    }

    argsTypes.push(new ArgsType([], model))

    return argsTypes
  }
  public toTS(): string {
    const { model, outputType } = this

    if (!outputType) {
      return ''
    }

    const hasRelationField = model.fields.some((f) => f.kind === 'object')

    const includeType = hasRelationField
      ? `\nexport type ${getIncludeName(model.name)} = {
${indent(
  outputType.fields
    .filter((f) => f.outputType.kind === 'object')
    .map(
      (f) =>
        `${f.name}?: boolean` +
        (f.outputType.kind === 'object' ? ` | ${getFieldArgName(f)}` : ''),
    )
    .join('\n'),
  tab,
)}
}\n`
      : ''

    return `
/**
 * Model ${model.name}
 */

export type ${model.name} = {
${indent(
  model.fields
    .filter((f) => f.kind !== 'object')
    .map((field) => new OutputField(field).toTS())
    .join('\n'),
  tab,
)}
}

export type ${getSelectName(model.name)} = {
${indent(
  outputType.fields
    .map(
      (f) =>
        `${f.name}?: boolean` +
        (f.outputType.kind === 'object' ? ` | ${getFieldArgName(f)}` : ''),
    )
    .join('\n'),
  tab,
)}
}
${includeType}
${new PayloadType(this.outputType!).toTS()}

${new ModelDelegate(this.outputType!, this.dmmf).toTS()}

// Custom InputTypes
${this.argsTypes.map(TS).join('\n')}
`
  }
}

function getMethodJSDocBody(
  action: DMMF.ModelAction,
  mapping: DMMF.Mapping,
  model: DMMF.Model,
): string {
  const singular = capitalize(mapping.model)
  const plural = capitalize(mapping.plural)
  const firstScalar = model.fields.find((f) => f.kind === 'scalar')
  const method = `prisma.${lowerCase(mapping.model)}.${action}`

  switch (action) {
    case DMMF.ModelAction.create:
      return `Create a ${singular}.
@param {${getModelArgName(
        model.name,
        action,
      )}} args - Arguments to create a ${singular}.
@example
// Create one ${singular}
const user = await ${method}({
  data: {
    // ... data to create a ${singular}
  }
})
`
    case DMMF.ModelAction.delete:
      return `Delete a ${singular}.
@param {${getModelArgName(
        model.name,
        action,
      )}} args - Arguments to delete one ${singular}.
@example
// Delete one ${singular}
const user = await ${method}({
  where: {
    // ... filter to delete one ${singular}
  }
})
`
    case DMMF.ModelAction.deleteMany:
      return `Delete zero or more ${plural}.
@param {${getModelArgName(
        model.name,
        action,
      )}} args - Arguments to filter ${plural} to delete.
@example
// Delete a few ${plural}
const { count } = await ${method}({
  where: {
    // ... provide filter here
  }
})
`
    case DMMF.ModelAction.findMany: {
      const onlySelect = firstScalar
        ? `\n// Only select the \`${firstScalar.name}\`
const ${lowerCase(mapping.model)}With${capitalize(
            firstScalar.name,
          )}Only = await ${method}({ select: { ${firstScalar.name}: true } })`
        : ''

      return `Find zero or more ${plural}.
@param {${getModelArgName(
        model.name,
        action,
      )}=} args - Arguments to filter and select certain fields only.
@example
// Get all ${plural}
const ${mapping.plural} = await ${method}()

// Get first 10 ${plural}
const ${mapping.plural} = await ${method}({ first: 10 })
${onlySelect}
`
    }
    case DMMF.ModelAction.findOne: {
      return `Find zero or one ${singular}.
@param {${getModelArgName(
        model.name,
        action,
      )}} args - Arguments to find a ${singular}
@example
// Get one ${singular}
const ${lowerCase(mapping.model)} = await ${method}({
  where: {
    // ... provide filter here
  }
})`
    }
    case DMMF.ModelAction.update:
      return `Update one ${singular}.
@param {${getModelArgName(
        model.name,
        action,
      )}} args - Arguments to update one ${singular}.
@example
// Update one ${singular}
const ${lowerCase(mapping.model)} = await ${method}({
  where: {
    // ... provide filter here
  },
  data: {
    // ... provide data here
  }
})
`

    case DMMF.ModelAction.updateMany:
      return `Update zero or more ${plural}.
@param {${getModelArgName(
        model.name,
        action,
      )}} args - Arguments to update one or more rows.
@example
// Update many ${plural}
const ${lowerCase(mapping.model)} = await ${method}({
  where: {
    // ... provide filter here
  },
  data: {
    // ... provide data here
  }
})
`
    case DMMF.ModelAction.upsert:
      return `Create or update one ${singular}.
@param {${getModelArgName(
        model.name,
        action,
      )}} args - Arguments to update or create a ${singular}.
@example
// Update or create a ${singular}
const ${lowerCase(mapping.model)} = await ${method}({
  create: {
    // ... data to create a ${singular}
  },
  update: {
    // ... in case it already exists, update
  },
  where: {
    // ... the filter for the ${singular} we want to update
  }
})`
  }
}

function getMethodJSDoc(
  action: DMMF.ModelAction,
  mapping: DMMF.Mapping,
  model: DMMF.Model,
): string {
  return wrapComment(getMethodJSDocBody(action, mapping, model))
}

function wrapComment(str: string): string {
  return `/**\n${str
    .split('\n')
    .map((l) => ' * ' + l)
    .join('\n')}\n**/`
}

export class ModelDelegate implements Generatable {
  constructor(
    protected readonly outputType: OutputType,
    protected readonly dmmf: DMMFClass,
  ) {}
  public toTS(): string {
    const { fields, name } = this.outputType
    // TODO: Turn O(n^2) to O(n)
    const mapping = this.dmmf.mappings.find((m) => m.model === name)!
    if (!mapping) {
      return ''
    }
    const model = this.dmmf.modelMap[name]

    const actions = Object.entries(mapping).filter(
      ([key, value]) =>
        key !== 'model' && key !== 'plural' && key !== 'aggregate' && value,
    )

    // TODO: The following code needs to be split up and is a mess
    return `\
export interface ${name}Delegate {
${indent(
  actions
    .map(
      ([actionName]: [any, any]): string =>
        `${getMethodJSDoc(actionName, mapping, model)}
${actionName}<T extends ${getModelArgName(name, actionName)}>(
  args${
    actionName === DMMF.ModelAction.findMany ? '?' : ''
  }: Subset<T, ${getModelArgName(name, actionName)}>
): ${getSelectReturnType({ name, actionName, projection: Projection.select })}`,
    )
    .join('\n'),
  tab,
)}
  /**
   * 
   */
  count(args?: Omit<${getModelArgName(
    name,
    DMMF.ModelAction.findMany,
  )}, 'select' | 'include'>): Promise<number>
}

export declare class ${name}Client<T> implements Promise<T> {
  private readonly _dmmf;
  private readonly _fetcher;
  private readonly _queryType;
  private readonly _rootField;
  private readonly _clientMethod;
  private readonly _args;
  private readonly _dataPath;
  private readonly _errorFormat;
  private readonly _measurePerformance?;
  private _isList;
  private _callsite;
  private _requestPromise?;
  private _collectTimestamps?;
  constructor(_dmmf: DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
  readonly [Symbol.toStringTag]: 'PrismaClientPromise';
${indent(
  fields
    .filter((f) => f.outputType.kind === 'object')
    .map((f) => {
      const fieldTypeName = (f.outputType.type as DMMF.OutputType).name
      return `
${f.name}<T extends ${getFieldArgName(
        f,
      )} = {}>(args?: Subset<T, ${getFieldArgName(f)}>): ${getSelectReturnType({
        name: fieldTypeName,
        actionName: f.outputType.isList
          ? DMMF.ModelAction.findMany
          : DMMF.ModelAction.findOne,
        hideCondition: false,
        isField: true,
        renderPromise: true,
        fieldName: f.name,
        projection: Projection.select,
      })};`
    })
    .join('\n'),
  2,
)}

  private get _document();
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}`
  }
}

export class InputField implements Generatable {
  constructor(
    protected readonly field: DMMF.SchemaArg,
    protected readonly prefixFilter = false,
  ) {}
  public toTS(): string {
    const { field } = this
    let fieldType
    let hasNull = false
    if (Array.isArray(field.inputType)) {
      fieldType = flatMap(field.inputType, (t) => {
        const type =
          typeof t.type === 'string'
            ? GraphQLScalarToJSTypeTable[t.type] || t.type
            : this.prefixFilter
            ? `Base${t.type.name}`
            : t.type.name
        if (type === 'null') {
          hasNull = true
        }
        return type
      }).join(' | ')
    }
    const fieldInputType = field.inputType[0]
    const optionalStr = fieldInputType.isRequired ? '' : '?'
    if (fieldInputType.isList) {
      fieldType = `Enumerable<${fieldType}>`
    }
    const nullableStr =
      !fieldInputType.isRequired && !hasNull && fieldInputType.isNullable
        ? ' | null'
        : ''
    const jsdoc = field.comment ? wrapComment(field.comment) + '\n' : ''
    return `${jsdoc}${field.name}${optionalStr}: ${fieldType}${nullableStr}`
  }
}

export class OutputField implements Generatable {
  constructor(protected readonly field: BaseField) {}
  public toTS(): string {
    const { field } = this
    // ENUMTODO
    let fieldType =
      typeof field.type === 'string'
        ? GraphQLScalarToJSTypeTable[field.type] || field.type
        : field.type[0].name
    if (Array.isArray(fieldType)) {
      fieldType = fieldType[0]
    }
    const arrayStr = field.isList ? `[]` : ''
    const nullableStr = !field.isRequired && !field.isList ? ' | null' : ''
    return `${field.name}: ${fieldType}${arrayStr}${nullableStr}`
  }
}

export class OutputType implements Generatable {
  public name: string
  public fields: DMMF.SchemaField[]
  constructor(protected readonly type: DMMF.OutputType) {
    this.name = type.name
    this.fields = type.fields
  }
  public toTS(): string {
    const { type } = this
    return `
export type ${type.name} = {
${indent(
  type.fields
    .map((field) => new OutputField({ ...field, ...field.outputType }).toTS())
    .join('\n'),
  tab,
)}
}`
  }
}

export class MinimalArgsType implements Generatable {
  constructor(
    protected readonly args: DMMF.SchemaArg[],
    protected readonly model: DMMF.Model,
    protected readonly action?: DMMF.ModelAction,
  ) {}
  public toTS(): string {
    const { action, args } = this
    const { name } = this.model

    return `
/**
 * ${name} ${action ? action : 'without action'}
 */
export type ${getModelArgName(name, action)} = {
${indent(args.map((arg) => new InputField(arg).toTS()).join('\n'), tab)}
}
`
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
const topLevelArgsJsDocs = {
  findOne: {
    where: (singular, plural): string => `Filter, which ${singular} to fetch.`,
  },
  findMany: {
    where: (singular, plural): string => `Filter, which ${plural} to fetch.`,
    orderBy: (singular, plural): string =>
      `Determine the order of the ${plural} to fetch.`,
    skip: (singular, plural): string => `Skip the first \`n\` ${plural}.`,
    cursor: (singular, plural): string =>
      `Sets the position for listing ${plural}.`,
    take: (singular, plural): string =>
      `Get all ${plural} that come after or before the ${singular} you provide with the current order.`,
  },
  create: {
    data: (singular, plural): string =>
      `The data needed to create a ${singular}.`,
  },
  update: {
    data: (singular, plural): string =>
      `The data needed to update a ${singular}.`,
    where: (singular, plural): string => `Choose, which ${singular} to update.`,
  },
  upsert: {
    where: (singular, plural): string =>
      `The filter to search for the ${singular} to update in case it exists.`,
    create: (singular, plural): string =>
      `In case the ${singular} found by the \`where\` argument doesn't exist, create a new ${singular} with this data.`,
    update: (singular, plural): string =>
      `In case the ${singular} was found with the provided \`where\` argument, update it with this data.`,
  },
  delete: {
    where: (singular, plural): string => `Filter which ${singular} to delete.`,
  },
}
/* eslint-enable @typescript-eslint/no-unused-vars */

export class ArgsType implements Generatable {
  constructor(
    protected readonly args: DMMF.SchemaArg[],
    protected readonly model: DMMF.Model,
    protected readonly action?: DMMF.ModelAction,
  ) {}
  public toTS(): string {
    const { action, args } = this
    const { name } = this.model

    const singular = name
    const plural = pluralize(name)

    args.forEach((arg) => {
      if (action && topLevelArgsJsDocs[action][arg.name]) {
        const comment = topLevelArgsJsDocs[action][arg.name](singular, plural)
        arg.comment = comment
      }
    })

    const bothArgsOptional: DMMF.SchemaArg[] = [
      {
        name: 'select',
        inputType: [
          {
            type: getSelectName(name),
            kind: 'object',
            isList: false,
            isRequired: false,
            isNullable: true,
          },
        ],
        comment: `Select specific fields to fetch from the ${name}`,
      },
    ]

    const hasRelationField = this.model.fields.some((f) => f.kind === 'object')

    if (hasRelationField) {
      bothArgsOptional.push({
        name: 'include',
        inputType: [
          {
            type: getIncludeName(name),
            kind: 'object',
            isList: false,
            isRequired: false,
            isNullable: true,
          },
        ],
        comment: `Choose, which related nodes to fetch as well.`,
      })
    }

    bothArgsOptional.push(...args)

    return `
/**
 * ${name} ${action ? action : 'without action'}
 */
export type ${getModelArgName(name, action)} = {
${indent(
  bothArgsOptional.map((arg) => new InputField(arg).toTS()).join('\n'),
  tab,
)}
}
`
  }
}

export class InputType implements Generatable {
  constructor(protected readonly type: DMMF.InputType) {}
  public toTS(): string {
    const { type } = this
    const fields = uniqueBy(type.fields, (f) => f.name)
    // TO DISCUSS: Should we rely on TypeScript's error messages?
    const body = `{
${indent(
  fields
    .map((arg) =>
      new InputField(arg /*, type.atLeastOne && !type.atMostOne*/).toTS(),
    )
    .join('\n'),
  tab,
)}
}`
    return `
export type ${type.name} = ${body}`
  }
}

export class Enum implements Generatable {
  constructor(protected readonly type: DMMF.Enum) {}
  public toJS(): string {
    const { type } = this
    return `exports.${type.name} = makeEnum({
${indent(type.values.map((v) => `${v}: '${v}'`).join(',\n'), tab)}
});`
  }
  public toTS(): string {
    const { type } = this

    return `export declare const ${type.name}: {
${indent(type.values.map((v) => `${v}: '${v}'`).join(',\n'), tab)}
};

export declare type ${type.name} = (typeof ${type.name})[keyof typeof ${
      type.name
    }]\n`
  }
}

function escapeJson(str: string): string {
  return str
    .replace(/\\n/g, '\\\\n')
    .replace(/\\r/g, '\\\\r')
    .replace(/\\t/g, '\\\\t')
}
