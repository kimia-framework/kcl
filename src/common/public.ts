import { execSync } from 'child_process';
import { CommandInput } from "./CommandInput";
import * as PROCESS from 'process';
import * as PATH from 'path';
import * as FS from 'fs';
import { FileInfo } from "./interfaces";
/************************************************************* */
export function log(text: string, label?: string, type: 'info' | 'error' | 'warning' | 'success' | 'normal' = 'normal', hasDateTime = true, end = '\n') {
   let time = new Date().toTimeString().slice(0, 8);
   let date = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
   let message;
   if (hasDateTime) {
      message = `[${date}-${time}] : ${text}`;
   } else {
      message = text;
   }
   if (label && label.length > 0) {
      if (hasDateTime) {
         message = `[${date}-${time}] ${label} : ${text}`;
      } else {
         message = `${label} : ${text}`;
      }
   }
   if (type === 'error') {
      process.stderr.write(CommandInput.ansiColors(message, 'red', true) + end);
      // console.error();
   } else if (type === 'info') {
      process.stdout.write(CommandInput.ansiColors(message, 'blue', true) + end);
   } else if (type === 'warning') {
      process.stdout.write(CommandInput.ansiColors(message, 'yellow', true) + end);
   } else if (type === 'success') {
      process.stdout.write(CommandInput.ansiColors(message, 'green', true) + end);
   } else {
      process.stdout.write(message + end);
      // console.log(message);
   }
}
/************************************************************* */
export function messageLog(message: string, type: 'info' | 'error' | 'warning' | 'success' | 'normal' = 'normal', end = '\n') {
   log(message, undefined, type, false, end);
}
/************************************************************* */
export function errorLog(name: string, message: string) {
   log(message, name, 'error');
   let time = new Date().toTimeString().slice(0, 8);
   let date = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
   try {
      // FS.writeFileSync(PATH.join(Settings.VARS_PATH, 'errors'), `[${date}-${time}] ${name} ${phone}::${message}\n`, {
      //    flag: 'a',
      // });
   } catch (e) {
      // log(`can not write on ${PATH.join(Settings.VARS_PATH, 'errors')} file`, 'err4553', 'error');
   }
}
/************************************************************* */
export function infoLog(name: string, message: string) {
   log(message, name, 'info');
   try {
      let time = new Date().toTimeString().slice(0, 8);
      let date = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
      // FS.writeFileSync(PATH.join(Settings.VARS_PATH, 'info'), `[${date}-${time}] ${name} ${message}\n`, {
      //    flag: 'a',
      // });
   } catch (e) {
      // log(`can not write on ${PATH.join(Settings.VARS_PATH, 'info')} file`, 'err455563', 'error');
   }
}
/************************************************************* */
export function warningLog(name: string, message: string) {
   log(message, name, 'warning');
   try {
      let time = new Date().toTimeString().slice(0, 8);
      let date = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
      // FS.writeFileSync(PATH.join(Settings.VARS_PATH, 'info'), `[${date}-${time}] ${name} ${message}\n`, {
      //    flag: 'a',
      // });
   } catch (e) {
      // log(`can not write on ${PATH.join(Settings.VARS_PATH, 'info')} file`, 'err455563', 'error');
   }
}
/************************************************************* */
/**
 * 
 * @param source 
 * @param target 
 * @param justContents not copy source dir, just its content
 */
export function copyFolderSync(source: string, target: string, justContents = false) {
   if (!FS.lstatSync(source).isDirectory()) return;
   // Check if folder needs to be created or integrated
   let targetFolder = PATH.join(target, PATH.basename(source));
   if (justContents) targetFolder = target;
   if (!FS.existsSync(targetFolder)) {
      FS.mkdirSync(targetFolder, { recursive: true });
   }

   // Copy

   let files = FS.readdirSync(source, { withFileTypes: true });
   for (const f of files) {
      var curSource = PATH.join(source, f.name);
      var curDest = PATH.join(targetFolder, f.name);
      // =>if dir
      if (f.isDirectory()) {
         copyFolderSync(curSource, curDest, true);
      }
      // =>if file
      else {
         FS.copyFileSync(curSource, curDest);
      }

   }

}
/************************************************************* */
export async function sleep(ms = 1000) {
   return new Promise(resolve => setTimeout(resolve, ms));
}
/************************************************************* */
/**
 * 
 * @param path 
 * @param match just files and folders that match by this 
 * @returns 
 */
export function getFilesList(path: string, match?: RegExp) {
   let files: FileInfo[] = [];
   const filesInDirectory = FS.readdirSync(path);
   for (const file of filesInDirectory) {
      // =>match search regex, if exist
      if (match && !match.test(file)) continue;
      const absolute = PATH.join(path, file);
      // =>get stat of file
      const stat = FS.statSync(absolute);
      // =>add file
      files.push({
         path: absolute,
         type: stat.isDirectory() ? 'dir' : 'file',
         stat,
      });
      // =>if dir
      if (stat.isDirectory()) {
         const dirFiles = getFilesList(absolute, match);
         for (const f of dirFiles) {
            files.push(f);
         }
      }
   }
   return files;
}
/************************************************************* */
export function deleteDirectory(path: string) {
   if (FS.existsSync(path)) {
      FS.readdirSync(path).forEach((file, index) => {
         const curPath = PATH.join(path, file);
         if (FS.lstatSync(curPath).isDirectory()) { // recurse
            deleteDirectory(curPath);
         } else { // delete file
            FS.unlinkSync(curPath);
         }
      });
      FS.rmdirSync(path);
   }
}
/************************************************************* */
export function checkGitInstalled() {
   return execSync('git --version').indexOf('git version') > -1;
}
/************************************************************* */
export async function createZipFile(path: string, newPath: string, excludeFiles?: string[], excludeDirs?: string[]) {
   var jszip = require('jszip');
   const zip = new jszip();
   const addZip = (path: string, zipPath: string) => {
      const files = FS.readdirSync(path, { withFileTypes: true });
      for (const f of files) {
         // =>if file
         if (f.isFile()) {
            let newPath = PATH.join(zipPath, f.name);
            // =>check not in exclude files
            if (excludeFiles && excludeFiles.includes(newPath)) continue;
            // =>add file
            zip.file(PATH.join(zipPath, f.name), FS.readFileSync(PATH.join(path, f.name)));
         }
         //=> if dir
         if (f.isDirectory()) {
            // console.log('dir:', PATH.join(zipPath, f.name));
            let newPath = PATH.join(zipPath, f.name);
            // =>check not in exclude dirs
            if (excludeDirs && excludeDirs.includes(newPath)) continue;
            // =>add folder
            zip.folder(PATH.join(zipPath, f.name));
            addZip(PATH.join(path, f.name), PATH.join(zipPath, f.name));
         }
      }
   }
   // =>add files to zip
   addZip(path, '');
   // =>create zip file
   return new Promise((res) => {
      zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
         .pipe(FS.createWriteStream(newPath))
         .on('finish', () => {
            // JSZip generates a readable stream with a "end" event,
            // but is piped here in a writable stream which emits a "finish" event.
            // infoLog('create a zip file in :' + newPath);
            res(newPath);
         });
   });
}
/************************************************************* */
export async function extractZipFile(path: string, extractPath: string) {
   var jszip = require('jszip');

   return new Promise((res) => {
      FS.readFile(path, function (err, data) {
         if (err) {
            errorLog('err436532', err.message);
            res(false);
         }
         else {
            var zip = new jszip();
            zip.loadAsync(data).then(function (contents: any) {
               for (const filename of Object.keys(contents.files)) {
                  if (!filename) continue;
                  // =>check if dir
                  if (zip.files[filename].dir) {
                     FS.mkdirSync(PATH.join(extractPath, filename), { recursive: true });
                  }
                  // =>check if file
                  else {
                     zip.files[filename].async('nodebuffer').then(function (content: any) {
                        FS.writeFileSync(PATH.join(extractPath, filename), content);
                     });
                  }
               }
               res(true);
            });
         }
      });

   });

}