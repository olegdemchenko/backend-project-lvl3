import path from 'path';
import cheerio from 'cheerio';

import {
  formatAssetName,
  deleteProtocolFromUrl,
  downloadAssets,
  createPageName,
  retrieveAssetUrls,
} from './utils.js';

const changeStylesSources = ($, stylesUrls, assetFolderName) => {
  const newSrc = stylesUrls.map(({ url, id }) => {
    const ext = path.extname(new URL(url).pathname);
    const name = ext ? formatAssetName(deleteProtocolFromUrl(url)) : createPageName(url);
    return {
      url: path.join(assetFolderName, name),
      id,
    };
  });
  $('link').each(function (index) {
    const correspondingSrc = newSrc.find(({ id }) => id === index);
    if (!correspondingSrc) {
      return;
    }
    $(this).attr('href', correspondingSrc.url);
  });
  return $.root().html();
};

export default (page, pageUrl, assetFolderName, assetFolderPath) => {
  const $ = cheerio.load(page);
  const stylesUrls = retrieveAssetUrls(page, pageUrl, 'link', 'local');
  return downloadAssets(stylesUrls.map(({ url }) => url), assetFolderPath)
    .then(() => (
      changeStylesSources($, stylesUrls, assetFolderName)
    ));
};
