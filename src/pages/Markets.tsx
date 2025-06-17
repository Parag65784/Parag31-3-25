import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import {
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  Search,
  ChevronRight,
} from 'lucide-react';
import Card3D from '../components/Card3D';
import GradientBorder from '../components/GradientBorder';

interface Market {
  id: string;
  title: string;
  description: string;
  volume: number;
  end_date: string;
  probability: number;
  liquidity: number;
  traders: number;
}

// ✅ Replace with your actual Supabase project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Move supabase client export to top-level scope
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Markets = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

// Move fetchMarkets outside so it's accessible in both useEffects
const fetchMarkets = async () => {
  try {
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .order('end_date', { ascending: true });

    if (error) throw error;

    setMarkets(data as Market[]);
  } catch (error) {
    console.error('Error fetching markets:', error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchMarkets();
}, []);

useEffect(() => {
  const channel = supabase
    .channel('public:markets')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'markets',
      },
      (payload) => {
        console.log('Realtime update:', payload);
        // Refresh the markets list after insert/update/delete
        fetchMarkets();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);


  const filteredMarkets = markets.filter((market) =>
    market.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-casino-black to-casino-purple py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-casino-gold mb-4">
              Prediction Markets
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Trade on your beliefs and earn rewards for being right. Explore our prediction markets.
            </p>
          </div>

          {/* Search and Filter Section */}
          <Card3D className="bg-gradient-to-r from-gray-900 to-casino-purple p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-casino-gold/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-casino-gold"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              <div className="flex gap-2">
                {['all', 'trending', 'ending'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filter === type
                        ? 'bg-casino-gold text-casino-black'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {type === 'all'
                      ? 'All Markets'
                      : type === 'trending'
                      ? 'Trending'
                      : 'Ending Soon'}
                  </button>
                ))}
              </div>
            </div>
          </Card3D>

          {/* Markets Grid */}
          <div className="grid grid-cols-1 gap-6">
            {filteredMarkets.map((market) => (
              <GradientBorder key={market.id} className="p-6 hover:shadow-neon transition-all duration-300">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{market.title}</h3>
                    <p className="text-gray-300 text-sm mb-4">{market.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-800/50 p-3 rounded-lg">
                        <div className="flex items-center text-casino-gold mb-1">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          <span className="text-sm">Volume</span>
                        </div>
                        <span className="text-white font-bold">${Number(market.volume).toLocaleString()}</span>
                      </div>

                      <div className="bg-gray-800/50 p-3 rounded-lg">
                        <div className="flex items-center text-casino-gold mb-1">
                          <Clock className="w-4 h-4 mr-2" />
                          <span className="text-sm">Ends</span>
                        </div>
                        <span className="text-white font-bold">
                          {new Date(market.end_date).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="bg-gray-800/50 p-3 rounded-lg">
                        <div className="flex items-center text-casino-gold mb-1">
                          <DollarSign className="w-4 h-4 mr-2" />
                          <span className="text-sm">Liquidity</span>
                        </div>
                        <span className="text-white font-bold">${Number(market.liquidity).toLocaleString()}</span>
                      </div>

                      <div className="bg-gray-800/50 p-3 rounded-lg">
                        <div className="flex items-center text-casino-gold mb-1">
                          <Users className="w-4 h-4 mr-2" />
                          <span className="text-sm">Traders</span>
                        </div>
                        <span className="text-white font-bold">{market.traders.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center items-center md:items-end gap-4">
                    <div className="text-center md:text-right">
                      <p className="text-sm text-gray-300 mb-1">Current Probability</p>
                      <p className="text-3xl font-bold text-casino-gold">
                        {(Number(market.probability) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <Link
                      to={`/markets/${market.id}`}
                      className="inline-flex items-center px-6 py-3 bg-casino-gold text-casino-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                    >
                      Trade Now
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Link>
                  </div>
                </div>
              </GradientBorder>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Markets;
