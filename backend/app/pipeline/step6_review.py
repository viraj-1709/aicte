from typing import Dict, Any, List

def compute_risk_score(flags: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes transparent, explainable 0-100 Risk Score.
    No black box: returns exact itemized breakdown showing which flags contributed.
    Accounts for human-in-the-loop feedback (if officer marked false alarm, points are deducted).
    """
    total_score = 0
    breakdown = []

    for f in flags:
        feedback = f.get("officer_feedback")
        base_points = f.get("risk_points", 10)
        
        # If officer marked as false alarm, suppress point contribution
        is_discounted = (feedback == "FALSE_ALARM")
        effective_points = 0 if is_discounted else base_points

        breakdown.append({
            "flag_id": f.get("id"),
            "title": f.get("title"),
            "category": f.get("category"),
            "severity": f.get("severity"),
            "points": effective_points,
            "base_points": base_points,
            "is_discounted": is_discounted,
            "feedback": feedback
        })

        total_score += effective_points

    # Cap score between 0 and 100
    final_score = min(100, max(0, total_score))

    if final_score < 30:
        band = "LOW"
        band_label = "Low Risk (Eligible for Accelerated Scrutiny)"
        color = "green"
    elif final_score < 60:
        band = "MEDIUM"
        band_label = "Medium Risk (Standard Scrutiny Required)"
        color = "amber"
    else:
        band = "HIGH"
        band_label = "High Risk (Mandatory Full Committee Hearing & Physical Inspection)"
        color = "red"

    return {
        "risk_score": final_score,
        "risk_band": band,
        "risk_band_label": band_label,
        "risk_color": color,
        "breakdown": breakdown
    }

def execute_step6_review_summary(application: Dict[str, Any]) -> Dict[str, Any]:
    """
    Step 6: Consolidates full case dossier for officer decision support.
    """
    flags = application.get("flags", [])
    risk_info = compute_risk_score(flags)
    
    return {
        "application_id": application.get("id"),
        "institution_name": application.get("institution_name"),
        "risk_score": risk_info["risk_score"],
        "risk_band": risk_info["risk_band"],
        "risk_band_label": risk_info["risk_band_label"],
        "risk_breakdown": risk_info["breakdown"],
        "total_flags": len(flags),
        "critical_flags": len([f for f in flags if f.get("severity") == "CRITICAL"]),
        "high_flags": len([f for f in flags if f.get("severity") == "HIGH"]),
        "status": application.get("status", "SUBMITTED"),
        "pipeline_completed": True
    }
