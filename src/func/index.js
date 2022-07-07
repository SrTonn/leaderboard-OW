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

const addASCIICharacters = (data) => {
  const allRole = Object.keys(data);
  const result = JSON.parse(JSON.stringify(data));
  allRole.forEach((role) => {
    result[role] = data[role].reduce((acc, line, index, array) => {
      const regexCatchRole = /(?<=\d{4}\s)\w*\s*/g;
      const currentRole = line.match(regexCatchRole)[0].trim();
      const nextLine = array[index + 1];
      const afterLine = array[index - 1];
      const afterRole = afterLine && afterLine.match(regexCatchRole)[0].trim();
      const lineWithoutRole = line.replace(regexCatchRole, '');

      if (index === 0) return [...acc, `╔ ${currentRole}`, `╚ ${lineWithoutRole}`];

      if (!nextLine) {
        if (afterRole !== currentRole) return [...acc, `╔ ${currentRole}`, `╚ ${lineWithoutRole}`];

        return [...acc, `╚ ${lineWithoutRole}`];
      }

      const nextRole = nextLine.match(regexCatchRole)[0].trim();

      if (currentRole !== nextRole && currentRole === afterRole) {
        return [...acc, `╚ ${lineWithoutRole}`];
      }

      if (afterRole !== currentRole && currentRole !== nextRole) {
        return [...acc, `╔ ${currentRole}`, `╚ ${lineWithoutRole}`];
      }

      if (afterRole !== currentRole) return [...acc, `╔ ${currentRole}`, `╠ ${lineWithoutRole}`];

      return [...acc, `╠ ${lineWithoutRole}`];
    }, []);
  });

  return result;
};

const generateFinalTextToTelegram = (data) => {
  let result = '';
  Object.entries(addASCIICharacters(splitNameByClass(data))).forEach((entry) => {
    const playersLength = entry[1].length - entry[1].join('\n').match(/╔/g).length;
    result += `${firstLetterUpperCase(entry[0])} (${playersLength})\n`;
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
