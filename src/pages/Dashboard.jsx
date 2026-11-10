import Header from '../components/layout/Header';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';

function Dashboard() {
  return (
    <>
      <Header />
      <Card title="Dashboard" icon="th-large">
        <p style={{ color: 'var(--muted-grey)', marginBottom: 'var(--space-lg)' }}>
          Dashboard view coming soon in Milestone 5.
        </p>
        <Button variant="primary" icon="chart-line">
          View Analytics
        </Button>
      </Card>
    </>
  );
}

export default Dashboard;
