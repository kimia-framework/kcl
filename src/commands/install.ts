import { CommandClass } from "../common/CommandClass"
import * as PATH from 'path';
import * as FS from 'fs';
import { Global } from "../global";
import { copyFolderSync, errorLog, messageLog, warningLog, deleteDirectory, checkGitInstalled } from "../common/public";
import { CommandModel } from "../common/interfaces";
import * as SHELL from 'shelljs';

export function init() {
   return installCommand;
}

export type argvName = 'skip-npm';

export class installCommand extends CommandClass<argvName> {
   define(): CommandModel<argvName> {
      return {
         name: 'install',
         description: "install framework core and node packages",
         alias: 'i',
         argvs: [
            {
               name: 'skip-npm',
               description: 'Do not install dependency packages.'
            },
         ],
      }
   }
   /**************************************** */
   async run() {
      // =>check git installed
      if (!checkGitInstalled()) {
         errorLog('install', 'git not installed!');
         process.exit(1);
      }


      // =>install core
      await installCommand.installCore(Global.pwd);

      // =>install npm
      // =>install packages, if allowed
      if (!this.hasArgv('skip-npm')) {
         await installCommand.installNpm(Global.pwd);
      }

      return true;
   }
   /**************************************** */
   static async installCore(path: string) {
      // =>check git installed
      if (!checkGitInstalled()) {
         errorLog('install', 'git not installed!');
         process.exit(1);
      }
      messageLog('installing core ...', 'info');
      SHELL.cd(path);
      SHELL.exec(`git clone https://github.com/kimia-framework/core.git -v --progress --branch=master`);
      // =>remove .git
      deleteDirectory(PATH.join(path, 'core', '.git'));
   }
   /**************************************** */
   static async installNpm(path: string) {
      messageLog('installing packages ...', 'info');
      SHELL.cd(path);
      SHELL.exec('npm install');
   }
}