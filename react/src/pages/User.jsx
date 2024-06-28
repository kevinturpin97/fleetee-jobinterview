import { useOutlet } from 'react-router-dom'
import UserProfile from '../elements/User/UserProfile';
import UserProvider from '../providers/UserProvider';

export default function User() {
  const outlet = useOutlet();

  return (
    <UserProvider>
      {outlet || <UserProfile />}
    </UserProvider>
  );
}
