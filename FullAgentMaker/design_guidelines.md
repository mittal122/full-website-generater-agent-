# Design Guidelines: Multi-Agent AI Development Platform

## Design Approach
**Reference-Based Approach** - Drawing inspiration from productivity tools like Linear, Notion, and GitHub for their clean, developer-focused interfaces that handle complex workflows elegantly.

## Core Design Elements

### A. Color Palette
**Dark Mode Primary:**
- Background: 12 8% 8% (deep charcoal)
- Surface: 220 13% 12% (matte dark blue-gray)
- Border: 217 19% 18% (subtle border accent)
- Text Primary: 0 0% 95% (near white)
- Text Secondary: 0 0% 65% (muted gray)

**Brand Colors:**
- Primary: 142 76% 36% (vibrant emerald green)
- Success: 120 100% 25% (forest green)
- Warning: 38 92% 50% (amber)
- Error: 0 84% 60% (coral red)

### B. Typography
- **Primary Font:** Inter (Google Fonts) - clean, technical readability
- **Monospace:** JetBrains Mono - for code displays
- **Hierarchy:** 
  - H1: 2xl font-bold (main headings)
  - H2: xl font-semibold (section headers)
  - Body: base font-normal (standard text)
  - Code: sm font-mono (code snippets)

### C. Layout System
**Tailwind Spacing Units:** Consistently use 2, 4, 6, 8, 12, 16 units
- Micro spacing: p-2, m-2 (8px)
- Standard spacing: p-4, m-4 (16px) 
- Component spacing: p-6, gap-6 (24px)
- Section spacing: p-8, my-8 (32px)
- Major layout: p-12, my-12 (48px)
- Large separations: p-16, my-16 (64px)

### D. Component Library

**Navigation:**
- Fixed header with subtle backdrop blur
- Breadcrumb trail for multi-step workflows
- Progress indicators for agent pipeline status

**Forms:**
- Dark input fields with subtle borders
- Floating labels for API key collection
- Validation states with inline messaging

**Data Displays:**
- File explorer with tree structure
- Code preview with syntax highlighting
- Real-time logs with scrollable containers
- Agent status cards with progress indicators

**Overlays:**
- Modal dialogs for confirmations
- Toast notifications for status updates
- Tooltips for complex feature explanations

### E. Animations
**Minimal and Purposeful:**
- Subtle fade-ins for new content
- Smooth transitions for state changes (300ms)
- Progress bar animations for agent workflows
- No distracting or excessive motion

## Key Interface Areas

**Main Dashboard:**
- Central command center with agent pipeline visualization
- Live status indicators for each agent's progress
- Quick access to recent projects and templates

**Project Builder:**
- Step-by-step wizard interface
- Real-time preview of generated code
- Checkpoint system with resume capabilities

**Code Preview:**
- Split-pane layout with file tree and editor
- Syntax-highlighted code display
- Download/export functionality

**Settings & Configuration:**
- Clean form layouts for API key management
- Toggle switches for advanced options
- Clear visual hierarchy for different setting categories

This design creates a professional, developer-focused experience that balances sophisticated functionality with clean, approachable aesthetics suitable for complex AI workflows.