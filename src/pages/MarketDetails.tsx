import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Clock, DollarSign, Users, ArrowUp, ArrowDown, Info } from 'lucide-react';
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
    // In a real implementation, fetch market data from API
    const fetchMarket = async () => {
      try {
        // Simulated market data
        const sampleMarket: Market = {
          id: '1',
          title: "Will BTC close above $115,000 on May 31st, 2025?",
          description: "This market will resolve to Yes if the price of Bitcoin (BTC) closes above $115,000 on May 31st, 2025.",
          volume: 2500000,
          endDate: "2025-04-30",
          probability: 0.75,
          liquidity: 1200000,
          traders: 1250,
          priceYes: 0.75,
          priceNo: 0.25
        };
        setMarket(sampleMarket);
      } catch (error) {
        console.error('Error fetching market:', error);
        toast.error('Failed to load market data');
      } finally {
        setLoading(false);
      }
    };

    fetchMarket();
  }, [marketId]);

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
      // In a real implementation, this would call your trading API
      toast.success(`Order placed: ${selectedSide.toUpperCase()} ${amount} USDC`);
      setAmount('');
      setSelectedSide(null);
      setEstimatedShares(0);
    } catch (error) {
      console.error('Error placing trade:', error);
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
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center text-casino-gold mb-2">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  <span>Volume</span>
                </div>
                <span className="text-xl font-bold text-white">${market.volume.toLocaleString()}</span>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center text-casino-gold mb-2">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>Ends</span>
                </div>
                <span className="text-xl font-bold text-white">
                  {new Date(market.endDate).toLocaleDateString()}
                </span>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center text-casino-gold mb-2">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span>Liquidity</span>
                </div>
                <span className="text-xl font-bold text-white">${market.liquidity.toLocaleString()}</span>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center text-casino-gold mb-2">
                  <Users className="w-5 h-5 mr-2" />
                  <span>Traders</span>
                </div>
                <span className="text-xl font-bold text-white">{market.traders.toLocaleString()}</span>
              </div>
            </div>

            <GradientBorder className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Choose your prediction</h3>
                  <div className="space-y-4">
                    <button
                      onClick={() => setSelectedSide('yes')}
                      className={`w-full p-4 rounded-lg flex items-center justify-between transition-colors ${
                        selectedSide === 'yes'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <ArrowUp className="w-5 h-5 mr-2" />
                        <span>Yes</span>
                      </div>
                      <span className="font-bold">${market.priceYes.toFixed(2)}</span>
                    </button>

                    <button
                      onClick={() => setSelectedSide('no')}
                      className={`w-full p-4 rounded-lg flex items-center justify-between transition-colors ${
                        selectedSide === 'no'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <ArrowDown className="w-5 h-5 mr-2" />
                        <span>No</span>
                      </div>
                      <span className="font-bold">${market.priceNo.toFixed(2)}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Place your trade</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Amount (USDC)
                      </label>
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
              </div>
            </GradientBorder>
          </Card3D>
        </div>
      </div>
    </div>
  );
};

export default MarketDetails;