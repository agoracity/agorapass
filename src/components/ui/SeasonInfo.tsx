'use client'
import { useContract } from '@/utils/hooks/useContract'
import { useEffect, useState } from 'react'

function SeasonInfo() {
  const contract = useContract();
  const [remainingTime, setRemainingTime] = useState('');
  const [progress, setProgress] = useState(0);
  const [seasonInfo, setSeasonInfo] = useState<{ startTimestamp: number, endTimestamp: number } | null>(null);

  useEffect(() => {
    const fetchSeasonInfo = async () => {
      if (!contract) return; // Wait until the contract is ready

      try {
        const currentSeason = await contract.getCurrentSeason();
        if (currentSeason !== null) {
          const fetchedSeasonInfo = await contract.getVouchingSeason(currentSeason);
          if (fetchedSeasonInfo) {
            setSeasonInfo({
              startTimestamp: fetchedSeasonInfo.startTimestamp * 1000,
              endTimestamp: fetchedSeasonInfo.endTimestamp * 1000
            });
          }
        }
      } catch (error) {
        console.error('Error fetching season info:', error);
      }
    };

    fetchSeasonInfo();
  }, [contract]); // Run this effect when the contract becomes available

  useEffect(() => {
    if (!seasonInfo) return;

    const { startTimestamp, endTimestamp } = seasonInfo;
    const totalDuration = endTimestamp - startTimestamp;

    const updateTimeAndProgress = () => {
      const now = new Date().getTime();
      const timeElapsed = now - startTimestamp;
      const timeRemaining = endTimestamp - now;

      // Calculate progress
      const currentProgress = Math.min(100, (timeElapsed / totalDuration) * 100);
      setProgress(currentProgress);

      if (timeRemaining <= 0) {
        setRemainingTime('Season ended');
      } else {
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        setRemainingTime(`${days}d ${hours}h ${minutes}m`);
      }
    };

    updateTimeAndProgress();
    const intervalId = setInterval(updateTimeAndProgress, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, [seasonInfo]);

  return (
    <div className='w-full space-y-2 pb-4'>
      <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
        <div
          className='bg-green-600 h-2.5 rounded-full'
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className='flex justify-between text-sm'>
        <p>Season ends in</p>
        <p>{remainingTime}</p>
      </div>
    </div>
  )
}

export default SeasonInfo
