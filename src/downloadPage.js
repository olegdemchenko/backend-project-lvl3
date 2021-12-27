import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

export default (outputPath, pageUrl) => {
  return axios.get(pageUrl)
    .then(({ data }) => {
      return data;
    })
    .then((pageData) => {
      const resource = pageUrl.match(/\w+:\/\/(\S+)/i)[1];
      const pageName = resource.replace(/[^a-zA-Z0-9]/g, '-') + '.html';
      const fullPath = path.join(outputPath, pageName);
      return fs.writeFile(fullPath, pageData)
        .then(() => fullPath);
    })
    .catch((e) => {
      console.log(e);
      throw e;
    })
};