import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import nock from 'nock';

import downloadPage from '../src/downloadPage.js';

let template;
let tempDirPath;

const links = {
  textPage: 'https://textpage.org',
  empty: 'https://some-unexisting-page',
};

beforeAll(async () => {
  nock.disableNetConnect();
  template = await fs.readFile(`${__dirname}/../__fixtures__/textpage.html`, 'utf-8');
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
    .reply(200, template);
  const pagePath = await downloadPage(tempDirPath, links.textPage);
  const downloadedPage = await fs.readFile(pagePath, 'utf-8');
  expect(downloadedPage).toEqual(template);
});

test('testing error handling', async () => {
  nock(links.empty)
    .get('/')
    .reply(404, 'Not found');
  await expect(downloadPage(tempDirPath, links.empty)).rejects.toThrow();
});
