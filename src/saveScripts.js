import path from 'path';
import cheerio from 'cheerio';

import {
  formatAssetName,
  deleteProtocolFromUrl,
  downloadAssets,
  retrieveAssetUrls,
} from './utils.js';

const changeScriptsSources = ($, scriptsUrls, assetFolderName) => {
  const newSrc = scriptsUrls.map(({ url, id }) => {
    const name = formatAssetName(deleteProtocolFromUrl(url));
    return {
      url: path.join(assetFolderName, name),
      id,
    };
  });
  $('script').each(function (index) {
    const correspondingSrc = newSrc.find(({ id }) => id === index);
    if (!correspondingSrc) {
      return;
    }
    $(this).attr('src', correspondingSrc.url);
  });
  return $.root().html();
};

export default (page, pageUrl, assetFolderName, assetFolderPath) => {
  const $ = cheerio.load(page);
  const scriptsUrls = retrieveAssetUrls(page, pageUrl, 'script', 'local');
  return downloadAssets(scriptsUrls.map(({ url }) => url), assetFolderPath)
    .then(() => (
      changeScriptsSources($, scriptsUrls, assetFolderName)
    ));
};
