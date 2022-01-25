import path from 'path';

export default (filePath) => {
  const { dir, base } = path.parse(filePath);
  return `${dir.replace(/[^a-zA-Z0-9]/g, '-')}-${base}`;
};
