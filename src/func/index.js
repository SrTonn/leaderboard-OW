const sortByHigherSR = (obj) => {
  Object.values(obj)
    .forEach((arr) => arr.sort((a, b) => b.match(/\d{3,4}/g) - a.match(/\d{3,4}/g)));
  return obj;
};

const getHigherTierLength = (array) => array.reduce((acc, { competitive }) => {
  const tierLength = Object.keys(competitive).reduce((prev, key) => (
    prev < competitive[key].tier.length ? competitive[key].tier.length : prev), 0);
  return acc < tierLength ? tierLength : acc;
}, 0);

const fill = (item, minLength, char = ' ') => (
  item.length < minLength ? item + char.repeat(minLength - item.length) : item);

const splitNameByClass = (array) => {
  const tierLength = getHigherTierLength(array);
  const result = array.reduce((acc, { name, competitive }) => {
    Object.keys(competitive).forEach((key) => {
      acc[key] = [
        ...acc[key] || '',
        `${competitive[key].rank} ${fill(competitive[key].tier, tierLength)} - ${name}`,
      ];
    });
    return acc;
  }, {});

  return sortByHigherSR(result);
};

const firstLetterUpperCase = (string) => string[0].toUpperCase() + string.slice(1);

const generateFinalTextToTelegram = (data) => {
  let result = '';
  Object.entries(splitNameByClass(data)).forEach((entry) => {
    result += `${firstLetterUpperCase(entry[0])}\n`;
    entry[1].forEach((line) => { result += `${line}\n`; });
    result += '\n';
  });

  return result;
};

module.exports = {
  generateFinalTextToTelegram,
};
