import got, { RetryObject } from 'got';
import { JSDOM } from 'jsdom';
import { ApiDataType, CompetitiveType } from '../types';
import { formatLink, removeEmpty } from '../func';

const baseUrl = 'https://playoverwatch.com/en-us/career/';
const platform = 'pc';

const battleTags = [
  'soberana-11388',
  'Fisher-11461',
  // 'MeninoTrovão-1242',
  // 'DaniCat#11786',
  // 'RCR-11580',
  // 'BrianD-11360',
  // 'Skytter-11608',
  // 'Martines-1856',
  // 'stanleyasr-1367',
  // 'Victimbu-1454',
  // 'Lore-11213',
  // 'MysteryMS#1546',
  // 'Lock-12398',
  // 'Fukui-11212',
  // 'uKisuke-1754',
  // 'VacaMorta-1273',
  // 'ODIABO-11665',
  // 'ViNi-12992',
  // 'umi-11132',
  // 'Brunolds-1534',
  // 'Gabumon-11430',
  // 'SrTonn-11540',
];

const webScrap = async (profileUrl: string): Promise<ApiDataType> => {
  const data: ApiDataType = {};
  const response = await got(profileUrl, {
    retry: {
      calculateDelay: ({ computedValue }: RetryObject) => computedValue / 10,
    },
  });
  // export type RetryFunction = (retryObject: RetryObject) => Promisable<number>;
  const dom = new JSDOM(response.body);
  const regexCatchRole = /[a-z]+(?=(\sSkill\sRating))/ig;
  const regexCatchRank = /[a-z]+(?=(Tier\.png))/ig;

  try {
    data.name = dom.window.document
      .querySelector('div.masthead-player > h1')!.textContent || '';
  } catch (error) {
    data.error = 'PROFILE NOT FOUND';
    data.link = profileUrl;
    data.battleTag = profileUrl.match(/.+\/(.+)$/)![1].replace('-', '#');
    return data;
  }

  const content = [...dom.window.document.querySelectorAll('div.competitive-rank-section')];
  if (!content.length) {
    try {
      data.link = profileUrl;
      data.battleTag = profileUrl.match(/.+\/(.+)$/)![1].replace('-', '#');
      data.error = dom.window.document
        .querySelector('div.masthead-permission-level-container.u-center-block')!.textContent || '';
    } catch (error) {
      data.error = 'Player have no Skill Rating.';
    }
  }

  content.splice(0, content.length / 2);
  content
    .filter(removeEmpty)
    .forEach((element) => {
      const { outerHTML } = element.firstElementChild!;
      const role = outerHTML.match(regexCatchRole)![0].toLocaleLowerCase();
      const rank = outerHTML.match(regexCatchRank)![0];
      if (!('competitive' in data)) data.competitive = {};
      data.competitive![role as keyof CompetitiveType] = {
        rank: +element.textContent!,
        tier: rank,
      };
    });

  return data;
};

const newData = battleTags.map((tag) => webScrap(formatLink(baseUrl, platform, tag)));

export default Promise.all(newData);
