import { H3Event } from 'h3';
import { ServerRequest } from '~/feature/request/sever';
import { createUUID } from '@tool-pack/basic';

export default eventHandler(async (event: H3Event) => {
  const uuidName = 'uuid';
  let uuid = getCookie(event, uuidName);
  if (!uuid) {
    uuid = createUUID();
    setCookie(event, uuidName, uuid, { expires: new Date(2030, 1, 1) });
  }
  ServerRequest.ins.addHeaderOnce([uuidName, uuid]);
});
