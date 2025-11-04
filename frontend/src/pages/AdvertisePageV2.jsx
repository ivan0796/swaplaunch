import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Users, BarChart3, Check, Mail, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import HeaderSlim from '../components/HeaderSlim';
import Footer from '../components/Footer';
import { PRICING } from '../config/pricing';
import analytics from '../lib/analytics';

const AdvertisePageV2 = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    tokenName: '',
    tokenUrl: '',
    message: ''
  });

  // Pre-select package from URL
  useEffect(() => {
    const product = searchParams.get('product');
    if (product === 'trending') {
      setSelectedPackage('trending');
    }
  }, [searchParams]);

  const packages = [
    {
      id: 'trending',
      name: 'Trending Boost',
      price: `€${PRICING.trendingBoost7d}`,
      duration: '7 days',
      icon: <Sparkles className="w-8 h-8 text-yellow-500" />,
      badge: 'Beliebt',
      badgeColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      features: [
        'Featured in Trending section',
        '"Promoted" badge on your token',
        '7 days visibility',
        'Social media mention (Twitter/Telegram)',
        'Priority placement in token list'
      ],
      cta: 'Boost Now'
    },
    {
      id: 'social',
      name: 'Social Mention',
      price: PRICING.socialMentionPrice,
      duration: 'One-time',
      icon: <Users className="w-8 h-8 text-blue-500" />,
      features: [
        'Twitter post (10k+ followers)',
        'Telegram channel announcement',
        'Professional content creation',
        'Community engagement',
        'Reach 50k+ users'
      ],
      cta: 'Request Quote'
    },
    {
      id: 'banner',
      name: 'Featured Banner',
      price: PRICING.featuredBannerPrice,
      duration: 'CPC/CPM',
      icon: <BarChart3 className="w-8 h-8 text-purple-500" />,
      features: [
        'Homepage banner placement',
        'CPC (Cost Per Click) or CPM pricing',
        'Detailed analytics dashboard',
        'Custom design support',
        'A/B testing optimization'
      ],
      cta: 'Get Started'
    }
  ];

  const handleOpenInquiry = (packageId) => {
    setSelectedPackage(packageId);
    setShowInquiryModal(true);
    analytics.advertiseInquiryOpen(packageId);
  };

  const handleSubmitInquiry = () => {
    if (!formData.name || !formData.email || !formData.tokenName) {
      toast.error('Please fill required fields');
      return;
    }

    const pkg = packages.find(p => p.id === selectedPackage);
    const subject = encodeURIComponent(`Inquiry: ${pkg?.name} for ${formData.tokenName}`);
    const body = encodeURIComponent(`
Name: ${formData.name}
Email: ${formData.email}
Token Name: ${formData.tokenName}
Token URL: ${formData.tokenUrl || 'N/A'}
Package: ${pkg?.name}

Message:
${formData.message || 'No additional message'}
    `);

    // Option 1: mailto
    const mailtoLink = `mailto:advertise@swaplaunch.app?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;

    // Option 2: Telegram (uncomment if preferred)
    // const telegramLink = `https://t.me/SwapLaunchSupport?text=${body}`;
    // window.open(telegramLink, '_blank');

    toast.success('Opening email client...');
    setShowInquiryModal(false);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      tokenName: '',
      tokenUrl: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <HeaderSlim />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Promote Your Token
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get visibility, attract users, and grow your community with our advertising packages
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 relative ${
                pkg.badge ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''
              }`}
            >
              {/* Badge */}
              {pkg.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`px-4 py-1 rounded-full text-sm font-bold ${pkg.badgeColor}`}>
                    {pkg.badge}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className="flex justify-center mb-4 mt-2">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center">
                  {pkg.icon}
                </div>
              </div>

              {/* Header */}
              <h3 className="text-2xl font-bold text-center mb-2 dark:text-white">
                {pkg.name}
              </h3>
              <div className="text-center mb-2">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {pkg.price}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                {pkg.duration}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                onClick={() => handleOpenInquiry(pkg.id)}
                className={`w-full py-6 text-lg font-semibold ${
                  pkg.badge
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {pkg.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-200">
            Why Advertise on SwapLaunch?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-blue-900 dark:text-blue-200">
            <div>
              <strong className="block mb-2">🎯 Targeted Audience</strong>
              <p>Reach active traders and DeFi enthusiasts looking for new opportunities</p>
            </div>
            <div>
              <strong className="block mb-2">📊 Transparent Metrics</strong>
              <p>Get detailed analytics on impressions, clicks, and engagement</p>
            </div>
            <div>
              <strong className="block mb-2">⚡ Instant Visibility</strong>
              <p>Go live within 24 hours of payment confirmation</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Have questions or need a custom package?
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="mailto:advertise@swaplaunch.app"
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow"
            >
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="dark:text-white">Email Us</span>
            </a>
            <a
              href="https://t.me/SwapLaunchSupport"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow"
            >
              <Send className="w-5 h-5 text-blue-600" />
              <span className="dark:text-white">Telegram</span>
            </a>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <Dialog open={showInquiryModal} onOpenChange={setShowInquiryModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('cta.requestInquiry')}</DialogTitle>
            <DialogDescription>
              Tell us about your project and we'll get back to you within 24 hours
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Your Name *
              </label>
              <Input
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Email *
              </label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Token Name *
              </label>
              <Input
                placeholder="My Token"
                value={formData.tokenName}
                onChange={(e) => setFormData({ ...formData, tokenName: e.target.value })}
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Token URL (Optional)
              </label>
              <Input
                placeholder="https://mytoken.com"
                value={formData.tokenUrl}
                onChange={(e) => setFormData({ ...formData, tokenUrl: e.target.value })}
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Additional Message
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                rows={3}
                placeholder="Any specific requirements..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <Button
              onClick={handleSubmitInquiry}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Inquiry
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdvertisePageV2;
