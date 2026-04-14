# Oslo Component Content Map

Maps every Oslo design system component to its content slots, rules, and examples.

## Layout and Navigation

### L0Page
| Slot | Content Rule | Example |
|------|-------------|---------|
| Hero text | Short, conversational prompt. 4-6 words. | "Ready to help." |
| Action suggestions | Verb-first, specific tasks. | "Send money to Alex" |
| Search placeholder | Descriptive, starts with verb. | "Search transactions, people, help" |

### L1TopNav
| Slot | Content Rule | Example |
|------|-------------|---------|
| Brand/title | 1 word or brand name only. | "PayPal" |

### L1Screen
Content density lives here. Follow information hierarchy and progressive disclosure.

### L2Modal
| Slot | Content Rule | Example |
|------|-------------|---------|
| Title | Clear task statement. Sentence case. | "Confirm your payment" |
| Body | Essential info only. 1-3 short sentences. | "You're sending $50.00 to Alex Chen." |
| Primary CTA | Verb-first, matches title. | "Confirm" |
| Secondary CTA | Alternative/exit. | "Cancel" |

### L3Detail
Full detail view. Can accommodate structured content but still needs clear hierarchy with headings and sections.

### BottomNav / BottomNavItem
| Slot | Content Rule | Example |
|------|-------------|---------|
| Tab label | 1 word, sentence case. Noun describing the section. | "Home", "Activity" |
| Tab icon | Requires matching `aria-label`. | aria-label="Home" |

### PageHeader
| Slot | Content Rule | Example |
|------|-------------|---------|
| Title | Page name, sentence case, 1-3 words. | "Send money" |
| Leading action | Accessible label for back/close icon. | aria-label="Go back" |
| Trailing action | Accessible label for action icon. | aria-label="Settings" |

## Content Containers

### Card / CardHeader / CardSlot
| Slot | Content Rule | Example |
|------|-------------|---------|
| CardHeader title | Front-loaded key info. Max ~30 chars (2 lines at 390px). | "Cash back rewards" |
| CardHeader subtitle | Supporting context. 1 short sentence. | "Earned this month" |
| Card body text | Structured content. Use lists for multiple items. | -- |

### CardRail
Horizontal scroll context. Each card should be self-contained since only 1-2 are visible at a time.

### CardGrid / CardGridRow
Grid layout. Titles should be concise since cards are narrower (~170px each in 2-col).

### Sheet / SheetHeader / SheetContent / SheetFooter
| Slot | Content Rule | Example |
|------|-------------|---------|
| SheetHeader title | Clear task/topic. Sentence case. 2-4 words. | "Payment options" |
| SheetContent | Focused content. Progressive disclosure for complex info. | -- |
| SheetFooter CTA | Primary action button. Verb-first. | "Continue" |

### Dock
Floating action container. Labels should be ultra-concise (1-2 words) since space is constrained.

## Interactive

### Button
| Variant | Content Rule | Example |
|---------|-------------|---------|
| Primary | Main action. Verb-first, 1-3 words. Imperative mood. | "Send money" |
| Secondary | Alternative action. | "Not now" |
| Tertiary | Supporting/informational action. | "Learn more" |
| Danger | Destructive action. Be specific. | "Remove card" |
| Full-width | Same rules, can accommodate slightly longer labels. | "Continue to checkout" |

**Size guidance**:
- Small: 1-2 word labels
- Medium: 1-3 word labels (default)
- Large: 1-4 word labels, can include more context

### IconButton
No visible text label. Must have `aria-label` describing the action.
- DO: `aria-label="Close"`, `aria-label="Edit profile"`
- DON'T: `aria-label="X button"`, `aria-label="pencil icon"`

### Toggle
| Slot | Content Rule | Example |
|------|-------------|---------|
| Label (external) | Describes what is being toggled. Statement, not question. | "Push notifications" |
| Accessible state | Screen reader should announce on/off state. | "Push notifications, on" |

## Data Display

### Text
The `Text` component renders all typography. Variant determines visual hierarchy:
- `heading-*`: Section headers. Sentence case. Front-load key info.
- `title-*`: Subsection or card titles. Concise.
- `body-*`: Paragraph content. Short sentences, plain language.
- `label-*`: UI labels, metadata. Ultra-concise.
- `caption`: Supporting info, timestamps, fine print.

### Avatar / AssetAvatar
| Slot | Content Rule | Example |
|------|-------------|---------|
| Alt text | Describe the person/entity. | "Alex Chen" or "Bank of America logo" |
| Initials (fallback) | First letter of first + last name. | "AC" |

### List / ListItem
| Slot | Content Rule | Example |
|------|-------------|---------|
| label | Primary identifier. Person name, entity, or action. | "Alex Chen" |
| description | Secondary info. Status, date, or context. | "Sent Jan 15" |
| trailingLabel | Key data point (usually amount). | "$50.00" |
| trailingMeta | Supporting meta. | "Completed" |

### Badge (Numeric, Icon, Label)
| Variant | Content Rule | Example |
|---------|-------------|---------|
| BadgeNumeric | Number only. Use `max` prop for overflow (e.g., 99+). | "5", "99+" |
| BadgeIcon | Accessible label required. | aria-label="New notification" |
| BadgeLabel | 1-2 words. Status/category. Sentence case. | "New", "Pending", "Declined" |

Severity-mapped labels:
- neutral: "New", "Updated"
- info: "Info", "Details"
- success: "Approved", "Complete", "Sent"
- warning: "Pending", "Review"
- error: "Declined", "Failed", "Expired"
- special: "Premium", "Reward"

### ProgressBar / ProgressBarStepped
| Slot | Content Rule | Example |
|------|-------------|---------|
| Label (external) | Describes what's progressing. | "Profile setup" |
| Value text (external) | Current state. Can be percentage or step. | "3 of 5 steps" |
| Accessible description | Screen reader context. | "Profile setup, 60% complete" |

### Divider
No content. Used for visual separation between content sections.

## Feedback Components

### Banner
| Slot | Content Rule | Example |
|------|-------------|---------|
| Message | Lead with status/outcome. Then brief context. 1-2 sentences. | "Your payment was sent. Alex will receive it within 1-2 business days." |
| Action (optional) | Verb-first link/button. | "View details" |

### ContextualAlert
| Slot | Content Rule | Example |
|------|-------------|---------|
| Message | In-context guidance. Be specific about what and why. | "Add a bank account to send money directly." |
| Action (optional) | Clear next step. | "Add bank" |

### Dialog
| Slot | Content Rule | Example |
|------|-------------|---------|
| Title | Question or statement about the decision. | "Remove this card?" |
| Body | Consequences or context. 1-2 sentences. | "You won't be able to use this card for payments." |
| Confirm button | Action verb matching the title. | "Remove" |
| Cancel button | Always "Cancel" unless a specific alternative fits. | "Cancel" |

### Loader
| Slot | Content Rule | Example |
|------|-------------|---------|
| Loading text (external) | Optional. Describe what's loading if it takes >2 seconds. | "Getting your details..." |

## Form Components

### TextInput
| Slot | Content Rule | Example |
|------|-------------|---------|
| Label | Clear field name. Sentence case. Not a question. | "Email address" |
| Placeholder | Format example, not instruction. Gray text. | "name@email.com" |
| Helper text | Format hint or constraint. Shown before errors. | "Must be at least 8 characters" |
| Error text | What's wrong + how to fix. No "please" for inline. | "Enter a valid email address" |

### TextArea
Same rules as TextInput. Additionally:
| Slot | Content Rule | Example |
|------|-------------|---------|
| Character count | Show remaining characters for constrained inputs. | "48/250" |

### PasswordInput
| Slot | Content Rule | Example |
|------|-------------|---------|
| Label | "Password" or "New password" | "Password" |
| Show/hide toggle | Accessible label for visibility toggle. | aria-label="Show password" |
| Requirements | List specific requirements. | "8+ characters, 1 number, 1 special character" |

### CodeInput
| Slot | Content Rule | Example |
|------|-------------|---------|
| Instructions | Where the code was sent, what to do with it. | "Enter the 6-digit code we sent to j***@email.com" |
| Resend action | Clear timing context. | "Resend code" |

### Dropdown
| Slot | Content Rule | Example |
|------|-------------|---------|
| Label | Same as TextInput label rules. | "Country" |
| Placeholder | Instruction to select. | "Select a country" |
| Options | Clear, consistent naming. Alphabetized when appropriate. | -- |

## Assets and Icons

### Icons (Oslo* prefix)
All 190+ icons need accessible labels when used as interactive elements.
- Decorative icons in a labeled button: `aria-hidden="true"`
- Standalone icon buttons: `aria-label` describing the action

### OsloAiMark / OsloAiMarkFill
Used for AI features. Accessible label should describe the AI capability, not the icon appearance.
- DO: `aria-label="AI-powered suggestion"`
- DON'T: `aria-label="sparkle icon"`
