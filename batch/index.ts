import {
  importTrainLinesCsv,
  importStationsCsv,
  initStationTable,
  initTrainLineTable,
  initPrefectureLinesTable,
  importPrefectureTrainLines,
} from "./setupTables.js";

const run = async () => {
  await initPrefectureLinesTable();
  await initStationTable();
  await initTrainLineTable();
  await importStationsCsv();
  await importTrainLinesCsv();
  await importPrefectureTrainLines();
};

run()
  .then(() => {
    console.log("Batch process completed successfully.");
  })
  .catch((error) => {
    console.error("Batch process failed:", error);
  });
