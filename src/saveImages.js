import path from 'path';
import cheerio from 'cheerio';

import {
  formatAssetName,
  deleteProtocolFromUrl,
  downloadAssets,
  retrieveAssetUrls,
} from './utils.js';

const changeImagesSources = ($, imagesUrls, assetFolderName) => {
  const newSrc = imagesUrls.map((url) => {
    const name = formatAssetName(deleteProtocolFromUrl(url));
    return path.join(assetFolderName, name);
  });
  $('img').each(function (index) {
    $(this).attr('src', newSrc[index]);
  });
  return $.root().html();
};

export default (page, pageUrl, assetFolderName, assetFolderPath) => {
  const $ = cheerio.load(page);
  const imagesUrls = retrieveAssetUrls(page, pageUrl, 'img', 'all');
  return downloadAssets(imagesUrls.map(({ url }) => url), assetFolderPath)
    .then(() => (
      changeImagesSources($, imagesUrls.map(({ url }) => url), assetFolderName)
    ));
};
