import {
  downloadAssets,
  retrieveAssetUrls,
  changeAssetsPaths,
} from './utils.js';

export default (page, pageUrl, assetFolderName, assetFolderPath) => {
  const scriptsUrls = retrieveAssetUrls(page, pageUrl, 'script', 'local');
  return downloadAssets(scriptsUrls.map(({ url }) => url), assetFolderPath)
    .then(() => (
      changeAssetsPaths(page, scriptsUrls, 'script', assetFolderName)
    ));
};
