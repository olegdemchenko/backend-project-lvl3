import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import nock from 'nock';

import downloadPage from '../src/downloadPage.js';
import { formatAssetName, deleteProtocolFromUrl, createPageName } from '../src/utils.js';

let textPage;
let pageWithImage;
let pageWithLocalImage;
let pageWithStyle;
let pageWithLocalStyle;
let style;
let image;
let tempDirPath;

const links = {
  textPage: 'https://textpage.org',
  pageWithAsset: 'https://ru.hexlet.io',
  image: '/assets/professions/nodejs.png',
  style: '/assets/application.css',
  empty: 'https://some-unexisting-page',
};

const getFixturePath = (fixtureName) => path.join(__dirname, '..', '__fixtures__', fixtureName);

beforeAll(async () => {
  nock.disableNetConnect();
  textPage = await fs.readFile(getFixturePath('textpage.html'), 'utf-8');
  pageWithImage = await fs.readFile(getFixturePath('pagewithimage.html'), 'utf-8');
  pageWithLocalImage = await fs.readFile(getFixturePath('pagewithlocalimage.html'), 'utf-8');
  pageWithStyle = await fs.readFile(getFixturePath('pagewithlinks.html'), 'utf-8');
  pageWithLocalStyle = await fs.readFile(getFixturePath('pagewithlocallinks.html'), 'utf-8');
  style = await fs.readFile(getFixturePath('application.css'), 'utf-8');
  image = await fs.readFile(getFixturePath('nodejs.png'), 'utf-8');
});

beforeEach(async () => {
  tempDirPath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

afterAll(() => {
  nock.enableNetConnect();
});

test('testing main functionality', async () => {
  nock(links.textPage)
    .get('/')
    .reply(200, textPage);
  const pagePath = await downloadPage(tempDirPath, links.textPage);
  const downloadedPage = await fs.readFile(pagePath, 'utf-8');
  expect(downloadedPage).toEqual(textPage);
});

test('testing downloading image', async () => {
  nock(links.pageWithAsset)
    .get('/')
    .reply(200, pageWithImage)
    .get(links.image)
    .reply(200, image);
  const pagePath = await downloadPage(tempDirPath, links.pageWithAsset);
  const pageAssetsPath = pagePath.replace('.html', '_files');
  const imageName = formatAssetName(
    deleteProtocolFromUrl(new URL(links.image, links.pageWithAsset).href),
  );
  const imagePath = path.join(pageAssetsPath, imageName);
  const downloadedPage = await fs.readFile(pagePath, 'utf-8');
  const downloadedImage = await fs.readFile(imagePath, 'utf-8');
  expect(downloadedPage).toEqual(pageWithLocalImage);
  expect(downloadedImage).toEqual(image);
});

test('testing downloading styles', async () => {
  nock(links.pageWithAsset)
    .get('/')
    .reply(200, pageWithStyle)
    .get(links.style)
    .reply(200, style)
    .get('/')
    .reply(200, pageWithStyle);
  const pagePath = await downloadPage(tempDirPath, links.pageWithAsset);
  const pageAssetsPath = pagePath.replace('.html', '_files');
  const styleName = formatAssetName(
    deleteProtocolFromUrl(new URL(links.style, links.pageWithAsset).href),
  );
  const stylePath = path.join(pageAssetsPath, styleName);
  const canonicalPageName = createPageName(links.pageWithAsset);
  const canonicalPagePath = path.join(pageAssetsPath, canonicalPageName);
  const downloadedPage = await fs.readFile(pagePath, 'utf-8');
  const downloadedImage = await fs.readFile(stylePath, 'utf-8');
  const downloadedCanonicalPage = await fs.readFile(canonicalPagePath, 'utf-8');
  expect(downloadedPage).toEqual(pageWithLocalStyle);
  expect(downloadedImage).toEqual(style);
  expect(downloadedCanonicalPage).toEqual(pageWithStyle);
});

test('testing error handling', async () => {
  nock(links.empty)
    .get('/')
    .reply(404, 'Not found');
  await expect(downloadPage(tempDirPath, links.empty)).rejects.toThrow();
});
