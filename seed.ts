import fs from "fs";
import csv from "csv-parser";
import { Index } from "@upstash/vector";

interface Row {
  text: string;
}

const index = new Index({
  url: "https://hardy-tomcat-15274-us1-vector.upstash.io",
  token:
    "ABYFMGhhcmR5LXRvbWNhdC0xNTI3NC11czFhZG1pbll6QmhaVEEyTkRFdFl6TXhNQzAwTjJOaExXRmpOVEF0T0RFeFpXTTRaamd5TURSbQ==",
});

// Parse CSV file and turn into array
async function parseCSV(filePath: string): Promise<Row[]> {
  return new Promise((resolve, reject) => {
    const rows: Row[] = [];

    fs.createReadStream(filePath)
      .pipe(csv({ separator: "," }))
      .on("data", (row) => {
        rows.push(row);
      })
      .on("error", (err) => {
        reject(err);
      })
      .on("end", () => {
        resolve(rows);
      });
  });
}

const STEP = 30; //batch requests

const seed = async () => {
  const data = await parseCSV("training_dataset.csv");

  for (let i = 0; i < data.length; i += STEP) {
    const chunk = data.slice(i, i + STEP);

    const formatted = chunk.map((row, batchIndex) => ({
      data: row.text,
      id: i + batchIndex,
      metadata: { text: row.text },
    }));

    await index.upsert(formatted);
  }
};

seed();
