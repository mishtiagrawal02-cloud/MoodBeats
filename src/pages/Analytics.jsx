import Header from '../components/layout/Header';
import Card from '../components/shared/Card';

function Analytics() {
  return (
    <>
      <Header />
      <Card title="Analytics" icon="chart-line">
        <p style={{ color: 'var(--muted-grey)' }}>
          Analytics will be implemented in Milestone 8.
        </p>
      </Card>
    </>
  );
}

export default Analytics;
