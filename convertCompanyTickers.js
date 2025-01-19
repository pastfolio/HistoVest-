const fs = require("fs");
const path = require("path");

// Path to your current company_tickers.json file
const inputFilePath = path.join(__dirname, "public/data/company_tickers.json");

// Path to the output (converted) company_tickers.json file
const outputFilePath = path.join(__dirname, "public/data/company_tickers_converted.json");

// Read the current JSON file
fs.readFile(inputFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  try {
    const parsedData = JSON.parse(data); // Parse the original JSON
    const convertedData = {};

    // Loop through each entry and transform it
    for (const key in parsedData) {
      const entry = parsedData[key];
      convertedData[entry.ticker] = entry.cik_str.toString().padStart(10, "0"); // Pad CIK with leading zeros
    }

    // Write the converted JSON to the output file
    fs.writeFile(outputFilePath, JSON.stringify(convertedData, null, 2), "utf8", (writeErr) => {
      if (writeErr) {
        console.error("Error writing file:", writeErr);
        return;
      }

      console.log("Conversion completed! Converted file saved at:", outputFilePath);
    });
  } catch (parseErr) {
    console.error("Error parsing JSON:", parseErr);
  }
});
