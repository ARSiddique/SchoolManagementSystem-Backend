const excelDateToJSDate = (excelDate) => {
  if (typeof excelDate === 'number') {
    return new Date((excelDate - 25569) * 86400 * 1000); // Excel dates start from 1900-01-01
  } else if (typeof excelDate === 'string') {
    const trimmedDate = excelDate.trim();
    if (trimmedDate === '') {
      return null; // Handle empty or whitespace strings
    }
    const parsedNumber = parseFloat(trimmedDate);
    if (!isNaN(parsedNumber)) {
      return new Date((parsedNumber - 25569) * 86400 * 1000);
    }
    const parsedDate = new Date(trimmedDate);
    if (!isNaN(parsedDate)) {
      return parsedDate;
    }
  }
  return null; // Return null for any invalid input
};

module.exports = excelDateToJSDate;
