#!/usr/bin/env node
import { program } from "commander";
import downloadPage from "../downloadPage.js";

program.version('1.0.0')
  .description('Page loader utility')
  .option('-o --output [dir]', 'output dir', '/home/user/current-dir')
  .argument('<url>')
  .action(async (url, { output }) => {
    let res;
    try {
      res = await downloadPage(output, url);
    } catch(e) {
      res = e.message;
    }
    console.log(res);
  })
  .parse();