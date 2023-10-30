import got from 'got';
import { JSDOM } from 'jsdom';
import { formatLink } from '../func/index';

const baseUrl = 'https://overwatch.blizzard.com/en-us/career/';

const getDom = async (profileUrl) => got(profileUrl, {
  throwHttpErrors: false,
  retry: {
    calculateDelay: ({ computedValue }) => computedValue / 10,
  },
});

const webScrap = async (profileUrl) => {
  const data = { error: null };
  const response = await getDom(profileUrl);
  const dom = new JSDOM(response.body);
  const regexCatchRole = /role\/(.+)-.+\.svg/i;
  const regexCatchRank = /rank\/(.+)Tier-([1-5])-.+\.png/i;

  try {
    data.battleTag = profileUrl.match(/.+\/(.+)$/)[1].replace('-', '#');
    if (+response.statusCode === 404) throw new Error('PROFILE NOT FOUND');
    if (dom.window.document.querySelector('.Profile-player--privateText')) {
      throw new Error('PRIVATE PROFILE');
    }
    data.name = dom.window.document
      .querySelector('div.Profile-player--summaryWrapper > div > h1').textContent;
  } catch (error) {
    data.error = error.message;
    data.link = profileUrl;
    return data;
  }

  const content = [...dom.window.document.querySelectorAll('.Profile-playerSummary--roleWrapper')];
  const isConsolePlayer = dom.window.document
    .querySelector('div.controller-view.Profile-playerSummary--rankWrapper').childElementCount > 0;

  data.name += isConsolePlayer ? ' 🕹' : '';
  data.platform = isConsolePlayer ? 'console' : 'pc';

  if (!content.length) {
    try {
      data.link = profileUrl;
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
const newData = (battleTags) => battleTags.map((obj) => webScrap(formatLink(baseUrl, obj.battle_tag)));

const getProfiles = async (battleTags) => Promise.all(newData(battleTags));

export default getProfiles;
