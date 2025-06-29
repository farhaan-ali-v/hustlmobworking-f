import React, { useState } from 'react';
import { useBlockchainLogger } from './BlockchainLoggerProvider';
import { useWallet } from '@txnlab/use-wallet';

interface AlgorandWalletButtonProps {
  className?: string;
}

const AlgorandWalletButton: React.FC<AlgorandWalletButtonProps> = ({ className = '' }) => {
  const { isWalletConnected, connectWallet, activeAddress } = useBlockchainLogger();
  const { disconnect } = useWallet();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleDisconnect = () => {
    disconnect();
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="relative">
      {isWalletConnected ? (
        <>
          <button
            onClick={toggleDropdown}
            className={`bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center ${className}`}
          >
            <svg 
              className="w-4 h-4 mr-1" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M3 10H21" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            {activeAddress ? `${activeAddress.substring(0, 4)}...${activeAddress.substring(activeAddress.length - 4)}` : 'Connected'}
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-200">
              <div className="px-4 py-2 text-xs text-gray-500">
                Connected to Algorand TestNet
              </div>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={handleDisconnect}
                className="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
              >
                Disconnect Wallet
              </button>
            </div>
          )}
        </>
      ) : (
        <button
          onClick={handleConnect}
          className={`bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center ${className}`}
        >
          <svg 
            className="w-4 h-4 mr-1" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M3 10H21" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default AlgorandWalletButton;