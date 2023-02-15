import { PublicUser } from '../user/entities/user.entity';

type Payload = Omit<PublicUser, 'id' | 'username' | 'role' | 'mobile'>;
export default Payload;
