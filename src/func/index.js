const sortByHigherSR = (obj) => {
  Object.values(obj)
    .forEach((arr) => arr.sort((a, b) => b.match(/\d{3,4}/g) - a.match(/\d{3,4}/g)));
  return obj;
};

const removeBattleTagsWithErros = (obj) => !obj.error;

const splitNameByClass = (array) => {
  const validBattleTagsList = array.filter(removeBattleTagsWithErros);
  const result = validBattleTagsList.reduce((acc, { name, competitive }) => {
    Object.keys(competitive).forEach((key) => {
      acc[key] = [
        ...acc[key] || '',
        `${competitive[key].rank} ${competitive[key].tier} - ${name}`,
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

const removeEmpty = (element) => !!element.textContent || element.error;

const formatLink = (baseUrl, platform, tag) => `${baseUrl}${platform}/${tag.replace('#', '-')}`;

module.exports = {
  generateFinalTextToTelegram,
  formatLink,
  removeEmpty,
};
