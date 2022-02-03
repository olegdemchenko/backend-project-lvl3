import {
  downloadAssets,
  retrieveAssetUrls,
  changeAssetsPaths,
} from './utils.js';

export default (page, pageUrl, assetFolderName, assetFolderPath) => {
  const imagesUrls = retrieveAssetUrls(page, pageUrl, 'img', 'all');
  return downloadAssets(imagesUrls.map(({ url }) => url), assetFolderPath)
    .then(() => (
      changeAssetsPaths(page, imagesUrls, 'img', assetFolderName)
    ));
};
