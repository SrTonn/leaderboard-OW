const sortByHigherSR = (obj) => {
  // eslint-disable-next-line max-len
  const ranks = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster', 'top500'];
  Object.values(obj)
    .forEach((arr) => {
      arr.sort((a, b) => {
        const [aTier, aRank] = a.split(' ');
        const [bTier, bRank] = b.split(' ');
        if (bTier === aTier) return aRank - bRank;
        return ranks.indexOf(bTier) - ranks.indexOf(aTier);
      });
    });

  return obj;
};

const removeBattleTagsWithErros = (obj) => !obj.error;

const splitNameByClass = (array) => {
  const validBattleTagsList = array.filter(removeBattleTagsWithErros);
  console.log('validBattleTagsList=>', validBattleTagsList);
  const result = validBattleTagsList.reduce((acc, { name, competitive }) => {
    console.log('competitive=>', competitive);
    Object.keys(competitive).forEach((key) => {
      acc[key] = [
        ...acc[key] || '',
        `${competitive[key].tier.toLowerCase()} ${competitive[key].rank} - ${name}`,
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
      const regexCatchRole = /\w+(?=(\s\d{1}))/g;
      const currentRole = line.match(regexCatchRole)[0].trim();
      const nextLine = array[index + 1];
      const beforeLine = array[index - 1];
      const beforeRole = beforeLine && beforeLine.match(regexCatchRole)[0].trim();
      const lineWithoutRole = line.replace(regexCatchRole, '').trim();

      if (index === 0) {
        const nextRole = nextLine.match(regexCatchRole)[0].trim();
        const charASCII = nextRole === currentRole ? '╠' : '╚';
        return [...acc, `╔ ${currentRole}`, `${charASCII} ${lineWithoutRole}`];
      }

      if (!nextLine) {
        if (beforeRole !== currentRole) return [...acc, `╔ ${currentRole}`, `╚ ${lineWithoutRole}`];

        return [...acc, `╚ ${lineWithoutRole}`];
      }

      const nextRole = nextLine.match(regexCatchRole)[0].trim();

      if (currentRole !== nextRole && currentRole === beforeRole) {
        return [...acc, `╚ ${lineWithoutRole}`];
      }

      if (beforeRole !== currentRole && currentRole !== nextRole) {
        return [...acc, `╔ ${currentRole}`, `╚ ${lineWithoutRole}`];
      }

      if (beforeRole !== currentRole) return [...acc, `╔ ${currentRole}`, `╠ ${lineWithoutRole}`];

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

const formatLink = (baseUrl, tag) => `${baseUrl}${tag.replace('#', '-')}`;

export {
  generateFinalTextToTelegram,
  formatLink,
  removeEmpty,
};
