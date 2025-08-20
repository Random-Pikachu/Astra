const generateRandomCode = ({
    prefix = '',
    length = 8,
    useLowercase = true,
    useUppercase = true,
    useNumbers = false,
    useSpecial = false
  } = {}) => {
    let chars = '';
    if (useLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useNumbers) chars += '0123456789';
    if (useSpecial) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
    // Ensure we have at least one character set
    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';
  
    let result = prefix;
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  
    return result;
  };

module.exports = { generateRandomCode };