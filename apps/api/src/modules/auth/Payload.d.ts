import { PublicUser } from '@blog/entities';

type Payload = Omit<PublicUser, 'id' | 'username' | 'role' | 'mobile'>;
export default Payload;
