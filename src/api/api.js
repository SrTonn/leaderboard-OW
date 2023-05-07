import got from 'got';
import { JSDOM } from 'jsdom';
import { formatLink } from '../func/index.js';

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
  'Victimbu-1454',
  'Lore-11213',
  'MysteryMS#1546',
  'Lock-12398',
  'Fukui-11212',
  'uKisuke-1754',
  'VacaMorta-1273',
  'ODIABO-11665',
  'umi-11132',
  'Brunolds-1534',
  'Gabumon-11430',
  'Pedabliw-1603',
  'Padfoot#21239',
  'Electrahrt#1736',
  'Vash#12573',
  'LiteraGame#1198',
  'HuGoldn#1382',
  'Merida#11161',
  'M4C0NH4#11350',
  'Luna#19298',
  'padim#11711',
  'Ceiff#1430',
  'Freytas#1452',
  'lunguinho#1467',
  'Zoro#12514',
  'ratothc#1926',
  'weiss#11297',
  'Pindola#1203',
  'gokumaku#2752',
  'Souzaleo#1769',
  'ToThoshi#1105',
  'Fefeu#11298',
  'LInk#14597',
  'Rick#24285',
  'Temperator#1616',
  'Dronxz#1586', // private profile
  'Kiba00K7#1728', // CONSOLE PLAYER
  'SrTonn-11540',
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
    if (+response.statusCode === 404) throw new Error('PROFILE NOT FOUND');
    if (dom.window.document.querySelector('.Profile-player--privateText')) {
      throw new Error('PRIVATE PROFILE');
    }
    data.name = dom.window.document
      .querySelector('div.Profile-player--summaryWrapper > div > h1').textContent;
  } catch (error) {
    data.error = error.message;
    data.link = profileUrl;
    data.battleTag = profileUrl.match(/.+\/(.+)$/)[1].replace('-', '#');
    return data;
  }

  const content = [...dom.window.document.querySelectorAll('.Profile-playerSummary--roleWrapper')];
  const isConsolePlayer = dom.window.document
    .querySelector('div.controller-view.Profile-playerSummary--rankWrapper').childElementCount > 0;

  data.name += isConsolePlayer ? ' 🕹' : '';

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

const getProfiles = async () => Promise.all(newData);

export default getProfiles;
