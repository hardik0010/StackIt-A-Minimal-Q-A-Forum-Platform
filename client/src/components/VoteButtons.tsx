import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

interface VoteButtonsProps {
  itemId: string;
  itemType: 'question' | 'answer';
  initialVoteCount: number;
  userVote: 'upvote' | 'downvote' | null;
  onVoteChange?: (newVoteCount: number, newUserVote: 'upvote' | 'downvote' | null) => void;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({
  itemId,
  itemType,
  initialVoteCount,
  userVote,
  onVoteChange
}) => {
  const { isAuthenticated } = useAuth();
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [currentUserVote, setCurrentUserVote] = useState(userVote);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!isAuthenticated) {
      toast.error('Please log in to vote');
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    try {
      const endpoint = itemType === 'question' 
        ? `/api/questions/${itemId}/vote`
        : `/api/answers/${itemId}/vote`;

      const response = await axios.post(endpoint, { voteType });

      if (response.data.success) {
        const item = response.data.data[itemType];
        const newVoteCount = item.voteCount;
        const newUserVote = item.userVote;
        
        setVoteCount(newVoteCount);
        setCurrentUserVote(newUserVote);
        
        if (onVoteChange) {
          onVoteChange(newVoteCount, newUserVote);
        }

        const action = voteType === 'upvote' ? 'upvoted' : 'downvoted';
        toast.success(`Successfully ${action} this ${itemType}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to ${voteType} ${itemType}`;
      toast.error(message);
    } finally {
      setIsVoting(false);
    }
  };

  const getVoteButtonClass = (voteType: 'upvote' | 'downvote') => {
    const baseClass = "flex items-center justify-center w-8 h-8 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500";
    
    if (currentUserVote === voteType) {
      return `${baseClass} bg-blue-500 text-white hover:bg-blue-600`;
    }
    
    return `${baseClass} bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800`;
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      {/* Upvote Button */}
      <button
        onClick={() => handleVote('upvote')}
        disabled={isVoting}
        className={getVoteButtonClass('upvote')}
        title="Upvote"
      >
        <ThumbsUp className="h-4 w-4" />
      </button>

      {/* Vote Count */}
      <span className={`text-sm font-medium ${
        voteCount > 0 ? 'text-green-600' : 
        voteCount < 0 ? 'text-red-600' : 
        'text-gray-500'
      }`}>
        {voteCount}
      </span>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote('downvote')}
        disabled={isVoting}
        className={getVoteButtonClass('downvote')}
        title="Downvote"
      >
        <ThumbsDown className="h-4 w-4" />
      </button>
    </div>
  );
};

export default VoteButtons; 