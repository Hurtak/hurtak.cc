import fs from "fs-extra";
import path from "path";
import { sortBy, cloneDeep } from "lodash";

const pathArticles = path.join(__dirname, "../../articles/published");

function dateStringToDate(dateString) {
  const [date, time] = dateString.split(" ");
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes, seconds] = time.split(":").map(Number);

  return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
}

function parseMetadata(metadata) {
  return metadata.map(m => {
    m.dateLastUpdate = dateStringToDate(m.dateLastUpdate);
    m.datePublication = dateStringToDate(m.datePublication);

    return m;
  });
}

export default async function getPosts() {
  const articlesList = await fs.readdir(pathArticles);

  let metadata = articlesList
    .map(articleFolder => path.join(pathArticles, articleFolder))
    // TODO: Make this async.
    .filter(fullPathFolder => fs.lstatSync(fullPathFolder).isDirectory())
    .map(fullPathFolder => path.join(fullPathFolder, "article.js"))
    .map(articleFilePath => require(articleFilePath).default)
    .map(article => article.metadata);

  metadata = cloneDeep(metadata);

  metadata = parseMetadata(metadata);
  metadata = sortBy(metadata, "dateLastUpdate");
  metadata = metadata.reverse();

  // TODO: remove articles that are in the future

  return metadata;
}
