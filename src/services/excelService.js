import XLSX from 'xlsx';
import fs from 'fs';

/**
 * Excel Service - Handles reading and writing Excel files
 */
class ExcelService {
  /**
   * Read Excel file and return data as array of objects
   * @param {string} filePath - Path to Excel file
   * @returns {Array} Array of row objects
   */
  readExcelFile(filePath) {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Read the workbook
      const workbook = XLSX.readFile(filePath);

      // Get the first worksheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(worksheet);

      console.log(`✓ Successfully read ${data.length} records from Excel file`);
      return data;
    } catch (error) {
      throw new Error(`Failed to read Excel file: ${error.message}`);
    }
  }

  /**
   * Filter records with empty status
   * @param {Array} data - Array of records
   * @returns {Array} Filtered records
   */
  filterEmptyStatus(data) {
    const filtered = data.filter(record => {
      // Check if status is empty, null, undefined, or whitespace
      const status = record.status;
      return !status || status.toString().trim() === '';
    });

    console.log(`✓ Found ${filtered.length} records with empty status`);
    return filtered;
  }

  /**
   * Update a record in the dataset
   * @param {Array} data - Full dataset
   * @param {Object} record - Record to update
   * @param {Object} updates - Fields to update
   */
  updateRecord(data, record, updates) {
    const index = data.findIndex(r =>
      r.email === record.email && r.name === record.name
    );

    if (index !== -1) {
      // Apply updates
      Object.assign(data[index], updates);
    }
  }

  /**
   * Save data back to Excel file
   * @param {string} filePath - Path to Excel file
   * @param {Array} data - Data to save
   */
  saveExcelFile(filePath, data) {
    try {
      // Check if file is locked (open in Excel)
      try {
        const fd = fs.openSync(filePath, 'r+');
        fs.closeSync(fd);
      } catch (error) {
        if (error.code === 'EBUSY' || error.code === 'EPERM') {
          throw new Error('Excel file is open! Please close it and try again.');
        }
      }

      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Write to file
      XLSX.writeFile(workbook, filePath);

      console.log(`✓ Successfully saved updates to Excel file (${data.length} records)`);
    } catch (error) {
      console.error(`✗ Failed to save Excel file: ${error.message}`);
      throw new Error(`Failed to save Excel file: ${error.message}`);
    }
  }

  /**
   * Initialize email_count field if it doesn't exist
   * @param {Array} data - Dataset to initialize
   */
  initializeEmailCount(data) {
    data.forEach(record => {
      if (record.email_count === undefined || record.email_count === null) {
        record.email_count = 0;
      }
    });
  }
}

export default new ExcelService();
