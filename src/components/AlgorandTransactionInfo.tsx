import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface AlgorandTransactionInfoProps {
  txId: string | null;
  paymentType: string;
  timestamp: string;
}

const AlgorandTransactionInfo: React.FC<AlgorandTransactionInfoProps> = ({ txId, paymentType, timestamp }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!txId) return null;

  const explorerUrl = `https://testnet.algoexplorer.io/tx/${txId}`;
  const formattedDate = new Date(timestamp).toLocaleString();

  return (
    <div className="mt-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center">
          <svg 
            className="w-4 h-4 mr-2 text-blue-500" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M12 17H12.01" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm font-medium text-blue-700">Blockchain Transaction Info</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-blue-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-blue-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-2 text-sm text-blue-700">
          <p>This payment method was securely logged on the Algorand blockchain.</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-blue-600">Type:</span>
              <span>{paymentType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Timestamp:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Transaction ID:</span>
              <span className="truncate max-w-[150px]">{txId}</span>
            </div>
            <div className="mt-2">
              <a 
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                View on Algorand Explorer
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlgorandTransactionInfo;