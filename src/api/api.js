const got = require('got');
const { JSDOM } = require('jsdom');
const { formatLink } = require('../func');

const baseUrl = 'https://overwatch.blizzard.com/en-us/career/';

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
  'Pedabliw-1603',
];
const getDom = async (profileUrl) => got(profileUrl, {
  throwHttpErrors: false,
  retry: {
    calculateDelay: ({ computedValue }) => computedValue / 10,
  },
});

const webScrap = async (profileUrl) => {
  const data = {};
  const response = await getDom(profileUrl);
  const dom = new JSDOM(response.body);
  const regexCatchRole = /role\/(.+)-.+\.svg/i;
  const regexCatchRank = /rank\/(.+)Tier-([1-5])-.+\.png/i;

  try {
    data.name = dom.window.document
      .querySelector('div.Profile-player--summaryWrapper > div > h1').textContent;
  } catch (error) {
    data.error = 'PROFILE NOT FOUND';
    data.link = profileUrl;
    data.battleTag = profileUrl.match(/.+\/(.+)$/)[1].replace('-', '#');
    return data;
  }

  const content = [...dom.window.document.querySelectorAll('.Profile-playerSummary--roleWrapper')];
  if (!content.length) {
    try {
      data.link = profileUrl;
      data.battleTag = profileUrl.match(/.+\/(.+)$/)[1].replace('-', '#');
      data.error = dom.window.document
        .querySelector('div.masthead-permission-level-container.u-center-block').textContent;
    } catch (error) {
      data.error = 'Player have no Skill Rating.';
    }
  }
  content
    // .filter(removeEmpty)
    .forEach((element) => {
      const { outerHTML } = element;

      const role = outerHTML.match(regexCatchRole)[1];
      // eslint-disable-next-line no-unused-vars
      const [_, tierName, tierNumber] = outerHTML.match(regexCatchRank);

      if (!('competitive' in data)) data.competitive = {};
      data.competitive[role] = {
        rank: tierNumber,
        tier: tierName,
      };
    });

  return data;
};

const newData = battleTags.map((bTag) => webScrap(formatLink(baseUrl, bTag)));

module.exports = () => Promise.all(newData);
