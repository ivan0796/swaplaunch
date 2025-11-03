import React, { useState, useEffect } from 'react';
import { Star, Search, TrendingUp, DollarSign, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';

const ProjectsPage = () => {
  const [selectedChain, setSelectedChain] = useState(1);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const featuredFee = {
    basic: '$99/month',
    premium: '$199/month',
    enterprise: '$499/month'
  };

  // Mock featured projects
  const featuredProjects = [
    {
      id: 1,
      name: 'Example DeFi',
      description: 'Revolutionary DeFi protocol with 10x yield',
      logo: '🚀',
      category: 'DeFi',
      tvl: '$5M',
      featured: 'premium'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Navbar */}
      <Navbar selectedChain={selectedChain} onChainChange={setSelectedChain} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Get Featured Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 mb-12 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Get Your Project Featured</h2>
              <p className="text-blue-100 mb-4">Reach thousands of traders and investors</p>
              <div className="flex gap-4">
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <div className="text-sm">Basic</div>
                  <div className="font-bold">{featuredFee.basic}</div>
                </div>
                <div className="bg-white/30 rounded-lg px-4 py-2 border-2 border-white">
                  <div className="text-sm">Premium ⭐</div>
                  <div className="font-bold">{featuredFee.premium}</div>
                </div>
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <div className="text-sm">Enterprise</div>
                  <div className="font-bold">{featuredFee.enterprise}</div>
                </div>
              </div>
            </div>
            <Button
              onClick={() => toast.info('Contact us at: featured@swaplaunch.io')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg"
            >
              Apply Now
            </Button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Categories</option>
            <option value="defi">DeFi</option>
            <option value="nft">NFT</option>
            <option value="gaming">Gaming</option>
            <option value="dao">DAO</option>
          </select>
        </div>

        {/* Featured Projects */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Featured Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map(project => (
              <div key={project.id} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-400">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">{project.logo}</div>
                  <div>
                    <h4 className="font-bold text-lg">{project.name}</h4>
                    <div className="text-xs text-gray-500">{project.category}</div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="text-gray-500">TVL</div>
                    <div className="font-bold">{project.tvl}</div>
                  </div>
                  <Button size="sm" className="bg-blue-600">
                    Visit <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Projects */}
        <div>
          <h3 className="text-2xl font-bold mb-4">All Projects</h3>
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500">
            No projects yet. Be the first to get featured!
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;