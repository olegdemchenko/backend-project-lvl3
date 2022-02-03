import {
  downloadAssets,
  retrieveAssetUrls,
  changeAssetsPaths,
} from './utils.js';

export default (page, pageUrl, assetFolderName, assetFolderPath) => {
  const stylesUrls = retrieveAssetUrls(page, pageUrl, 'link', 'local');
  return downloadAssets(stylesUrls.map(({ url }) => url), assetFolderPath)
    .then(() => (
      changeAssetsPaths(page, stylesUrls, 'link', assetFolderName)
    ));
};
