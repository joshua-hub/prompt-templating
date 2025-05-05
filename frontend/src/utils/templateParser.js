/**
 * Parses a template string and extracts the input fields
 * 
 * @param {string} templateContent - The template content string
 * @returns {Array} Array of input field objects with title and description
 */
export const parseTemplate = (templateContent) => {
  const inputFieldPattern = /#############\s*title:\s*([^\n]+)\s*description:\s*([^#]+)\s*#############/g;
  const inputFields = [];
  let match;
  
  while ((match = inputFieldPattern.exec(templateContent)) !== null) {
    inputFields.push({
      id: `field-${inputFields.length + 1}`,
      title: match[1].trim(),
      description: match[2].trim()
    });
  }
  
  return inputFields;
};

/**
 * Fills a template with user input values
 * 
 * @param {string} templateContent - The template content
 * @param {Object} inputValues - Object with field IDs as keys and user inputs as values
 * @returns {string} The filled template with user inputs
 */
export const fillTemplate = (templateContent, inputValues) => {
  // First, parse the template to get the field IDs and their positions
  const inputFields = parseTemplate(templateContent);
  let filledTemplate = templateContent;
  
  // Replace each input field section with the user's value
  inputFields.forEach((field, index) => {
    const fieldId = field.id;
    const userValue = inputValues[fieldId] || '';
    
    const fieldPattern = new RegExp(
      `#############\\s*title:\\s*${escapeRegExp(field.title)}\\s*description:\\s*${escapeRegExp(field.description)}\\s*#############`, 'g'
    );
    
    filledTemplate = filledTemplate.replace(fieldPattern, userValue);
  });
  
  return filledTemplate;
};

/**
 * Escapes special characters in a string for use in a regular expression
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
} 