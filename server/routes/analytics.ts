import { Router } from 'express';
import { GA4Service } from '../services/ga4Service';

const router = Router();
const ga4Service = new GA4Service(process.env.GA4_PROPERTY_ID || '');

router.get('/analytics/metrics', async (req, res) => {
  try {
    const metrics = await ga4Service.getBasicMetrics('7daysAgo', 'today');
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching GA4 metrics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics metrics' });
  }
});

router.get('/analytics/timeseries', async (req, res) => {
  try {
    const data = await ga4Service.getTimeseriesData(7);
    res.json(data);
  } catch (error) {
    console.error('Error fetching GA4 timeseries:', error);
    res.status(500).json({ error: 'Failed to fetch timeseries data' });
  }
});

router.get('/analytics/sources', async (req, res) => {
  try {
    const sources = await ga4Service.getTrafficSources();
    res.json(sources);
  } catch (error) {
    console.error('Error fetching GA4 sources:', error);
    res.status(500).json({ error: 'Failed to fetch traffic sources' });
  }
});

export default router;