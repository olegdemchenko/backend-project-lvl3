import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import nock from 'nock';

import downloadPage from '../src/downloadPage.js';
import { formatAssetName, deleteProtocolFromUrl } from '../src/utils.js';

let textPage;
let pageWithImage;
let pageWithLocalImage;
let image;
let tempDirPath;

const links = {
  textPage: 'https://textpage.org',
  pageWithImage: 'https://ru.hexlet.io',
  image: '/assets/professions/nodejs.png',
  empty: 'https://some-unexisting-page',
};

const getFixturePath = (fixtureName) => path.join(__dirname, '..', '__fixtures__', fixtureName);

beforeAll(async () => {
  nock.disableNetConnect();
  textPage = await fs.readFile(getFixturePath('textpage.html'), 'utf-8');
  pageWithImage = await fs.readFile(getFixturePath('pagewithimage.html'), 'utf-8');
  pageWithLocalImage = await fs.readFile(getFixturePath('pagewithlocalimage.html'), 'utf-8');
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
  nock(links.pageWithImage)
    .get('/')
    .reply(200, pageWithImage)
    .get(links.image)
    .reply(200, image);
  const pagePath = await downloadPage(tempDirPath, links.pageWithImage);
  const pageAssetsPath = pagePath.replace('.html', '_files');
  const imageName = formatAssetName(
    deleteProtocolFromUrl(new URL(links.image, links.pageWithImage).href),
  );
  const imagePath = path.join(pageAssetsPath, imageName);
  const downloadedPage = await fs.readFile(pagePath, 'utf-8');
  const downloadedImage = await fs.readFile(imagePath, 'utf-8');
  expect(downloadedPage).toEqual(pageWithLocalImage);
  expect(downloadedImage).toEqual(image);
});

test('testing error handling', async () => {
  nock(links.empty)
    .get('/')
    .reply(404, 'Not found');
  await expect(downloadPage(tempDirPath, links.empty)).rejects.toThrow();
});
