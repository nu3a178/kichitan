import {
  importTrainLinesCsv,
  importStationsCsv,
  initStationTable,
  initTrainLineTable,
  initPrefectureLinesTable,
  importPrefectureTrainLines,
  importPrefecturesCsv,
  initPrefectureTable,
  initEstateTable,
  importEstatesCsv,
  setGeomIntoEstates,
} from "./setupTables.js";

const run = async () => {
  await initPrefectureLinesTable();
  await initStationTable();
  await initTrainLineTable();
  await initPrefectureTable();
  await initEstateTable();
  await importPrefecturesCsv();
  await importTrainLinesCsv();
  await importStationsCsv();
  await importPrefectureTrainLines();
  await importEstatesCsv();
  await setGeomIntoEstates();
};

run()
  .then(() => {
    console.log("Batch process completed successfully.");
  })
  .catch((error) => {
    console.error("Batch process failed:", error);
  });
