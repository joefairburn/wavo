export const generateReducedContent = (data: number[], newSize: number) => {
  const result = [];

  // Process each segment
  for (let i = 0; i < newSize; i++) {
    let sum = 0;
    let validCount = 0;  // Track number of valid values
    // Calculate sum for this position across all segments
    for (let j = 0; j < data.length / newSize; j++) {  // Adjust loop bound
      const index = i + newSize * j;
      if (index < data.length) {  // Check if index is valid
        sum += data[index];
        validCount++;
      }
    }
    result.push(sum / validCount);
  }

  return result;
};
