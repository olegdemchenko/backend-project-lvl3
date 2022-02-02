import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';

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
  return resource.replace(/[^a-zA-Z0-9]/g, '-');
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
        const name = formatAssetName(deleteProtocolFromUrl(url));
        const assetPath = path.join(assetFolderPath, name);
        return { filePath: assetPath, data };
      });
      return Promise.all(assetsWithPaths.map(({ filePath, data }) => (
        fs.writeFile(filePath, data)
      )));
    })
);
