import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';
import cheerio from 'cheerio';

export const deleteProtocolFromUrl = (url) => {
  if (url.startsWith('/')) {
    return url;
  }
  const { protocol } = new URL(url);
  const newUrl = url.replace(`${protocol}//`, '');
  return newUrl;
};

const createName = (url) => {
  const resource = deleteProtocolFromUrl(url);
  return resource.replace(/\/$/, '').replace(/[^a-zA-Z0-9]/g, '-');
};

export const createPageName = (url) => `${createName(url)}.html`;

export const createAssetFolderName = (url) => `${createName(url)}_files`;

export const createAssetFolder = (url, outputPath) => {
  const folderName = createAssetFolderName(url);
  const folderPath = path.join(outputPath, folderName);
  return fs.mkdir(folderPath)
    .then(() => ({
      folderPath,
    }));
};

export const savePage = (page, pageUrl, outputPath) => {
  const pageName = createPageName(pageUrl);
  const fullPath = path.join(outputPath, pageName);
  return fs.writeFile(fullPath, page)
    .then(() => fullPath);
};

export const formatAssetName = (filePath) => {
  const { dir, base } = path.parse(filePath);
  return `${dir.replace(/[^a-zA-Z0-9]/g, '-')}-${base}`;
};

export const retrieveAssetUrls = (page, pageUrl, assetTag, assetType) => {
  const attributesMap = {
    link: 'href',
    img: 'src',
    script: 'src',
  };
  const $ = cheerio.load(page);
  const { origin, host: baseHost } = new URL(pageUrl);
  return $(assetTag).map(function (index) {
    return {
      id: index,
      url: $(this).attr(attributesMap[assetTag]),
    };
  }).get()
    .map(({ url, id }) => ({
      url: new URL(url, origin).href,
      id,
    }))
    .filter(({ url }) => {
      if (assetType === 'all') {
        return true;
      }
      return new URL(url).host === baseHost;
    });
};

export const downloadAssets = (urls, assetFolderPath) => (
  Promise.all(urls.map((url) => (
    axios.get(url, { responseType: 'arraybuffer' })
  )))
    .then((resp) => {
      const assets = resp.map(({ config: { url }, data }) => ({
        url,
        data,
      }));
      const assetsWithPaths = assets.map(({ url, data }) => {
        const ext = path.extname(new URL(url).pathname);
        const name = ext ? formatAssetName(deleteProtocolFromUrl(url)) : createPageName(url);
        const assetPath = path.join(assetFolderPath, name);
        return { filePath: assetPath, data };
      });
      return Promise.all(assetsWithPaths.map(({ filePath, data }) => (
        fs.writeFile(filePath, data)
      )));
    })
);

export const changeAssetsPaths = (page, assetsUrls, assetType, assetFolderName) => {
  const attributesMap = {
    link: 'href',
    img: 'src',
    script: 'src',
  };
  const newPaths = assetsUrls.map(({ url, id }) => {
    const ext = path.extname(new URL(url).pathname);
    const name = ext ? formatAssetName(deleteProtocolFromUrl(url)) : createPageName(url);
    return {
      url: path.join(assetFolderName, name),
      id,
    };
  });
  const $ = cheerio.load(page);
  $(assetType).each(function (index) {
    const correspondingSrc = newPaths.find(({ id }) => id === index);
    if (!correspondingSrc) {
      return;
    }
    $(this).attr(attributesMap[assetType], correspondingSrc.url);
  });
  return $.root().html();
};
