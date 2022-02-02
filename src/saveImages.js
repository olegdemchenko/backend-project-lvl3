import path from 'path';
import cheerio from 'cheerio';

import {
  formatAssetName,
  deleteProtocolFromUrl,
  downloadAssets,
} from './utils.js';

const getImagesUrls = ($, pageUrl) => {
  const { origin } = new URL(pageUrl);
  const imagesSources = $('img').map(function () {
    return $(this).attr('src');
  }).get();
  const imagesSourcesWithAbsolutePaths = imagesSources.map((url) => new URL(url, origin).href);
  return imagesSourcesWithAbsolutePaths;
};

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
  const imagesUrls = getImagesUrls($, pageUrl);
  return downloadAssets(imagesUrls, assetFolderPath)
    .then(() => (
      changeImagesSources($, imagesUrls, assetFolderName)
    ));
};
