import { CommandClass } from "../common/CommandClass"
import * as PATH from 'path';
import * as FS from 'fs';
import { Global } from "../global";
import { copyFolderSync, errorLog, messageLog, warningLog, deleteDirectory, checkGitInstalled } from "../common/public";
import { CommandInput } from "../common/CommandInput";
import * as OS from 'os';
import { spawnSync, execSync } from 'child_process';
import { CommandModel } from "../common/interfaces";
import * as SHELL from 'shelljs';
import { installCommand } from "./install";

export function init() {
   return newCommand;
}

export type argvName = 'skip-git' | 'skip-install' | 'name';

export class newCommand extends CommandClass<argvName> {
   define(): CommandModel<argvName> {
      return {
         name: 'new',
         description: "Creates a new workspace and an initial application based on kimia framework.",
         alias: 'n',
         argvs: [
            {
               name: 'skip-git',
               description: 'Do not initialize a git repository.',
            },
            {
               name: 'skip-install',
               description: 'Do not install dependency packages.'
            },
            {
               name: 'name',
               description: 'The name of the new workspace and initial project.',
               force: true,
               alias: 'n',
               type: 'string',
            }
         ],
      }
   }
   /**************************************** */
   async run() {
      // =>check git installed
      if (!checkGitInstalled()) {
         errorLog('run', 'git not installed!');
         process.exit(1);
      }
      // =>init vars
      let siteName = this.getArgv('name');
      // =>if not set name argv
      if (!siteName) {
         siteName = await CommandInput.question('Enter Site name:', 'kimia_app');
      }
      const rootPath = PATH.resolve(PATH.join(Global.pwd, siteName));
      let defaultLang: string;
      // =>check exist
      if (FS.existsSync(rootPath)) {
         warningLog('warn6786', 'exist directory: ' + rootPath);
         // return false;
      }
      // =>create root dir
      messageLog(`creating ${siteName} application in '${rootPath}'`, 'info');
      FS.mkdirSync(rootPath, { recursive: true });
      // =>clone sample project
      SHELL.cd(rootPath);
      SHELL.exec(`git clone https://github.com/kimia-framework/sample-project.git -v --progress --branch=master`);
      // =>remove .git
      deleteDirectory(PATH.join(rootPath, 'sample-project', '.git'));
      // =>copy contents of 'sample-project'
      copyFolderSync(PATH.join(rootPath, 'sample-project'), '.', true);
      // =>remove sample-project
      deleteDirectory(PATH.join(rootPath, 'sample-project'));
      // =>update app settings
      let settings = FS.readFileSync(PATH.join(rootPath, 'settings', 'dev.ts')).toString();
      // =>set site name
      settings = settings.replace(/SITE_NAME:\s*'*.*'/, `SITE_NAME: '${siteName}'`);
      // =>set db name
      settings = settings.replace(/dbName:\s*'*.*'/, `dbName: '${siteName}'`);
      // =>write settings
      FS.writeFileSync(PATH.join(rootPath, 'settings', 'dev.ts'), settings);
      // =>init git, if allowed
      if (!this.hasArgv('skip-git')) {
         // =>create .gitignore file
         FS.writeFileSync(PATH.join(rootPath, '.gitignore'), 'node_modules\n');
         // =>init git
         SHELL.exec('git init');
      }
      // =>install kimia core
      await installCommand.installCore(rootPath);
      // =>install packages, if allowed
      if (!this.hasArgv('skip-install')) {
         // =>install kimia core
         await installCommand.installNpm(rootPath);
      }

      return true;
   }
}