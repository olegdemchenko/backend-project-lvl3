import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import nock from 'nock';

import downloadPage from '../src';

let template;
let tempDirPath;

const links = {
  wiki: "https://en.wikipedia.org/wiki",
  empty: "https://some-unexisting-page/some-path",
}

beforeAll(async () => {
  nock.disableNetConnect();
  template = await fs.readFile(`${__dirname}/../__fixtures__/wikipedia.html`, 'utf-8');
});

beforeEach(async () => {
  tempDirPath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('testing main functionality', async () => {
  nock(links.wiki)
    .get('/')
    .reply(200, template);
  const pagePath = await downloadPage(tempDirPath, links.wiki);
  const downloadedPage = await fs.readFile(pagePath, 'utf-8');
  expect(downloadedPage).toEqual(template);
});

test('test error handling', async () => {
  nock(links.empty)
    .get('/')
    .reply(404, 'Not found');
  expect(async () => {
    await downloadPage(tempDirPath, links.empty);
  }).toThrow();
});
