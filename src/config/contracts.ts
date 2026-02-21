/**
 * 合约配置
 * Phase 1：TOKEN、PROTOCOL（自建模式，不配置 FLAP_PORTAL）
 */

import type { Address, Abi } from 'viem'
import protocolAbi from '@/abis/CountdownProtocol.abi.json'
import tokenAbi from '@/abis/Token.abi.json'

const useTestnet = import.meta.env.VITE_USE_TESTNET !== 'false'
const BSC_CHAIN_ID = useTestnet ? 97 : 56

export const CONTRACT_ADDRESSES = {
  TOKEN: (import.meta.env.VITE_TOKEN_ADDRESS || '') as Address,
  PROTOCOL: (import.meta.env.VITE_PROTOCOL_ADDRESS || '') as Address,
} as const

export const PROTOCOL_ABI = protocolAbi as Abi
export const TOKEN_ABI = tokenAbi as Abi

export const protocolContractConfig = {
  address: CONTRACT_ADDRESSES.PROTOCOL,
  abi: PROTOCOL_ABI,
  chainId: BSC_CHAIN_ID,
} as const

export const tokenContractConfig = {
  address: CONTRACT_ADDRESSES.TOKEN,
  abi: TOKEN_ABI,
  chainId: BSC_CHAIN_ID,
} as const

export const hasContractAddresses =
  !!CONTRACT_ADDRESSES.PROTOCOL && !!CONTRACT_ADDRESSES.TOKEN

export const BSC_CHAIN_ID_EXPORT = BSC_CHAIN_ID
