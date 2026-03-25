const fs = require('fs');
const cheerio = require('cheerio');

// Load the HTML data from your data.js file
const htmlData = require('./data');

const $ = cheerio.load(htmlData);
const csvData = [];

// Helper function to safely format text for CSV
const formatCSVCell = (text) => {
  const cleanedText = text.replace(/\s+/g, ' ').trim(); 
  if (cleanedText.includes(',') || cleanedText.includes('"')) {
    return `"${cleanedText.replace(/"/g, '""')}"`;
  }
  return cleanedText;
};

// Define the specific column indexes we want to keep 
// 0 = Name, 3 = Arable land, 4 = Pops
const targetColumns = [2, 3, 4];

// Extract the Headers (only for our target columns)
const headers = [];
$('thead th').each((i, el) => {
  if (targetColumns.includes(i)) {
    headers.push(formatCSVCell($(el).text()));
  }
});
csvData.push(headers.join(','));

// Extract the Rows (only for our target columns)
$('tbody tr').each((i, row) => {
  const rowData = [];
  $(row).find('td').each((j, cell) => {
    if (targetColumns.includes(j)) {
      rowData.push(formatCSVCell($(cell).text()));
    }
  });
  
  // Make sure we don't push empty rows
  if (rowData.length > 0) {
    csvData.push(rowData.join(','));
  }
});

// Write the final string to value.csv
const finalCsvString = csvData.join('\n');

fs.writeFile('value.csv', finalCsvString, 'utf8', (err) => {
  if (err) {
    console.error('Error writing to file:', err);
  } else {
    console.log('Success! The file value.csv has been created with only Name, Arable land, and Pops.');
  }
});