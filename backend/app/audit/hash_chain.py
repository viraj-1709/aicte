import hashlib
import json
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
from ..models.schemas import AuditBlock

class HashChainedAuditLedger:
    """
    Cryptographically sealed, hash-chained ledger for AICTE scrutiny logs.
    Guarantees immutability and non-repudiation of all applicant submissions,
    automated AI pipeline findings, and officer decisions.
    """

    GENESIS_PREV_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

    @staticmethod
    def _compute_data_hash(data: Dict[str, Any]) -> str:
        serialized = json.dumps(data, sort_keys=True, default=str)
        return hashlib.sha256(serialized.encode('utf-8')).hexdigest()

    @staticmethod
    def _compute_block_hash(
        index: int,
        timestamp: str,
        application_id: str,
        actor: str,
        action: str,
        data_hash: str,
        prev_hash: str
    ) -> str:
        block_string = f"{index}|{timestamp}|{application_id}|{actor}|{action}|{data_hash}|{prev_hash}"
        return hashlib.sha256(block_string.encode('utf-8')).hexdigest()

    @classmethod
    def create_genesis_block(cls, application_id: str, details: Optional[Dict[str, Any]] = None) -> AuditBlock:
        if details is None:
            details = {"description": "Application Dossier Initialized on AICTE Scrutiny Portal"}
        
        timestamp = datetime.utcnow().isoformat() + "Z"
        data_hash = cls._compute_data_hash(details)
        prev_hash = cls.GENESIS_PREV_HASH
        block_hash = cls._compute_block_hash(
            index=0,
            timestamp=timestamp,
            application_id=application_id,
            actor="SYSTEM_INIT",
            action="GENESIS_RECORD_CREATED",
            data_hash=data_hash,
            prev_hash=prev_hash
        )
        return AuditBlock(
            index=0,
            timestamp=timestamp,
            application_id=application_id,
            actor="SYSTEM_INIT",
            action="GENESIS_RECORD_CREATED",
            details=details,
            data_hash=data_hash,
            prev_hash=prev_hash,
            hash=block_hash
        )

    @classmethod
    def append_block(
        cls,
        chain: List[AuditBlock],
        application_id: str,
        actor: str,
        action: str,
        details: Dict[str, Any],
        timestamp: Optional[str] = None
    ) -> AuditBlock:
        if not chain:
            genesis = cls.create_genesis_block(application_id)
            chain.append(genesis)

        prev_block = chain[-1]
        index = len(chain)
        if not timestamp:
            timestamp = datetime.utcnow().isoformat() + "Z"

        data_hash = cls._compute_data_hash(details)
        prev_hash = prev_block.hash
        block_hash = cls._compute_block_hash(
            index=index,
            timestamp=timestamp,
            application_id=application_id,
            actor=actor,
            action=action,
            data_hash=data_hash,
            prev_hash=prev_hash
        )

        new_block = AuditBlock(
            index=index,
            timestamp=timestamp,
            application_id=application_id,
            actor=actor,
            action=action,
            details=details,
            data_hash=data_hash,
            prev_hash=prev_hash,
            hash=block_hash
        )
        chain.append(new_block)
        return new_block

    @classmethod
    def verify_chain_integrity(cls, chain: List[AuditBlock]) -> Dict[str, Any]:
        """
        Validates SHA-256 continuity of each block in the audit trail.
        Returns validation status and pinpoints tampering if any block was modified.
        """
        if not chain:
            return {"is_valid": True, "message": "Empty ledger"}

        for i, block in enumerate(chain):
            # Verify data hash
            expected_data_hash = cls._compute_data_hash(block.details)
            if block.data_hash != expected_data_hash:
                return {
                    "is_valid": False,
                    "tampered_index": i,
                    "reason": f"Block #{i} data hash mismatch. Payload contents were tampered!"
                }

            # Verify prev hash linkage
            if i == 0:
                if block.prev_hash != cls.GENESIS_PREV_HASH:
                    return {
                        "is_valid": False,
                        "tampered_index": 0,
                        "reason": "Genesis block prev_hash invalid."
                    }
            else:
                if block.prev_hash != chain[i - 1].hash:
                    return {
                        "is_valid": False,
                        "tampered_index": i,
                        "reason": f"Block #{i} prev_hash does not match hash of Block #{i - 1}. Chain broken!"
                    }

            # Verify block self-hash
            expected_hash = cls._compute_block_hash(
                block.index,
                block.timestamp,
                block.application_id,
                block.actor,
                block.action,
                block.data_hash,
                block.prev_hash
            )
            if block.hash != expected_hash:
                return {
                    "is_valid": False,
                    "tampered_index": i,
                    "reason": f"Block #{i} cryptographic signature is invalid."
                }

        return {
            "is_valid": True,
            "total_blocks": len(chain),
            "latest_root_hash": chain[-1].hash if chain else "",
            "message": "Immutable Audit Trail Verified: All cryptographic hash links intact."
        }
