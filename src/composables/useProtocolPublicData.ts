/**
 * useProtocolPublicData
 * 读取主合约链上数据：倒计时、奖池、轮次、参与人数、用户爆率等
 */

import { useReadContract } from 'wagmi'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'
import {
  protocolContractConfig,
  tokenContractConfig,
  hasContractAddresses,
} from '@/config/contracts'

/** 协议公开数据 */
export interface ProtocolPublicData {
  countdown: number
  prizePoolBNB: string
  currentRound: number
  participantCount: number
  userRate: number
  userBalance: string
  tokenDecimals: number
  isLoading: boolean
  refetch: () => void
}

export function useProtocolPublicData(): ProtocolPublicData {
  const { address } = useAccount()

  const { data: countdownData, refetch: refetchCountdown } = useReadContract({
    ...protocolContractConfig,
    functionName: 'countdown',
  })
  const { data: prizePoolData, refetch: refetchPrizePool } = useReadContract({
    ...protocolContractConfig,
    functionName: 'prizePoolBNB',
  })
  const { data: currentRoundData, refetch: refetchRound } = useReadContract({
    ...protocolContractConfig,
    functionName: 'currentRound',
  })
  const { data: participantData, refetch: refetchParticipant } = useReadContract({
    ...protocolContractConfig,
    functionName: 'getParticipantCount',
  })

  const { data: userRateData, refetch: refetchUserRate } = useReadContract({
    ...protocolContractConfig,
    functionName: 'userRate',
    args: address ? [address] : undefined,
  })

  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    ...tokenContractConfig,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const { data: decimalsData } = useReadContract({
    ...tokenContractConfig,
    functionName: 'decimals',
  })

  const refetch = () => {
    refetchCountdown()
    refetchPrizePool()
    refetchRound()
    refetchParticipant()
    refetchUserRate()
    refetchBalance()
  }

  const countdown = countdownData !== undefined && countdownData !== null ? Number(countdownData) : 0
  const prizePoolBNB = prizePoolData !== undefined && prizePoolData !== null ? formatEther(prizePoolData as bigint) : '0'
  const currentRound = currentRoundData !== undefined ? Number(currentRoundData) : 1
  const participantCount = participantData !== undefined ? Number(participantData) : 0
  const userRate = userRateData !== undefined ? Number(userRateData) : 0
  const userBalance = balanceData !== undefined && balanceData !== null ? formatEther(balanceData as bigint) : '0'
  const tokenDecimals = decimalsData !== undefined ? Number(decimalsData) : 18

  const isLoading =
    hasContractAddresses &&
    (countdownData === undefined ||
      prizePoolData === undefined ||
      currentRoundData === undefined)

  return {
    countdown,
    prizePoolBNB,
    currentRound,
    participantCount,
    userRate,
    userBalance,
    tokenDecimals,
    isLoading,
    refetch,
  }
}
