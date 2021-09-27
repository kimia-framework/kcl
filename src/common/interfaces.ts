import { baseArgvName, CommandType } from "./types";
import * as FS from 'fs';


export interface CommandModel<A extends string = string> {
   name: CommandType;
   description: string;
   longDescription?: string; // md file name
   alias?: string;
   implement?: [filename: string, classname: string,];
   argvs: CommandArgvModel<A>[];
}

export interface CommandArgvModel<A extends string = string> {
   name: A | baseArgvName;
   description: string;
   force?: boolean;
   alias?: string;
   type?: 'boolean' | 'number' | 'string';
   defaultValue?: any;
}

export interface CommandRunArgv<A extends string = string> {
   key: A | baseArgvName;
   value?: any;
   isAlias?: boolean;
}

export interface FileInfo {
   path: string;
   type: 'dir' | 'file';
   stat: FS.Stats;
}