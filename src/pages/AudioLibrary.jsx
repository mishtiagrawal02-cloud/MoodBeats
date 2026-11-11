import Header from '../components/layout/Header';
import Card from '../components/shared/Card';

function AudioLibrary() {
  return (
    <>
      <Header />
      <Card title="Audio Library" icon="music">
        <p style={{ color: 'var(--muted-grey)' }}>
          Audio library will be implemented in Milestone 7.
        </p>
      </Card>
    </>
  );
}

export default AudioLibrary;
