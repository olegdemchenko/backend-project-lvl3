import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import nock from 'nock';

import downloadPage from '../src/downloadPage';
import { rejects } from 'assert';

let template;
let tempDirPath;

const links = {
  wiki: "https://en.wikipedia.org",
  empty: "https://some-unexisting-page",
}

beforeAll(async () => {
  nock.disableNetConnect();
  template = await fs.readFile(`${__dirname}/../__fixtures__/wikipedia.html`, 'utf-8');
});

beforeEach(async () => {
  tempDirPath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

afterAll(() => {
  nock.enableNetConnect();
})

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
  await expect(downloadPage(tempDirPath, links.empty)).rejects.toThrow();
});

