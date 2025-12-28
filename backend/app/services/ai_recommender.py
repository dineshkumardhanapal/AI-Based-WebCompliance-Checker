"""
AI Recommender Service

Generates AI-powered recommendations for failed compliance checks
using OpenAI GPT-5 via Replicate API.
"""

import os
import asyncio
from typing import List, Dict, Any
from replicate import Client

# Initialize Replicate client (only if token is provided)
replicate_token = os.getenv("REPLICATE_API_TOKEN")
replicate = None

if replicate_token and replicate_token != "your_replicate_api_token_here":
    replicate = Client(api_token=replicate_token)

async def generate_recommendations(
    failed_checks: List[Dict[str, Any]],
    page_url: str
) -> List[Dict[str, str]]:
    """
    Generate AI recommendations for failed compliance checks.
    
    Args:
        failed_checks: List of failed check objects
        page_url: URL of the webpage being checked
        
    Returns:
        List of recommendation dictionaries with checkName and recommendation
    """
    if not failed_checks:
        return []
    
    recommendations = []
    
    # If no API client or token is set, return template-based recommendations
    if not replicate or not replicate_token or replicate_token == "your_replicate_api_token_here":
        return generate_template_recommendations(failed_checks)
    
    # Limit to prevent DoS
    max_checks = 10
    checks_to_process = failed_checks[:max_checks]
    
    for check in checks_to_process:
        try:
            # Sanitize input to prevent prompt injection
            sanitized_name = str(check.get("name", ""))[:200].replace("<", "").replace(">", "")
            sanitized_details = str(check.get("details", ""))[:500].replace("<", "").replace(">", "")
            sanitized_url = str(page_url)[:200].replace("<", "").replace(">", "")
            
            prompt = f"""You are an expert web accessibility consultant. A webpage compliance check found an issue:

Check Name: {sanitized_name}
Issue: {sanitized_details}
URL: {sanitized_url}

Provide a specific, actionable recommendation on how to fix this issue. Be concise (2-3 sentences) and focus on practical steps. Format your response as plain text without markdown."""

            full_prompt = f"""You are an expert web accessibility consultant who provides clear, actionable recommendations for fixing WCAG compliance issues.

{prompt}"""
            
            # Set timeout for API calls
            # Replicate client is synchronous, so we run it in a thread
            try:
                def run_replicate():
                    return replicate.run(
                        "openai/gpt-5",
                        input={
                            "prompt": full_prompt[:2000],  # Limit prompt length
                            "max_tokens": 200,
                            "temperature": 0.7,
                            "reasoning_effort": "medium",
                        }
                    )
                
                output = await asyncio.wait_for(
                    asyncio.to_thread(run_replicate),
                    timeout=30.0
                )
            except asyncio.TimeoutError:
                raise Exception("API request timeout")
            
            # Replicate returns an array of strings, join them
            if isinstance(output, list):
                recommendation = "".join(str(item) for item in output).strip()
            else:
                recommendation = str(output or "").strip()
            
            # Sanitize recommendation output
            recommendation = (
                recommendation
                .replace("<", "")
                .replace(">", "")
                [:500]  # Limit length
            )
            
            # If recommendation is empty or too short, use template
            final_recommendation = (
                recommendation
                if len(recommendation) > 20
                else generate_template_recommendation(check)
            )
            
            recommendations.append({
                "checkName": check["name"],
                "recommendation": final_recommendation,
            })
        except Exception as error:
            print(f"Failed to generate AI recommendation for {check.get('name')}: {error}")
            # Fall back to template recommendation
            recommendations.append({
                "checkName": check["name"],
                "recommendation": generate_template_recommendation(check),
            })
    
    return recommendations

def generate_template_recommendations(
    failed_checks: List[Dict[str, Any]]
) -> List[Dict[str, str]]:
    """
    Generates template-based recommendations for failed checks.
    Used as fallback when Replicate API is unavailable.
    
    Args:
        failed_checks: Array of failed check objects
        
    Returns:
        Array of recommendation objects
    """
    return [
        {
            "checkName": check["name"],
            "recommendation": generate_template_recommendation(check),
        }
        for check in failed_checks
    ]

def generate_template_recommendation(check: Dict[str, Any]) -> str:
    """
    Returns a template recommendation for a specific check type.
    
    Args:
        check: Check object with name property
        
    Returns:
        Template recommendation text
    """
    templates = {
        "Meaningful Reading Sequence": "Use proper heading hierarchy (h1-h6) to establish document structure. Start with an h1 for the main page title, and use h2 for major sections, h3 for subsections, etc. Never skip heading levels.",
        "Not Relying Only on Sensory Cues": "Provide text alternatives for all visual indicators. Add descriptive alt text to images, use text labels alongside color indicators, and ensure all interactive elements have accessible names.",
        "Color Usage": "Never rely solely on color to convey information. Use icons, text, or patterns in addition to color. Ensure text has sufficient color contrast (at least 4.5:1 for normal text, 3:1 for large text).",
        "Keyboard Accessibility": "Ensure all interactive elements (links, buttons, form controls) are keyboard accessible. Test with Tab key navigation. Remove any negative tabindex values unless absolutely necessary.",
        "No Keyboard Trap": "Ensure users can navigate into and out of all sections using only the keyboard. Modals and dialogs should trap focus within them but allow Escape to close. Provide clear exit mechanisms.",
        "Pointer Cancellation": "Ensure hover-only interactions also work with click/tap. Allow users to cancel pointer actions (e.g., drag-and-drop should be cancelable). Avoid hover-only menus or tooltips.",
        "Label Correctly Matches Accessible Name": "Associate form labels with inputs using the 'for' attribute or wrap inputs in label elements. Use aria-label or aria-labelledby when labels cannot be visually associated.",
        "Time Limit Adjustability": "If content has time limits, allow users to adjust, extend, or turn them off. Provide warning before timeouts and clear controls to extend sessions.",
        "No Seizure-Triggering Flashing Content": "Ensure no content flashes more than 3 times per second. If animations are necessary, provide options to reduce motion or disable animations.",
        "Ability to Bypass Repeated Blocks": "Add skip links at the top of the page that allow users to jump to main content. Use ARIA landmarks (role='main', role='navigation') to help screen reader users navigate efficiently.",
    }
    
    return templates.get(check["name"], "Review and fix the accessibility issue mentioned in the check details.")

