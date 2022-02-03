import axios from 'axios';
import path from 'path';

import {
  createAssetFolder,
  savePage,
} from './utils.js';
import saveImages from './saveImages.js';
import saveStyles from './saveStyles.js';

export default (outputPath, pageUrl) => {
  let assetFolderPath;
  let assetFolderName;
  let page;
  return axios.get(pageUrl)
    .then(({ data }) => {
      page = data;
      return createAssetFolder(pageUrl, outputPath);
    })
    .then(({ folderPath }) => {
      assetFolderName = path.parse(folderPath).name;
      assetFolderPath = folderPath;
      return saveImages(page, pageUrl, assetFolderName, assetFolderPath);
    })
    .then((changedPage) => saveStyles(changedPage, pageUrl, assetFolderName, assetFolderPath))
    .then((changedPage) => savePage(changedPage, pageUrl, outputPath))
    .catch((e) => {
      console.log(e);
      throw e;
    });
};
