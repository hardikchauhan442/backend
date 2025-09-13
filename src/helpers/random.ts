const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const capitalCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const generateString = (length: number, capitalOnly = false) => {
  let result = '';
  const charStr = capitalOnly ? capitalCharacters : characters;
  const charactersLength = charStr.length;
  for (let i = 0; i < length; i++) {
    result += charStr.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export { generateString };
