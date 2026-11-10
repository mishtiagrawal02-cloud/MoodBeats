import Header from '../components/layout/Header';
import Card from '../components/shared/Card';

function Sessions() {
  return (
    <>
      <Header />
      <Card title="Session History" icon="history">
        <p style={{ color: 'var(--muted-grey)' }}>
          Session history will be implemented in Milestone 6.
        </p>
      </Card>
    </>
  );
}

export default Sessions;
