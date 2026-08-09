import {
  TransactionHash,
  TransactionStatus,
  ExecutionResult,
  GenLayerTransaction,
  transactionsStatusNumberToName,
  transactionResultNumberToName,
  executionResultNumberToName,
} from 'genlayer-js/types';
import { readClient, fetchClaim, fetchAssessment, fetchLatestAssessment, fetchClaims } from './genlayer';
import { chainInfo, getContractConfig } from './config';
import { walletManager } from './wallet';
import { ClaimRecord, AssessmentRecord, getErrorMessage } from './types';

export type TxStage =
  | 'idle'
  | 'validating'
  | 'provider_selection'
  | 'signing'
  | 'submitted'
  | 'pending_consensus'
  | 'finalized'
  | 'execution_success'
  | 'reading_back'
  | 'success'
  | 'rejected_signature'
  | 'chain_error'
  | 'submission_failure'
  | 'receipt_timeout'
  | 'non_finalized'
  | 'consensus_disagreement'
  | 'execution_error'
  | 'readback_failed'
  | 'provider_changed';

export interface RegisterExpectedBinding {
  source_url: string;
  exact_claim_text: string;
  official_result_id: string;
  official_commit: string;
  byte_start: string;
  byte_end: string;
  supersedes_claim_id: string;
}

export interface AssessExpectedBinding {
  claim_id: string;
  official_result_id: string;
  official_commit: string;
  byte_start: string;
  byte_end: string;
}

export type PendingExpectedBinding = RegisterExpectedBinding | AssessExpectedBinding;

export interface PendingOperation {
  version: 2;
  txHash: TransactionHash;
  operationKind: 'register_claim' | 'assess_claim' | 'request_reassessment';
  chainId: number;
  contractAddress: `0x${string}`;
  account: `0x${string}`;
  expectedBinding: PendingExpectedBinding;
  timestamp: number;
}

const STORAGE_KEY = 'benchmark_claim_proof_pending_op_v2';

const DECIMAL_REGEX = /^(0|[1-9][0-9]*)$/;
const ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/;
const ZERO_ADDRESS_REGEX = /^0x0{40}$/i;
const COMMIT_REGEX = /^[0-9a-f]{40}$/;
const RESULT_ID_REGEX = /^6\.0-[0-9]{4}$/;
const HASH_REGEX = /^0x[0-9a-fA-F]{64}$/;

export function validateTransactionHash(hash: string): TransactionHash {
  const clean = hash.trim();
  if (!HASH_REGEX.test(clean)) {
    throw new Error('Invalid transaction hash format. Must be 0x followed by 64 hexadecimal characters.');
  }
  return clean as TransactionHash;
}

export function normalizeSourceUrl(url: string): string {
  if (typeof url !== 'string' || url.length === 0 || url.length > 2048) {
    throw new Error('Invalid source URL length.');
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid source URL format.');
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('Source URL must use HTTPS.');
  }

  if (parsed.username || parsed.password) {
    throw new Error('Source URL must not include credentials.');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost')) {
    throw new Error('Source URL must not use localhost.');
  }

  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':') || hostname.startsWith('[') || hostname.endsWith(']')) {
    throw new Error('Source URL must not use IP literals.');
  }

  if (parsed.port && parsed.port !== '443') {
    throw new Error('Source URL must not specify non-443 ports.');
  }

  const path = parsed.pathname || '/';
  const query = parsed.search || '';
  const normalized = `https://${hostname}${path}${query}`;

  if (normalized.length > 2048) {
    throw new Error('Normalized source URL exceeds 2048 characters.');
  }

  return normalized;
}

export function savePendingOperation(op: PendingOperation): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(op));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('benchmark_claim_proof:pending_op_updated', { detail: op }));
    }
  } catch {
    // Ignored
  }
}

export function loadPendingOperation(): PendingOperation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    const r = parsed as Record<string, unknown>;

    if (r.version !== 2) return null;
    if (typeof r.txHash !== 'string' || !HASH_REGEX.test(r.txHash)) return null;
    if (r.chainId !== chainInfo.id) return null;
    if (typeof r.contractAddress !== 'string' || !ADDRESS_REGEX.test(r.contractAddress) || ZERO_ADDRESS_REGEX.test(r.contractAddress)) return null;
    if (typeof r.account !== 'string' || !ADDRESS_REGEX.test(r.account) || ZERO_ADDRESS_REGEX.test(r.account)) return null;
    if (typeof r.timestamp !== 'number' || !Number.isSafeInteger(r.timestamp) || r.timestamp <= 0) return null;

    const opKind = r.operationKind;
    if (opKind !== 'register_claim' && opKind !== 'assess_claim' && opKind !== 'request_reassessment') {
      return null;
    }

    if (!r.expectedBinding || typeof r.expectedBinding !== 'object' || Array.isArray(r.expectedBinding)) {
      return null;
    }
    const exp = r.expectedBinding as Record<string, unknown>;

    if (opKind === 'register_claim') {
      const expectedKeys = ['source_url', 'exact_claim_text', 'official_result_id', 'official_commit', 'byte_start', 'byte_end', 'supersedes_claim_id'];
      if (Object.keys(exp).length !== expectedKeys.length) return null;
      if (typeof exp.source_url !== 'string' || !exp.source_url.trim()) return null;
      if (typeof exp.exact_claim_text !== 'string' || !exp.exact_claim_text.trim()) return null;
      if (typeof exp.official_result_id !== 'string' || !RESULT_ID_REGEX.test(exp.official_result_id)) return null;
      if (typeof exp.official_commit !== 'string' || !COMMIT_REGEX.test(exp.official_commit)) return null;
      if (typeof exp.byte_start !== 'string' || !DECIMAL_REGEX.test(exp.byte_start)) return null;
      if (typeof exp.byte_end !== 'string' || !DECIMAL_REGEX.test(exp.byte_end)) return null;
      if (typeof exp.supersedes_claim_id !== 'string' || !DECIMAL_REGEX.test(exp.supersedes_claim_id)) return null;

      return {
        version: 2,
        txHash: r.txHash as TransactionHash,
        operationKind: 'register_claim',
        chainId: r.chainId,
        contractAddress: r.contractAddress as `0x${string}`,
        account: r.account as `0x${string}`,
        expectedBinding: exp as unknown as RegisterExpectedBinding,
        timestamp: r.timestamp,
      };
    } else {
      const expectedKeys = ['claim_id', 'official_result_id', 'official_commit', 'byte_start', 'byte_end'];
      if (Object.keys(exp).length !== expectedKeys.length) return null;
      if (typeof exp.claim_id !== 'string' || !DECIMAL_REGEX.test(exp.claim_id)) return null;
      if (typeof exp.official_result_id !== 'string' || !RESULT_ID_REGEX.test(exp.official_result_id)) return null;
      if (typeof exp.official_commit !== 'string' || !COMMIT_REGEX.test(exp.official_commit)) return null;
      if (typeof exp.byte_start !== 'string' || !DECIMAL_REGEX.test(exp.byte_start)) return null;
      if (typeof exp.byte_end !== 'string' || !DECIMAL_REGEX.test(exp.byte_end)) return null;

      return {
        version: 2,
        txHash: r.txHash as TransactionHash,
        operationKind: opKind,
        chainId: r.chainId,
        contractAddress: r.contractAddress as `0x${string}`,
        account: r.account as `0x${string}`,
        expectedBinding: exp as unknown as AssessExpectedBinding,
        timestamp: r.timestamp,
      };
    }
  } catch {
    return null;
  }
}

export function clearPendingOperation(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('benchmark_claim_proof:pending_op_updated', { detail: null }));
    }
  } catch {
    // Ignored
  }
}

export async function verifyAndReadbackRecord(
  op: PendingOperation,
  recordIdStr: string
): Promise<{ recordId: string; data: ClaimRecord | AssessmentRecord }> {
  const recordId = BigInt(recordIdStr);

  if (op.operationKind === 'register_claim') {
    const claim = await fetchClaim(recordId);
    const exp = op.expectedBinding as RegisterExpectedBinding;

    const normalizedSubmitted = normalizeSourceUrl(exp.source_url);
    if (claim.source_url !== normalizedSubmitted) {
      throw new Error(`Readback mismatch on source_url: expected '${normalizedSubmitted}', got '${claim.source_url}'.`);
    }
    if (claim.exact_claim_text !== exp.exact_claim_text.trim()) {
      throw new Error('Readback mismatch on exact_claim_text.');
    }
    if (claim.official_result_id !== exp.official_result_id) {
      throw new Error('Readback mismatch on official_result_id.');
    }
    if (claim.official_commit !== exp.official_commit.toLowerCase()) {
      throw new Error('Readback mismatch on official_commit.');
    }
    if (claim.byte_start !== exp.byte_start) {
      throw new Error('Readback mismatch on byte_start.');
    }
    if (claim.byte_end !== exp.byte_end) {
      throw new Error('Readback mismatch on byte_end.');
    }
    if (claim.supersedes_claim_id !== exp.supersedes_claim_id) {
      throw new Error('Readback mismatch on supersedes_claim_id.');
    }
    if (claim.registrant.toLowerCase() !== op.account.toLowerCase()) {
      throw new Error('Readback mismatch: registrant address does not match submitting account.');
    }

    return { recordId: recordIdStr, data: claim };
  } else {
    const assessment = await fetchAssessment(recordId);
    const exp = op.expectedBinding as AssessExpectedBinding;

    if (assessment.claim_id !== exp.claim_id) {
      throw new Error('Readback mismatch on claim_id.');
    }
    if (assessment.official_result_id !== exp.official_result_id) {
      throw new Error('Readback mismatch on assessment official_result_id.');
    }
    if (assessment.official_commit !== exp.official_commit.toLowerCase()) {
      throw new Error('Readback mismatch on assessment official_commit.');
    }
    if (assessment.byte_start !== exp.byte_start) {
      throw new Error('Readback mismatch on assessment byte_start.');
    }
    if (assessment.byte_end !== exp.byte_end) {
      throw new Error('Readback mismatch on assessment byte_end.');
    }
    if (assessment.assessor.toLowerCase() !== op.account.toLowerCase()) {
      throw new Error('Readback mismatch: assessor address does not match submitting account.');
    }

    return { recordId: recordIdStr, data: assessment };
  }
}

async function recoverFinalizedWriteRecord(
  op: PendingOperation
): Promise<{ recordId: string; data: ClaimRecord | AssessmentRecord }> {
  const isFresh = (createdAt: string) => {
    const createdMs = Date.parse(createdAt);
    return Number.isFinite(createdMs) && createdMs >= op.timestamp - 60_000;
  };

  if (op.operationKind !== 'register_claim') {
    const exp = op.expectedBinding as AssessExpectedBinding;
    const latest = (await fetchLatestAssessment(BigInt(exp.claim_id))).latest_attempt;
    if (!latest || !isFresh(latest.created_at)) {
      throw new Error('No fresh on-chain assessment matches the finalized transaction.');
    }
    return verifyAndReadbackRecord(op, latest.id);
  }

  const probe = await fetchClaims(0n, 1);
  const total = BigInt(probe.total);
  if (total === 0n) {
    throw new Error('No on-chain claim matches the finalized transaction.');
  }
  const start = total > 20n ? total - 20n : 0n;
  const recent = await fetchClaims(start, 20);
  for (const claim of [...recent.items].reverse()) {
    if (!isFresh(claim.created_at)) continue;
    try {
      return await verifyAndReadbackRecord(op, claim.id);
    } catch {
      // Continue through the bounded recent window until the exact binding matches.
    }
  }
  throw new Error('No fresh on-chain claim matches the finalized transaction.');
}

export async function processTransactionFinalityAndReadback(
  txHash: TransactionHash,
  pendingOp: PendingOperation,
  onStageChange: (stage: TxStage, errorMsg?: string) => void,
  checkAborted?: () => boolean
): Promise<{ recordId: string; data: ClaimRecord | AssessmentRecord }> {
  const activeConfig = getContractConfig();
  if (txHash.toLowerCase() !== pendingOp.txHash.toLowerCase()) {
    throw new Error('Pending transaction hash mismatch.');
  }
  if (pendingOp.chainId !== chainInfo.id) {
    throw new Error('Pending transaction chain mismatch.');
  }
  if (
    activeConfig.status !== 'configured' ||
    activeConfig.address.toLowerCase() !== pendingOp.contractAddress.toLowerCase()
  ) {
    throw new Error('Pending transaction contract does not match the configured deployment.');
  }

  onStageChange('pending_consensus');

  let receipt: GenLayerTransaction;
  try {
    receipt = await readClient.waitForTransactionReceipt({
      hash: txHash,
      status: TransactionStatus.FINALIZED,
      interval: 2000,
      retries: 60,
    });
  } catch (err: unknown) {
    if (checkAborted?.()) {
      throw new Error('Active workflow aborted.');
    }
    onStageChange('receipt_timeout', 'Consensus finalization timed out or receipt unavailable.');
    throw new Error(`Receipt timeout: ${getErrorMessage(err)}`);
  }

  if (checkAborted?.()) {
    throw new Error('Active workflow aborted.');
  }

  if (!receipt) {
    onStageChange('receipt_timeout', 'Transaction receipt is unavailable.');
    throw new Error('Receipt unavailable.');
  }

  const statusName = receipt.statusName ?? (
    typeof receipt.status === 'number'
      ? transactionsStatusNumberToName[String(receipt.status) as keyof typeof transactionsStatusNumberToName]
      : receipt.status
  );
  if (statusName !== TransactionStatus.FINALIZED) {
    onStageChange('non_finalized', `Transaction status is '${statusName || String(receipt.status)}'; expected 'FINALIZED'.`);
    throw new Error(`Non-finalized status: ${statusName || String(receipt.status)}`);
  }
  onStageChange('finalized');

  const receiptResultName = receipt.resultName ?? (
    receipt.result === undefined
      ? undefined
      : transactionResultNumberToName[String(receipt.result) as keyof typeof transactionResultNumberToName]
  );
  const receiptExecutionResultName = receipt.txExecutionResultName ?? (
    receipt.txExecutionResult === undefined
      ? undefined
      : executionResultNumberToName[String(receipt.txExecutionResult) as keyof typeof executionResultNumberToName]
  );
  let transaction: GenLayerTransaction | undefined;
  if (!receiptResultName || !receiptExecutionResultName) {
    transaction = await readClient.getTransaction({ hash: txHash });
  }
  const resultName = receiptResultName ?? transaction?.resultName ?? (
    transaction?.result === undefined
      ? undefined
      : transactionResultNumberToName[String(transaction.result) as keyof typeof transactionResultNumberToName]
  );
  const executionResultName = receiptExecutionResultName ?? transaction?.txExecutionResultName ?? (
    transaction?.txExecutionResult === undefined
      ? undefined
      : executionResultNumberToName[String(transaction.txExecutionResult) as keyof typeof executionResultNumberToName]
  );

  if (resultName !== 'MAJORITY_AGREE') {
    onStageChange('consensus_disagreement', `Consensus result is '${resultName || 'none'}'; expected 'MAJORITY_AGREE'.`);
    throw new Error(`Consensus disagreement: ${resultName}`);
  }

  if (executionResultName === ExecutionResult.FINISHED_WITH_ERROR) {
    onStageChange('execution_error', 'Transaction execution finished with error.');
    throw new Error('Execution finished with error.');
  }

  if (executionResultName && executionResultName !== ExecutionResult.FINISHED_WITH_RETURN) {
    onStageChange('execution_error', `Transaction execution result is '${executionResultName}'; expected 'FINISHED_WITH_RETURN'.`);
    throw new Error(`Execution error: ${executionResultName}`);
  }

  transaction ??= await readClient.getTransaction({ hash: txHash });
  const target = transaction.to_address ?? transaction.recipient;
  const sender = transaction.from_address ?? transaction.sender;
  if (!target || target.toLowerCase() !== pendingOp.contractAddress.toLowerCase()) {
    throw new Error('Transaction target does not match the recorded contract.');
  }
  if (!sender || sender.toLowerCase() !== pendingOp.account.toLowerCase()) {
    throw new Error('Transaction sender does not match the recorded account.');
  }
  if (transaction.hash && transaction.hash.toLowerCase() !== txHash.toLowerCase()) {
    throw new Error('Transaction response hash mismatch.');
  }

  if (checkAborted?.()) {
    throw new Error('Active workflow aborted.');
  }

  onStageChange('reading_back');

  if (checkAborted?.()) {
    throw new Error('Active workflow aborted.');
  }

  let readbackResult: { recordId: string; data: ClaimRecord | AssessmentRecord };
  try {
    readbackResult = await recoverFinalizedWriteRecord(pendingOp);
  } catch (err: unknown) {
    if (checkAborted?.()) throw new Error('Active workflow aborted.');
    onStageChange('readback_failed', getErrorMessage(err));
    throw err;
  }

  onStageChange('execution_success');

  if (checkAborted?.()) {
    throw new Error('Active workflow aborted.');
  }

  clearPendingOperation();
  onStageChange('success');

  return readbackResult;
}

export async function executeContractWrite(
  operationKind: 'register_claim' | 'assess_claim' | 'request_reassessment',
  args: (string | bigint)[],
  expectedBinding: PendingExpectedBinding,
  onStageChange: (stage: TxStage, errorMsg?: string) => void
): Promise<{ txHash: TransactionHash; recordId: string; data: ClaimRecord | AssessmentRecord }> {
  const activeConfig = getContractConfig();
  if (activeConfig.status !== 'configured') {
    onStageChange('chain_error', 'Contract address is not configured.');
    throw new Error('Contract address is not configured.');
  }

  onStageChange('validating');

  let writeClient: ReturnType<typeof walletManager.getWriteClient>;
  const currentWallet = walletManager.getWalletState();
  const initialAccount = currentWallet.address;
  const initialProvider = currentWallet.selectedProvider;

  if (!initialAccount || !initialProvider) {
    onStageChange('provider_selection', 'Wallet is not connected.');
    throw new Error('Wallet is not connected.');
  }

  let isAborted = false;
  const unsubscribeState = walletManager.subscribeState((newState) => {
    if (newState.address !== initialAccount || newState.selectedProvider !== initialProvider || !newState.isConnected) {
      isAborted = true;
      onStageChange('provider_changed', 'Wallet account or provider changed during an active write.');
    }
  });

  try {
    writeClient = walletManager.getWriteClient();
  } catch (err: unknown) {
    unsubscribeState();
    onStageChange('provider_selection', getErrorMessage(err));
    throw err;
  }

  onStageChange('signing');
  let rawWriteResult: unknown;
  try {
    rawWriteResult = await writeClient.writeContract({
      address: activeConfig.address,
      functionName: operationKind,
      args,
      value: 0n,
    });
  } catch (err: unknown) {
    unsubscribeState();
    const msg = getErrorMessage(err);
    if (msg.includes('rejected') || msg.includes('denied') || msg.includes('4001')) {
      onStageChange('rejected_signature', 'Signature request was cancelled by the user.');
    } else {
      onStageChange('submission_failure', msg);
    }
    throw err;
  }

  if (isAborted) {
    unsubscribeState();
    throw new Error('Provider changed during transaction signing.');
  }

  if (typeof rawWriteResult !== 'string') {
    unsubscribeState();
    onStageChange('submission_failure', 'Invalid transaction hash returned by write client.');
    throw new Error('Invalid write return.');
  }

  const txHash = validateTransactionHash(rawWriteResult);

  const pendingOp: PendingOperation = {
    version: 2,
    txHash,
    operationKind,
    chainId: chainInfo.id,
    contractAddress: activeConfig.address,
    account: initialAccount,
    expectedBinding,
    timestamp: Date.now(),
  };
  savePendingOperation(pendingOp);

  onStageChange('submitted');

  let readbackResult: { recordId: string; data: ClaimRecord | AssessmentRecord };
  try {
    readbackResult = await processTransactionFinalityAndReadback(
      txHash,
      pendingOp,
      onStageChange,
      () => isAborted
    );
  } finally {
    unsubscribeState();
  }

  return {
    txHash,
    recordId: readbackResult.recordId,
    data: readbackResult.data,
  };
}
