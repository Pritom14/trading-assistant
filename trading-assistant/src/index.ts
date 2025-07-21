import express from 'express';
import alertReceiver from './api/alertReceiver';
import getTradeSetups from './api/getTradeSetups';

const app = express();
app.use(express.json());

app.use('/api/tv-alert', alertReceiver);
app.use('/api/trade-setups', getTradeSetups);

// Placeholder: WebSocket server can be initialized here for real-time updates

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Trading Assistant backend running on port ${PORT}`);
}); 