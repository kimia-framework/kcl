import { CommandClass } from "../common/CommandClass"
import * as PATH from 'path';
import * as FS from 'fs';
import { Global } from "../global";
import { copyFolderSync, errorLog, messageLog, warningLog, deleteDirectory, checkGitInstalled, createZipFile, infoLog } from "../common/public";
import { CommandInput } from "../common/CommandInput";
import * as OS from 'os';
import { spawnSync, execSync } from 'child_process';
import { CommandModel } from "../common/interfaces";
import * as SHELL from 'shelljs';
import { installCommand } from "./install";

export function init() {
   return ZipCommand;
}

export type argvName = 'skip-core' | 'skip-settings' | 'name' | 'skip-storage';

export class ZipCommand extends CommandClass<argvName> {
   define(): CommandModel<argvName> {
      return {
         name: 'zip',
         description: "Creates a zip file from project",
         alias: 'z',
         argvs: [
            {
               name: 'skip-core',
               description: 'Do not include core/ directory (default skip)',
               defaultValue: true,
            },
            {
               name: 'skip-settings',
               description: 'Do not include dev, prod settings (default skip)',
               defaultValue: true,
            },
            {
               name: 'skip-storage',
               description: 'Do not include storage/ directory (default skip)',
               defaultValue: true,
            },
            {
               name: 'name',
               description: 'The name of zip file',
               force: true,
               alias: 'n',
               type: 'string',
               defaultValue: 'deploy',
            },
         ],
      }
   }
   /**************************************** */
   async run() {
      // =>init vars
      let zipPath = PATH.join(Global.pwd, this.getArgv('name') + '.zip');
      let excludeFiles = ['.gitignore', 'package-lock.json'];
      let excludeDirs = ['.git', 'node_modules', '.vscode', 'build'];
      // =>if skip storage
      if (this.hasArgv('skip-storage')) {
         excludeDirs.push('storage');
      }
      // =>if skip settings
      if (this.hasArgv('skip-settings')) {
         excludeDirs.push('settings');
      }
      // =>if skip core
      if (this.hasArgv('skip-core')) {
         excludeDirs.push('core');
      }
      // =>read '.skipdeploy' file, if exist
      if (FS.existsSync(PATH.join(Global.pwd, '.skipdeploy'))) {
         try {
            let lines = FS.readFileSync(PATH.join(Global.pwd, '.skipdeploy')).toString().split('\n');
            // =>iterate lines
            for (let line of lines) {
               line = line.trim();
               if (line.length < 1 || line[0] === '#') continue;
               // =>check exist path
               let stat = FS.statSync(PATH.join(Global.pwd, line));
               // console.log('stat:', line, stat);
               if (!stat) continue;
               // =>add path as dir
               if (stat.isDirectory()) excludeDirs.push(line);
               // =>or add path as file
               else excludeFiles.push(line);
            }
         } catch (e) {
            errorLog('err75', "bad '.skipdeploy' file");
         }
      }
      // console.log('excludes:', excludeFiles, excludeDirs);
      // =>create zip file
      await createZipFile(Global.pwd, zipPath, excludeFiles, excludeDirs);
      messageLog(`created zip file in '${zipPath}'`, 'success');

      return true;
   }
}