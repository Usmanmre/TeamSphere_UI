import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config";
import { 
  ArrowLeft, 
  Gift, 
  Users, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  Lock,
  CheckCircle,
  AlertCircle,
  Heart,
  TrendingUp,
  Target
} from "lucide-react";
import toast from "react-hot-toast";

const DonationPoolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPoolDetails();
  }, [id]);

  const fetchPoolDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      
      const response = await axios.get(`${BASE_URL}/api/donations/pool/${id}`, {
        headers: { Authorization: `${token}` },
        withCredentials: true,
      });
      setPool(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch pool details");
    } finally {
      setLoading(false);
    }
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, "");
    value = value.replace(/(\d{4})/g, "$1 ").trim();
    setCardDetails(prev => ({ ...prev, cardNumber: value }));
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }
    setCardDetails(prev => ({ ...prev, expiryDate: value }));
  };

  const handleDonation = async (e) => {
    e.preventDefault();
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error("Please enter a valid donation amount");
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/donations/contribute`,
        {
          poolId: id,
          amount: parseFloat(donationAmount),
          paymentMethod: "credit_card",
          cardDetails: {
            last4: cardDetails.cardNumber.slice(-4),
            brand: "visa" // In real app, detect from card number
          }
        },
        {
          headers: { Authorization: `${token}` },
          withCredentials: true,
        }
      );

      toast.success("Thank you for your donation!");
      setShowDonationForm(false);
      setDonationAmount("");
      setCardDetails({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: ""
      });
      
      // Refresh pool details to show updated amount
      fetchPoolDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || "Donation failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading pool details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/donation-pools")}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Back to Pools
          </button>
        </div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">Pool not found</p>
          <button
            onClick={() => navigate("/donation-pools")}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Back to Pools
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/donation-pools")}
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-300" />
              </button>
              <div className="flex items-center gap-3">
                <Gift className="h-8 w-8 text-pink-400" />
                <h1 className="text-2xl font-bold text-white">{pool.title}</h1>
              </div>
            </div>
            <button
              onClick={() => setShowDonationForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-pink-500/25"
            >
              <Heart className="h-5 w-5 inline mr-2" />
              Donate Now
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pool Description */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">About This Campaign</h2>
              <p className="text-gray-300 leading-relaxed text-lg">{pool.description}</p>
            </div>

            {/* Progress Section */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Target className="h-6 w-6 text-pink-400" />
                <h2 className="text-2xl font-bold text-white">Campaign Progress</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Amount Raised</span>
                  <span className="text-2xl font-bold text-yellow-400">
                    ${pool.amount?.toLocaleString() || 0}
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((pool.amount / (pool.targetAmount || 1000)) * 100, 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-400">
                  <span>${pool.amount?.toLocaleString() || 0} raised</span>
                  <span>Goal: ${(pool.targetAmount || 1000).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Recent Donations */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Donations</h2>
              {pool.donations && pool.donations.length > 0 ? (
                <div className="space-y-4">
                  {pool.donations.slice(0, 5).map((donation, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center">
                          <Heart className="h-5 w-5 text-pink-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Anonymous Donor</p>
                          <p className="text-gray-400 text-sm">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-green-400 font-bold">
                        ${donation.amount}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No donations yet. Be the first to contribute!</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Campaign Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Total Raised</p>
                    <p className="text-white font-bold">${pool.amount?.toLocaleString() || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Donors</p>
                    <p className="text-white font-bold">{pool.donations?.length || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Created</p>
                    <p className="text-white font-bold">
                      {new Date(pool.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Donate */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Donate</h3>
              <div className="space-y-3">
                {[10, 25, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setDonationAmount(amount.toString());
                      setShowDonationForm(true);
                    }}
                    className="w-full p-3 bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500/30 rounded-xl text-white hover:from-pink-500/30 hover:to-purple-600/30 transition-all duration-200"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {showDonationForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Make a Donation</h2>
              <button
                onClick={() => setShowDonationForm(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleDonation} className="space-y-6">
              {/* Amount Input */}
              <div>
                <label className="block text-gray-300 mb-2">Donation Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Card Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Card Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={cardDetails.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      value={cardDetails.expiryDate}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">CVV</label>
                    <input
                      type="text"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                      placeholder="123"
                      maxLength="4"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardDetails.cardholderName}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <Lock className="h-5 w-5 text-green-400" />
                <p className="text-green-400 text-sm">
                  Your payment is secured with bank-level encryption
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Heart className="h-5 w-5" />
                    Donate ${donationAmount || "0"}
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationPoolDetail; 