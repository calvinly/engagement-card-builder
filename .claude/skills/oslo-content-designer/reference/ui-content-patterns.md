# UI Content Patterns

Content guidance organized by UI pattern, based on the PayPal XD Content Style Guide "Product and UI" section.

## Banners

### Purpose
Banners provide system-level or page-level messages that persist until dismissed or resolved.

### Content Rules
- Lead with the outcome or status, then explain
- Keep to 1-2 sentences
- Include an actionable next step when possible
- Match tone to severity: informational (neutral), success (brief confirmation), warning (clear guidance), error (what went wrong + how to fix)

### DO / DON'T
- DO: "We're updating your account info. This may take a few minutes."
- DON'T: "Attention! Please be advised that your account information is currently being processed."

## Browser Tabs / Page Titles

### Content Rules
- Format: "{Page Name} - PayPal"
- Keep the page-specific portion under 30 characters
- Front-load the unique identifier

## Buttons

### Primary Buttons
- Verb-first imperative: "Pay now", "Send money", "Continue"
- 1-3 words (max 4 for full-width)
- One primary button per screen/section

### Secondary Buttons
- Alternative or cancel actions: "Cancel", "Not now", "Go back"
- Should be clearly subordinate to primary

### Button Label Patterns by Context
| Context | Label Pattern | Examples |
|---------|--------------|----------|
| Payment | Verb + amount or verb + object | "Pay $50.00", "Send money" |
| Navigation | Directional verb | "Continue", "Next", "Go back" |
| Confirmation | Affirmative verb | "Confirm", "Approve", "Accept" |
| Destructive | Specific destructive verb | "Remove card", "Delete", "Close account" |
| Dismissal | Neutral exit | "Cancel", "Not now", "Skip" |
| Information | Verb + object | "Learn more", "See details", "View all" |

### "Skip" vs. "Not now" vs. "Maybe later"
- **Skip**: Use when the action is truly optional. Respects customer's agency.
- **Not now**: Acceptable alternative to "Skip" when the action may be relevant later.
- **Maybe later**: Avoid. Assumes/implies the customer will complete the action later.

## Cards

### Content Rules
- Title: Front-load key info, max ~30 characters
- Description: 1-2 sentences, lead with benefit or status
- Card content should be self-contained (make sense without surrounding context)

## Checkboxes

### Content Rules
- Label describes the option being selected, not an instruction
- Use sentence case
- Keep labels to one line when possible
- For legal consent: link to full terms, don't try to summarize in the label

### DO / DON'T
- DO: "Send me emails about promotions and offers"
- DON'T: "Check this box to receive promotional emails from PayPal"

## Empty States

### Content Rules
- **Title**: What's empty or what can be done (not "Nothing here")
- **Description**: Brief encouragement + value proposition, 1-2 sentences
- **CTA**: Action to resolve the empty state

### DO / DON'T
- DO: Title: "No transactions yet" / Description: "When you send or receive money, it'll show up here." / CTA: "Send money"
- DON'T: Title: "It's empty!" / Description: "There's nothing to see here yet. Come back later when you have transactions."

## Errors

### Error Types and Tone

#### Inline Field Errors
- State what's wrong and how to fix it
- No "please" or "sorry" for field-level validation
- Be specific, not generic
- DO: "Enter a valid email address"
- DON'T: "Invalid input" or "Please check this field"

#### Standalone/Page Errors
- Can use "sorry" once if genuinely inconvenient
- Provide clear next steps
- Include support contact for blocking errors
- DO: "Something went wrong on our end. Try again."
- DON'T: "Whoops! Looks like something broke!"

#### Validation Errors
- Appear immediately on blur or submit
- Describe the requirement, not just the failure
- DO: "Password must be at least 8 characters"
- DON'T: "Password too short"

#### System/Technical Errors
- Don't expose technical details to customers
- Use "something went wrong" language
- Provide a clear recovery path (retry, contact support)

## Forms

### Labels
- Use clear, specific field names in sentence case
- Not questions (e.g., "Email address" not "What's your email?")
- Required fields: use "(optional)" on optional fields rather than asterisks on required ones

### Placeholder Text
- Show format examples, not instructions
- Use realistic but obviously fake data
- DO: "name@email.com" / "(555) 555-5555"
- DON'T: "Enter your email" / "Type your phone number here"

### Helper Text
- Provide constraints or format hints before the user makes an error
- Keep to one line
- DO: "Must be at least 8 characters"

### Form Actions
- Primary: verb describing the outcome ("Create account", "Submit application")
- Secondary: "Cancel" (not "Go back" unless literally navigating back)

## Headlines and Subheads

### Headlines
- Sentence case (not title case, not ALL CAPS)
- Front-load the key message
- Keep concise: aim for 4-8 words
- Can be conversational when appropriate for the context

### Subheads
- Provide additional context or a supporting message
- Keep to 1-2 short sentences
- Should make sense without reading the headline (and vice versa)

### Headline + Subhead Pairing
The headline and subhead should work as a conversation:
- Headline = the key statement
- Subhead = the supporting detail or next step

## Links

### Content Rules
- Link text describes the destination, not the action of clicking
- Never use "click here" or bare "learn more"
- Underline links in body copy
- Use sentence case

### DO / DON'T
- DO: "View our [User Agreement]"
- DON'T: "[Click here] to view our User Agreement"

## Lists

### Content Rules
- Use parallel structure (all items start with same part of speech)
- Keep items concise
- Use bullet points for unordered items, numbers for sequences
- Don't use periods for single-line items, do use periods for multi-sentence items

## Toasts

### Content Rules
- Ultra-brief confirmation: 1 short sentence
- Action-based: confirm what just happened
- Auto-dismiss after a few seconds
- Optional undo/action link

### DO / DON'T
- DO: "Payment sent" / "Card removed" / "Settings saved"
- DON'T: "Your payment has been successfully sent!" / "Congratulations, the card has been removed from your account."

## Tooltips

### Content Rules
- 1-2 sentences max
- Provide supplementary info, not essential info
- Don't repeat what's already on screen
- Triggered by hover/focus, so must be accessible via keyboard

## UI Elements (Miscellaneous)

### Loading States
- For short loads (<2 seconds): no text, use spinner/skeleton
- For longer loads: brief, descriptive text ("Getting your details...")
- Use progressive language for multi-step processes ("Checking your info...", "Almost done...")

### Confirmation States
- Brief and factual
- State what happened, then next steps if any
- DO: "Payment sent. Alex will receive it within 1-2 business days."

### Destructive Confirmations
- Always require confirmation for destructive actions
- State the consequence clearly
- Primary CTA matches the destructive action verb
- DO: Title: "Remove this card?" / Body: "You won't be able to use it for payments." / CTA: "Remove" / Cancel: "Cancel"
