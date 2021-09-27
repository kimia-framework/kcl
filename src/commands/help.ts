import { CommandClass } from "../common/CommandClass"
import * as PATH from 'path';
import * as FS from 'fs';
import { errorLog, log, infoLog, messageLog } from "../common/public";
import { CommandModel } from "../common/interfaces";

export function init() {
   return HelpCommand;
}

export class HelpCommand extends CommandClass {
   /********************************** */
   define(): CommandModel {
      return {
         name: 'help',
         description: 'Lists available commands and their short descriptions.',
         alias: 'h',
         argvs: [],
      };
   }
   /********************************** */
   async run() {
      messageLog('Available Commands:', 'info', '\n\n');
      // =>search for all commands
      const files = FS.readdirSync(__dirname, { withFileTypes: true });
      for (const f of files) {
         try {
            // =>init command class
            const commandClass = await import(PATH.join(__dirname, f.name));
            // =>init command class
            let cmd = new (commandClass['init']())() as CommandClass;
            messageLog(cmd.name, 'warning', ' ');
            messageLog(cmd.description, 'normal');
         } catch (e) { }
      }
      messageLog(`\ntype 'kcl [command] -h' for more help!`);
      return true;
   }
}