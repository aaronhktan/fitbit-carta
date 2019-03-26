// Helper function to create object to be sent over Bluetooth
export function createData(key, value) {
  let data = {
    key: key,
    data: value
  }
  console.log(JSON.stringify(data));
  return data;
}

// Helper function to log errors
export function logError(error) {
  console.log(`Error: ${error.code}`,
              `Message: ${error.message}`);
}