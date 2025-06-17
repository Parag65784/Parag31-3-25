import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  ArrowUp,
  ArrowDown,
  Info
} from 'lucide-react';
import Card3D from '../components/Card3D';
import GradientBorder from '../components/GradientBorder';
import { toast } from 'react-hot-toast';

interface Market {
  id: string;
  title: string;
  description: string;
  volume: number;
  endDate: string;
  probability: number;
  liquidity: number;
  traders: number;
  priceYes: number;
  priceNo: number;
}

const MarketDetails = () => {
  const { marketId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no' | null>(null);
  const [amount, setAmount] = useState('');
  const [estimatedShares, setEstimatedShares] = useState(0);

  useEffect(() => {
    const fetchMarket = async () => {
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .eq('id', marketId)
        .single();

      if (error || !data) {
        toast.error('Market not found');
        navigate('/games');
        return;
      }

      setMarket({
        id: data.id,
        title: data.title,
        description: data.description,
        volume: data.volume,
        endDate: data.end_date,
        probability: data.probability,
        liquidity: data.liquidity,
        traders: data.traders,
        priceYes: data.probability,
        priceNo: 1 - data.probability
      });

      setLoading(false);
    };

    fetchMarket();
  }, [marketId, navigate]);

  const calculateShares = (amount: string, side: 'yes' | 'no') => {
    if (!market || !amount) return 0;
    const price = side === 'yes' ? market.priceYes : market.priceNo;
    return parseFloat(amount) / price;
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (selectedSide) {
      setEstimatedShares(calculateShares(value, selectedSide));
    }
  };

  const handleTrade = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedSide || !amount || !market) {
      toast.error('Please select a side and enter an amount');
      return;
    }

    try {
      const price = selectedSide === 'yes' ? market.priceYes : market.priceNo;
      const shares = parseFloat(estimatedShares.toFixed(4));

      const { error } = await supabase.from('market_bets').insert({
        user_id: user.id,
        market_id: market.id,
        side: selectedSide,
        amount: parseFloat(amount),
        shares,
        price,
        status: 'pending'
      });

      if (error) {
        console.error('Insert error:', error);
        toast.error(`Failed to place trade: ${error.message}`);
        return;
      }

      toast.success(`Trade placed: ${selectedSide.toUpperCase()} $${amount}`);
      setAmount('');
      setSelectedSide(null);
      setEstimatedShares(0);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Failed to place trade');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-casino-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-casino-gold"></div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-casino-black to-casino-purple py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white">Market not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-casino-black to-casino-purple py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card3D className="bg-gradient-to-r from-gray-900 to-casino-purple p-8 mb-8">
            <h1 className="text-3xl font-bold text-casino-gold mb-4">{market.title}</h1>
            <p className="text-gray-300 mb-6">{market.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatBlock icon={<TrendingUp />} label="Volume" value={`$${market.volume.toLocaleString()}`} />
              <StatBlock icon={<Clock />} label="Ends" value={new Date(market.endDate).toLocaleDateString()} />
              <StatBlock icon={<DollarSign />} label="Liquidity" value={`$${market.liquidity.toLocaleString()}`} />
              <StatBlock icon={<Users />} label="Traders" value={market.traders.toLocaleString()} />
            </div>

            <GradientBorder className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <PredictionSelector
                  selectedSide={selectedSide}
                  setSelectedSide={setSelectedSide}
                  market={market}
                />
                <TradeForm
                  amount={amount}
                  handleAmountChange={handleAmountChange}
                  handleTrade={handleTrade}
                  selectedSide={selectedSide}
                  market={market}
                  estimatedShares={estimatedShares}
                />
              </div>
            </GradientBorder>
          </Card3D>
        </div>
      </div>
    </div>
  );
};

const StatBlock = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg">
    <div className="flex items-center text-casino-gold mb-2">
      {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5 mr-2" })}
      <span>{label}</span>
    </div>
    <span className="text-xl font-bold text-white">{value}</span>
  </div>
);

const PredictionSelector = ({
  selectedSide,
  setSelectedSide,
  market
}: {
  selectedSide: 'yes' | 'no' | null,
  setSelectedSide: (side: 'yes' | 'no') => void,
  market: Market
}) => (
  <div>
    <h3 className="text-xl font-semibold text-white mb-4">Choose your prediction</h3>
    <div className="space-y-4">
      {(['yes', 'no'] as const).map((side) => {
        const isActive = selectedSide === side;
        const icon = side === 'yes' ? <ArrowUp /> : <ArrowDown />;
        const price = side === 'yes' ? market.priceYes : market.priceNo;

        return (
          <button
            key={side}
            onClick={() => setSelectedSide(side)}
            className={`w-full p-4 rounded-lg flex items-center justify-between transition-colors ${
              isActive ? (side === 'yes' ? 'bg-green-600 text-white' : 'bg-red-600 text-white') : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center">
              {React.cloneElement(icon, { className: "w-5 h-5 mr-2" })}
              <span>{side === 'yes' ? 'Yes' : 'No'}</span>
            </div>
            <span className="font-bold">${price.toFixed(2)}</span>
          </button>
        );
      })}
    </div>
  </div>
);

const TradeForm = ({
  amount,
  handleAmountChange,
  handleTrade,
  selectedSide,
  market,
  estimatedShares
}: {
  amount: string,
  handleAmountChange: (val: string) => void,
  handleTrade: () => void,
  selectedSide: 'yes' | 'no' | null,
  market: Market,
  estimatedShares: number
}) => (
  <div>
    <h3 className="text-xl font-semibold text-white mb-4">Place your trade</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Amount (USD)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-casino-gold/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-casino-gold"
          placeholder="Enter amount"
          min="1"
          step="0.01"
        />
      </div>

      {selectedSide && amount && (
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center text-casino-gold mb-2">
            <Info className="w-5 h-5 mr-2" />
            <span>Trade Summary</span>
          </div>
          <div className="space-y-2 text-gray-300">
            <div className="flex justify-between">
              <span>Side:</span>
              <span className="font-bold">{selectedSide.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Price:</span>
              <span className="font-bold">
                ${selectedSide === 'yes' ? market.priceYes.toFixed(2) : market.priceNo.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Shares:</span>
              <span className="font-bold">{estimatedShares.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleTrade}
        disabled={!selectedSide || !amount}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
          selectedSide && amount
            ? 'bg-casino-gold text-casino-black hover:bg-yellow-400'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        Place Trade
      </button>
    </div>
  </div>
);

export default MarketDetails;
