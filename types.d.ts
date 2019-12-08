import Knex from 'knex';

interface AdditionalOptions {
  postProcessResponse(content: string, queryContext: any): string;

  wrapIdentifier(value: string, origImpl: any, queryContext: any): string;
}

declare function knexStringcase<KnexOptions extends Knex.Config>(
  knexOptions: KnexOptions
): KnexOptions & AdditionalOptions;

export = knexStringcase;
