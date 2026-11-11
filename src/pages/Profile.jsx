import Header from '../components/layout/Header';
import Card from '../components/shared/Card';

function Profile() {
  return (
    <>
      <Header />
      <Card title="Profile & Settings" icon="user-circle">
        <p style={{ color: 'var(--muted-grey)' }}>
          Profile and settings will be implemented in Milestone 9.
        </p>
      </Card>
    </>
  );
}

export default Profile;
