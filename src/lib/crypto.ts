import { AuditBlock, UserRole } from '../types';

/**
 * Pure TypeScript SHA-256 implementation (FIPS 180-4 standard)
 * Ensures instantaneous, synchronous, deterministic hashing in all browser contexts.
 */
function sha256Sync(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i = 0, j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  // Initial hash values (first 32 bits of fractional parts of square roots of first 8 primes 2..19)
  let hash: number[] = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  // Round constants (first 32 bits of fractional parts of cube roots of first 64 primes 2..311)
  const k: number[] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  // Convert ascii to bytes & words
  for (i = 0; i < ascii.length; i++) {
    const code = ascii.charCodeAt(i);
    words[i >> 2] |= (code & 0xff) << (24 - (i % 4) * 8);
  }

  // Padding
  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  const w: number[] = new Array(64);

  for (i = 0; i < words.length; i += 16) {
    const originalHash = hash.slice(0);

    for (j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[i + j] || 0;
      } else {
        const gamma0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const gamma1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = ((w[j - 16] + gamma0 + w[j - 7] + gamma1) | 0);
      }

      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const sigma0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const sigma1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);

      const t1 = (hash[7] + sigma1 + ch + k[j] + w[j]) | 0;
      const t2 = (sigma0 + maj) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + t1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (t1 + t2) | 0;
    }

    for (j = 0; j < 8; j++) {
      hash[j] = (hash[j] + originalHash[j]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }

  return result;
}

export function computeBlockHash(
  index: number,
  timestamp: string,
  action: string,
  actor: string,
  actorRole: UserRole,
  payload: Record<string, any>,
  prevHash: string
): string {
  // Canonical serialization for deterministic hashing
  const normalizedPayload = JSON.stringify(payload, Object.keys(payload).sort());
  const blockString = `${index}|${timestamp}|${action}|${actor}|${actorRole}|${normalizedPayload}|${prevHash}`;
  return sha256Sync(blockString);
}

export function createNewBlock(
  chain: AuditBlock[],
  action: string,
  actor: string,
  actorRole: UserRole,
  payload: Record<string, any>
): AuditBlock {
  const index = chain.length;
  const prevHash = index === 0 ? '0'.repeat(64) : chain[chain.length - 1].hash;
  const timestamp = new Date().toISOString();
  const hash = computeBlockHash(index, timestamp, action, actor, actorRole, payload, prevHash);

  return {
    index,
    timestamp,
    action,
    actor,
    actorRole,
    payload,
    prevHash,
    hash,
    isTampered: false,
  };
}

export interface VerificationResult {
  isValid: boolean;
  tamperedIndex: number | null;
  errorReason: string | null;
  verifiedCount: number;
}

export function verifyAuditChain(chain: AuditBlock[]): VerificationResult {
  if (chain.length === 0) {
    return { isValid: true, tamperedIndex: null, errorReason: null, verifiedCount: 0 };
  }

  // Genesis block check
  const genesis = chain[0];
  const expectedGenesisHash = computeBlockHash(
    genesis.index,
    genesis.timestamp,
    genesis.action,
    genesis.actor,
    genesis.actorRole,
    genesis.payload,
    genesis.prevHash
  );

  if (genesis.prevHash !== '0'.repeat(64)) {
    return {
      isValid: false,
      tamperedIndex: 0,
      errorReason: `Genesis block prevHash must be 64 zeros, found: ${genesis.prevHash.substring(0, 16)}...`,
      verifiedCount: 0,
    };
  }

  if (genesis.hash !== expectedGenesisHash) {
    return {
      isValid: false,
      tamperedIndex: 0,
      errorReason: `Genesis block content hash mismatch. Expected ${expectedGenesisHash.substring(0, 16)}..., stored ${genesis.hash.substring(0, 16)}...`,
      verifiedCount: 0,
    };
  }

  // Verify consecutive blocks
  for (let i = 1; i < chain.length; i++) {
    const current = chain[i];
    const prev = chain[i - 1];

    // Check pointer integrity
    if (current.prevHash !== prev.hash) {
      return {
        isValid: false,
        tamperedIndex: i,
        errorReason: `Chain link broken at block #${i}! Block prevHash does not match Block #${i - 1} hash. Expected ${prev.hash.substring(0, 16)}..., got ${current.prevHash.substring(0, 16)}...`,
        verifiedCount: i,
      };
    }

    // Check content integrity
    const calculatedHash = computeBlockHash(
      current.index,
      current.timestamp,
      current.action,
      current.actor,
      current.actorRole,
      current.payload,
      current.prevHash
    );

    if (current.hash !== calculatedHash) {
      return {
        isValid: false,
        tamperedIndex: i,
        errorReason: `Content tampering detected at Block #${i}! Payload or headers altered without valid cryptographic proof.`,
        verifiedCount: i,
      };
    }
  }

  return {
    isValid: true,
    tamperedIndex: null,
    errorReason: null,
    verifiedCount: chain.length,
  };
}

/**
 * Creates seed genesis and historical blocks so the audit log starts rich and verifiable
 */
export function getInitialAuditChain(): AuditBlock[] {
  const seedEvents = [
    {
      action: 'SYSTEM_GENESIS_INITIALIZATION',
      actor: 'Admin',
      actorRole: 'admin' as UserRole,
      timestamp: '2026-10-25T08:00:00.000Z',
      payload: {
        facility: 'Institutional Core Analytical Center (ICAC)',
        protocol: 'FIPS-180-4 SHA-256 Ledger v2.4',
        masterPolicy: 'Rolling 7-day 20.0h quota cap with peak weighting',
      },
    },
    {
      action: 'EQUIPMENT_SAFETY_CALIBRATION',
      actor: 'Dr. Sharma',
      actorRole: 'owner' as UserRole,
      timestamp: '2026-10-25T09:15:22.000Z',
      payload: {
        resourceId: 'eq-1',
        resourceName: 'Bruker Avance III 600 MHz NMR',
        heliumLevel: '94.2%',
        magneticFieldTesla: 14.095,
        status: 'CERTIFIED_OPERATIONAL',
      },
    },
    {
      action: 'TRAINING_CREDENTIAL_ISSUED',
      actor: 'Rahul Verma',
      actorRole: 'manager' as UserRole,
      timestamp: '2026-10-25T11:30:10.000Z',
      payload: {
        recipient: 'Alice Chen',
        badgeCode: 'NMR-101',
        score: '98%',
        expires: '2027-10-25',
      },
    },
    {
      action: 'MAINTENANCE_WINDOW_LOGGED',
      actor: 'Dr. Sharma',
      actorRole: 'owner' as UserRole,
      timestamp: '2026-10-26T14:00:00.000Z',
      payload: {
        resourceId: 'eq-2',
        resourceName: 'FEI Titan Krios G4 Cryo-TEM',
        action: 'Field Emission Gun tip conditioning & vacuum bakeout',
        certifiedBy: 'FEI Field Engineer #4109',
      },
    },
    {
      action: 'QUOTA_POLICY_REFRESHED',
      actor: 'Admin',
      actorRole: 'admin' as UserRole,
      timestamp: '2026-10-27T08:00:00.000Z',
      payload: {
        cycle: 'Week 43 - Academic Year 2026',
        enforcementMode: 'STRICT_AUTONOMOUS',
        offPeakIncentiveDiscount: '50% quota deduction',
      },
    },
    {
      action: 'BOOKING_HISTORICAL_COMPLETE',
      actor: 'Alice Chen',
      actorRole: 'student' as UserRole,
      timestamp: '2026-10-27T10:30:00.000Z',
      payload: {
        bookingId: 'bk-hist-1',
        resourceName: 'Beckman Coulter Optima XPN-100',
        hoursUsed: 2.5,
        returnInspection: 'PASS_CLEAN',
      },
    },
  ];

  const chain: AuditBlock[] = [];

  for (let i = 0; i < seedEvents.length; i++) {
    const item = seedEvents[i];
    const prevHash = i === 0 ? '0'.repeat(64) : chain[i - 1].hash;
    const hash = computeBlockHash(
      i,
      item.timestamp,
      item.action,
      item.actor,
      item.actorRole,
      item.payload,
      prevHash
    );

    chain.push({
      index: i,
      timestamp: item.timestamp,
      action: item.action,
      actor: item.actor,
      actorRole: item.actorRole,
      payload: item.payload,
      prevHash,
      hash,
      isTampered: false,
    });
  }

  return chain;
}
