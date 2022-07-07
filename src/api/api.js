const got = require('got');
const { JSDOM } = require('jsdom');
const { formatLink, removeEmpty } = require('../func');

const baseUrl = 'https://playoverwatch.com/en-us/career/';
const platform = 'pc';

const battleTags = [
  'soberana-11388',
  'Fisher-11461',
  'MeninoTrovão-1242',
  'DaniCat#11786',
  'RCR-11580',
  'BrianD-11360',
  'Skytter-11608',
  'Martines-1856',
  'stanleyasr-1367',
  'Victimbu-1454',
  'Lore-11213',
  'MysteryMS#1546',
  'Lock-12398',
  'Fukui-11212',
  'uKisuke-1754',
  'VacaMorta-1273',
  'ODIABO-11665',
  'ViNi-12992',
  'umi-11132',
  'Brunolds-1534',
  'Gabumon-11430',
  'SrTonn-11540',
];

const webScrap = async (profileUrl) => {
  const data = {};
  const response = await got(profileUrl, {
    retry: {
      calculateDelay: ({ computedValue }) => computedValue / 10,
    },
  });

  const dom = new JSDOM(response.body);
  const regexCatchRole = /[a-z]+(?=(\sSkill\sRating))/ig;
  const regexCatchRank = /[a-z]+(?=(Tier\.png))/ig;

  data.name = dom.window.document.querySelector('div.masthead-player > h1').textContent;
  const content = [...dom.window.document.querySelectorAll('div.competitive-rank-section')];
  content.splice(0, content.length / 2);
  content
    .filter(removeEmpty)
    .forEach((element) => {
      const { outerHTML } = element.firstElementChild;
      const role = outerHTML.match(regexCatchRole)[0].toLocaleLowerCase();
      const rank = outerHTML.match(regexCatchRank)[0];
      if (!('competitive' in data)) data.competitive = {};
      data.competitive[role] = {
        rank: element.textContent.toLocaleLowerCase(),
        tier: rank,
      };
    });

  return data;
};

const newData = battleTags.map((tag) => webScrap(formatLink(baseUrl, platform, tag)));

module.exports = () => Promise.all(newData);
