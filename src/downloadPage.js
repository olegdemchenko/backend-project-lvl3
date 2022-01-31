import axios from 'axios';

import {
  createAssetFolder,
  savePage,
} from './utils.js';
import saveImages from './saveImages.js';

export default (outputPath, pageUrl) => {
  let assetFolderPath;
  let assetFolderName;
  let page;
  return axios.get(pageUrl)
    .then(({ data }) => {
      page = data;
      return createAssetFolder(pageUrl, outputPath);
    })
    .then(({ folderName, folderPath }) => {
      assetFolderName = folderName;
      assetFolderPath = folderPath;
      return saveImages(page, pageUrl, assetFolderName, assetFolderPath);
    })
    .then((changedPage) => savePage(changedPage, pageUrl, outputPath))
    .catch((e) => {
      console.log(e);
      throw e;
    });
};
