import {
  importTrainLinesCsv,
  importStationsCsv,
  initStationTable,
  initTrainLineTable,
  initPrefectureLinesTable,
  importPrefectureTrainLines,
  importPrefecturesCsv,
  initPrefectureTable,
} from "./setupTables.js";

const run = async () => {
  await initPrefectureLinesTable();
  await initStationTable();
  await initTrainLineTable();
  await initPrefectureTable();
  await importPrefecturesCsv();
  await importTrainLinesCsv();
  await importStationsCsv();
  await importPrefectureTrainLines();
};

run()
  .then(() => {
    console.log("Batch process completed successfully.");
  })
  .catch((error) => {
    console.error("Batch process failed:", error);
  });
