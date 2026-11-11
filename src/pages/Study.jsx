import Header from '../components/layout/Header';
import Card from '../components/shared/Card';

function Study() {
  return (
    <>
      <Header />
      <Card title="Study Session" icon="play-circle">
        <p style={{ color: 'var(--muted-grey)' }}>
          Study workflow will be implemented in Milestone 3.
        </p>
      </Card>
    </>
  );
}

export default Study;
