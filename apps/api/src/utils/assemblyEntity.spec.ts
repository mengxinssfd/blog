import { rawToEntity, rawsToEntities, CommonParams } from './assemblyEntity';

type Raws = Array<{
  params: CommonParams & { raw: any };
  entity: any;
}>;

const users: Raws = [
  {
    params: {
      entityName: 'user',
      raw: { user_name: 'test', user_age: 18 },
    },
    entity: { name: 'test', age: 18 },
  },
  {
    params: {
      entityName: 'user',
      raw: { user_name: 'test', user_age: 18, user_id: 1 },
    },
    entity: { name: 'test', age: 18, id: 1 },
  },
];
const user_articles: Raws = [
  {
    params: {
      entityName: 'article',
      raw: {
        article_title: 'test',
        article_id: 123,
        user_id: 1,
        user_username: 'root',
      },
    },
    entity: {
      title: 'test',
      id: 123,
      user: {
        id: 1,
        username: 'root',
      },
    },
  },
  {
    params: {
      entityName: 'article',
      raw: {
        article_title: 'test',
        article_id: 123,
        user_id: 1,
        user_username: 'root',
      },
    },
    entity: {
      title: 'test',
      id: 123,
      user: {
        id: 1,
        username: 'root',
      },
    },
  },
  {
    params: {
      entityName: 'article',
      raw: {
        article_title: 'test',
        article_id: 123,
        user_id: 1,
        user_username: 'root',
      },
    },
    entity: {
      title: 'test',
      id: 123,
      user: {
        id: 1,
        username: 'root',
      },
    },
  },
];
const raws: Raws = [...users, ...user_articles];

const tag_articles: Raws = [
  {
    params: {
      entityName: 'article',
      raw: {
        article_title: 'test',
        article_id: 123,
        omit: 1231,
        test: 'test',
        tag_name: 'tag1',
      },
    },
    entity: {
      title: 'test',
      id: 123,
      test: 'test',
      tag: [
        {
          name: 'tag1',
        },
        {
          name: 'tag2',
        },
        {
          name: 'tag3',
        },
      ],
    },
  },
  {
    params: {
      entityName: 'article',
      raw: {
        article_title: 'test',
        article_id: 123,
        tag_name: 'tag2',
      },
    },
    entity: 1,
  },
  {
    params: {
      entityName: 'article',
      raw: {
        article_title: 'test',
        article_id: 123,
        tag_name: 'tag3',
      },
    },
    entity: 1,
  },
];

describe('assemblyEntity', () => {
  it('rawToEntity', () => {
    raws.forEach((raw) => {
      const entity = rawToEntity(raw.params);
      expect(entity).toEqual(raw.entity);
    });

    const entity = rawToEntity({
      raw: { test_test: 12312, num: 123 },
      entityName: 'test',
      omitArr: ['test_test', 'num'],
    });
    expect(entity).toEqual({});
    const entity2 = rawToEntity({
      raw: { test_test: '12312', test_num: '888' },
      entityName: 'test',
      valueToNumArr: ['test_test', 'test_num'],
    });
    expect(entity2).toEqual({ test: 12312, num: 888 });
  });

  it('rawsToEntities base', () => {
    const rawList = users.map((i) => i.params.raw);
    const entityList = users.map((i) => i.entity);
    const params = { ...users[0]!.params };
    delete params.raw;
    const entities = rawsToEntities({ rawList, ...params });
    expect(entities).toEqual(entityList);
  });

  it('rawsToEntities many to one', () => {
    const rawList = tag_articles.map((i) => i.params.raw);
    const entityList = [tag_articles[0]!.entity];
    const params = { ...tag_articles[0]!.params };
    delete params.raw;
    const entities = rawsToEntities({
      rawList,
      ...params,
      valueJoinToArr: ['tag'],
      omitArr: ['omit'],
    });
    expect(entities).toEqual(entityList);
  });
});
