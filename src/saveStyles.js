import path from 'path';
import cheerio from 'cheerio';

import {
  formatAssetName,
  deleteProtocolFromUrl,
  downloadAssets,
  createPageName,
} from './utils.js';

const getStylesUrls = ($, pageUrl) => {
  const { origin, host: baseHost } = new URL(pageUrl);
  const stylesSources = $('link').map(function (index) {
    return {
      id: index,
      url: $(this).attr('href'),
    };
  }).get();
  const stylesSourcesWithAbsolutePaths = stylesSources
    .map(({ url, id }) => ({
      url: new URL(url, origin).href,
      id,
    }));
  const stylesSourcesFromBaseHost = stylesSourcesWithAbsolutePaths
    .filter(({ url }) => new URL(url).host === baseHost);
  return stylesSourcesFromBaseHost;
};

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
  const stylesUrls = getStylesUrls($, pageUrl);
  return downloadAssets(stylesUrls.map(({ url }) => url), assetFolderPath)
    .then(() => (
      changeStylesSources($, stylesUrls, assetFolderName)
    ));
};
