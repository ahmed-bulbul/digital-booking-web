# Design System Specification: High-End Mobility Editorial

## 1. Overview & Creative North Star
The "Creative North Star" for this design system is **The Kinetic Sanctuary**. While most travel platforms are cluttered and anxiety-inducing, this system treats the bus booking experience as a premium, calm, and curated journey. We move beyond the "standard blue box" utility by utilizing **Soft Minimalism**—a philosophy that replaces rigid borders with tonal depth, breathing room, and sophisticated layering.

By leveraging intentional asymmetry (e.g., placing oversized typography off-center) and overlapping "glass" elements, we transform a functional tool into a high-end digital experience. The interface should feel like an editorial travel magazine: authoritative, fast, and impeccably organized.

---

## 2. Colors & Surface Philosophy
This system uses a sophisticated palette derived from a professional forest green and a high-energy ochre, grounded by a cool-toned neutral foundation.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts.
*   *Implementation:* Use `surface-container-low` for a section background sitting on a `surface` base. Let the eye perceive the edge through the shift in tone, not a physical line.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—stacked sheets of fine paper.
*   **Base:** `surface` (#f7f9ff)
*   **Secondary Sectioning:** `surface-container-low` (#f1f4fa)
*   **Floating Interactive Elements:** `surface-container-lowest` (#ffffff)
*   **Actionable Overlays:** `surface-container-highest` (#dfe3e8)

### The "Glass & Gradient" Rule
To escape the "template" look, utilize **Glassmorphism** for floating components (e.g., bottom navigation bars or search filters). Use semi-transparent `surface` colors with a 20px-30px backdrop-blur. 
*   **Signature Texture:** Primary CTAs must use a subtle linear gradient from `primary` (#006b2f) to `primary_container` (#00873d) at a 135-degree angle to provide a "lit-from-within" professional polish.

---

## 3. Typography
We utilize a pairing of **Plus Jakarta Sans** for high-impact editorial moments and **Inter** for high-velocity data consumption.

| Level | Token | Font Family | Size | Character |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Plus Jakarta Sans | 3.5rem | Bold, intentional, used for hero destinations. |
| **Headline** | `headline-md` | Plus Jakarta Sans | 1.75rem | Used for search results and trip titles. |
| **Title** | `title-md` | Inter | 1.125rem | Medium weight; high readability for bus types. |
| **Body** | `body-md` | Inter | 0.875rem | The workhorse for seat details and policies. |
| **Label** | `label-sm` | Inter | 0.6875rem | All-caps, tracked out for micro-data (e.g., PLATFORM NO). |

---

## 4. Elevation & Depth
In this design system, shadows are an exception, not a rule. Depth is primarily achieved through **Tonal Layering**.

### The Layering Principle
Place a `surface-container-lowest` (pure white) card on a `surface-container-low` (pale blue-grey) background. This creates a soft, natural lift without the "dirtiness" of a traditional drop shadow.

### Ambient Shadows
When an element must float (e.g., a "Select Seat" drawer), use an **Ambient Shadow**:
*   **Blur:** 40px - 60px
*   **Opacity:** 4% - 8%
*   **Color:** Tinted with `on_surface` (#181c20). Never use pure black (#000) for shadows.

### The "Ghost Border" Fallback
If accessibility requires a container edge in high-glare environments, use a **Ghost Border**: `outline-variant` (#bdcaba) at 15% opacity. 100% opaque borders are strictly forbidden.

---

## 5. Components

### Buttons (The "Tactile" Scale)
*   **Primary:** Gradient fill (`primary` to `primary_container`), roundedness `md` (0.75rem). No border. White text.
*   **Secondary:** `secondary_container` (#ff8e28) fill with `on_secondary_container` (#653200) text. Use for "Urgency" actions like "Last 2 Seats."
*   **Tertiary:** Ghost style. No fill, no border. Heavy `label-md` weight.

### Input Fields
*   **Styling:** Large `xl` (1.5rem) rounded corners to mimic a "capsule" look. 
*   **State:** Default fill is `surface-container-high`. On focus, transition to `surface-container-lowest` with a 2px `primary` ghost-border (20% opacity).

### Cards & Lists (The "Breathable" Grid)
*   **Forbid Dividers:** Do not use horizontal lines between bus listings. 
*   **The Alternative:** Use `8` (2rem) spacing units or a subtle shift to `surface-container-low` for every second item to create a rhythm.
*   **Bus Seat Component:** Use `sm` (0.25rem) roundedness. Available seats use `primary_fixed_dim`, while selected seats use a vibrant `secondary`.

### New Component: The "Trip Pulse" Chip
A custom element for this design system. A small, glassmorphic chip that sits over the Bus Image/Card showing "On Time" or "Live Tracking." It uses a `surface_bright` background at 60% opacity with a backdrop-blur.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical padding. Give more room to the top of a card than the bottom to create an editorial "lift."
*   **Do** use `primary_fixed` for background highlights on success states instead of harsh greens.
*   **Do** prioritize "Thumb-Zone" ergonomics. All primary booking CTAs must reside in the bottom 30% of the screen.

### Don't
*   **Don't** use 1px dividers or #000 shadows. They clutter the sanctuary.
*   **Don't** use more than two font weights in a single component. Use size and color (`on_surface_variant`) to show hierarchy instead.
*   **Don't** use "Alert Red" for everything. Reserve `error` (#ba1a1a) for critical failures; use `secondary` (#934b00) for "Hurry, selling fast" to keep the vibe professional.