export const USER_DEFAULT_AVATAR =
  'https://my-blog-store.oss-cn-guangzhou.aliyuncs.com/store/20201103002944_c9ed4.jpeg';

export enum USER_ROLE {
  superAdmin,
  admin,
  dev, // 开发运营测试
  commonUser,
}
export enum USER_STATE {
  invalid,
  valid,
}

export enum ARTICLE_STATE {
  private,
  public,
}

export enum FRIEND_LINK_STATE {
  padding,
  reject,
  resolve,
}

export enum MEMORY_STATUS {
  Public,
  Private,
}

// state和status的区别
// state通常包含多类状态，内部可包含开发状态，维护状态等等；类似vue的reactive
// status则代表单一状态，像下面的项目状态就是单一的

export enum PROJECT_STATUS {
  // 开发中
  Developing,
  // 已完成
  Completed,
  // 已转移
  Transferred,
}

export enum SAYS_VISIBLE_STATUS {
  Public,
  Login,
  Private,
}
