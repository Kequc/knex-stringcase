declare module 'knex-stringcase' {
    import * as Knex from 'knex';

    type StringCase = 
        'camelcase' | 'capitalcase' | 'constcase' |
        'cramcase' | 'decapitalcase' | 'dotcase' |
        'enumcase' | 'lowercase' | 'pascalcase' |
        'pathcase' | 'sentencecase' | 'snakecase' |
        'spacecase' | 'spinalcase' | 'titlecase' |
        'trimcase' | 'uppercase';

    interface IKnexStringCaseConfig extends Knex.Config {
        appStringcase?: StringCase | StringCase[];
        dbStringcase?: StringCase | StringCase[];
        beforePostProcessResponse?(result: any[] | object, queryContext: object): any[] | object;
        beforeWrapIdentifier?(value: string, queryContext: object): string;
        ignoreStringcase?(obj: object): boolean;
    }
  
    function knexStringcase(config: IKnexStringCaseConfig): Knex.Config;
    export = knexStringcase;
}