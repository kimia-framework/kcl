import { CommandClass } from "../common/CommandClass"
import * as PATH from 'path';
import * as FS from 'fs';
import { Global } from "../global";
import { copyFolderSync, errorLog, messageLog, warningLog } from "../common/public";
import { CommandInput } from "../common/CommandInput";
import * as OS from 'os';
import { spawnSync, execSync } from 'child_process';
import { CommandModel } from "../common/interfaces";

export function init() {
   return GenerateCommand;
}

export type argvName = 'name' | 'type';

export type GenerateType = 'app' | 'locale';

export class GenerateCommand extends CommandClass<argvName> {
   _name: string = 'test';
   _type: GenerateType = 'app';
   define(): CommandModel<argvName> {
      return {
         name: 'generate',
         description: "Generates and/or modifies files based on a app.",
         alias: 'g',
         argvs: [
            // {
            //    name: 'type',
            //    description: "Type of generate like ;'app' or 'locale'",
            //    force: true,
            //    alias: 't',
            //    type: 'string',
            //    defaultValue: 'app',
            // },
            // {
            //    name: 'name',
            //    description: 'The name of the new app or locale',
            //    force: true,
            //    alias: 'n',
            //    type: 'string',
            //    defaultValue: 'test',
            // },
         ],
      }
   }
   /**************************************** */
   async run() {
      // =>init vars
      // this._name = this.getArgv('name');
      // this._type = this.getArgv<GenerateType>('type');
      // // =>if not set name argv
      // if (!this._name) {
      //    this._name = await CommandInput.question('Enter generate name:', 'test');
      // }
      // // if type is app
      // if (this._type === 'app') {
      //    this.generateApp();
      // }
      //TODO:

      return true;
   }
   /**************************************** */
   generateApp() {
      const rootPath = PATH.resolve(PATH.join(Global.pwd, 'apps', this._name));
      // =>check exist
      if (!FS.existsSync(rootPath)) {
         FS.mkdirSync(rootPath, { recursive: true });
      }
      // =>create models dir
      FS.mkdirSync(PATH.join(rootPath, 'models'), { recursive: true });
      // =>create views dir
      FS.mkdirSync(PATH.join(rootPath, 'views'), { recursive: true });
      // =>create interfaces file
      FS.writeFileSync(PATH.join(rootPath, 'interfaces.ts'), '');
      // =>create types file
      FS.writeFileSync(PATH.join(rootPath, 'types.ts'), '');
      // =>create app file
      FS.writeFileSync(PATH.join(rootPath, 'app.ts'), `
      import { ViewPUT } from "./views/put";
      import { ViewGET } from "./views/get";
      import { ViewDELETE } from "./views/delete";
      import { ViewPOST } from "./views/post";
      import { AppModule } from "../../core/interfaces";

      export const app: AppModule = {
         declarations: {
            get: ViewGET,
            post: ViewPOST,
            delete: ViewDELETE,
            put: ViewPUT,
         }
      };
      `);
      // =>create base file
      FS.writeFileSync(PATH.join(rootPath, 'base.ts'), `
      import { AppView } from "../../core/server/app-view";
      export class ViewBase extends AppView {

      }
      `);
      // =>create get,post,delete,put file
      for (const typ of ['get', 'post', 'delete', 'put']) {
         FS.writeFileSync(PATH.join(rootPath, 'views', typ + '.ts'), `
         import { ViewBase } from "../base";
         export class View${typ.toUpperCase()} extends ViewBase {


         }
         `);
      }


   }
}