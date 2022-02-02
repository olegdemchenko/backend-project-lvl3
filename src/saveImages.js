import fs from 'fs/promises';
import path from 'path';
import cheerio from 'cheerio';
import axios from 'axios';

import {
  formatAssetName,
  deleteProtocolFromUrl,
} from './utils.js';

const getImagesUrls = ($, pageUrl) => {
  const { origin } = new URL(pageUrl);
  const imagesSources = $('img').map(function () {
    return $(this).attr('src');
  }).get();
  const imagesSourcesWithAbsolutePaths = imagesSources.map((url) => new URL(url, origin).href);
  return imagesSourcesWithAbsolutePaths;
};

const downloadImages = (urls, assetFolderPath) => (
  Promise.all(urls.map((url) => (
    axios.get(url, { responseType: 'arraybuffer' })
  )))
    .then((resp) => {
      const images = resp.map(({ config: { url }, data }) => ({
        url,
        data,
      }));
      const imagesWithPaths = images.map(({ url, data }) => {
        const name = formatAssetName(deleteProtocolFromUrl(url));
        const imgPath = path.join(assetFolderPath, name);
        return { filePath: imgPath, data };
      });
      return Promise.all(imagesWithPaths.map(({ filePath, data }) => (
        fs.writeFile(filePath, data)
      )));
    })
);

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
  return downloadImages(imagesUrls, assetFolderPath)
    .then(() => (
      changeImagesSources($, imagesUrls, assetFolderName)
    ));
};
