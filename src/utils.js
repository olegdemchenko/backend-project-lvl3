import path from 'path';
import fs from 'fs/promises';

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
      folderName, folderPath,
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
