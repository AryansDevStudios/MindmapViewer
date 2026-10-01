# 🧩 MindmapViewer

> High-performance interactive SVG mind map renderer and concept tree navigator built with React.

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Create React App](https://img.shields.io/badge/Create%20React%20App-5.0.1-09D3AC?style=for-the-badge&logo=createreactapp&logoColor=white)
![SVG](https://img.shields.io/badge/Graphics-SVG%20Canvas-FFB13B?style=for-the-badge&logo=svg&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active%20Production-success?style=for-the-badge)

---

## Description

MindmapViewer is a lightweight, high-performance web application engineered to parse hierarchical concept trees and render scalable visual mind maps. Designed specifically for educational concept mapping and structured knowledge revision, it dynamically fetches remote JSON datasets, formats nodes with Canvas-calculated bounding boxes, and connects branches with smooth cubic bezier curves.

The viewer supports complete interactive navigation, including touch gestures, smooth zooming, and selective or recursive subtree expansion. Built with React 18, HTML5 Canvas 2D measurement APIs, and native SVG graphics, it provides an intuitive, distraction-free environment for students and visual learners to explore complex curriculum hierarchies.

---

## Key Features

- **Dynamic Remote Dataset Ingestion**: Load any hierarchical JSON dataset at runtime via the `?file=<url>` URL query parameter, with automatic root node initialization and graceful error handling.
- **Canvas-Accurate SVG Typography**: Uses HTML5 Canvas 2D measurement contexts (`measureTextWidth`) to calculate precise label bounds, ensuring clean padding, uniform heights, and optimal spacing across all hierarchy depths.
- **Dynamic Tree Layout Calculation**: Recursively computes subtree vertical spans (`getSubtreeHeight`) to position parent and child nodes with balanced vertical offsets and zero overlapping.
- **Organic S-Curve Connectors**: Generates smooth cubic Bézier SVG paths with dynamic midpoint control offsets proportional to branch length for fluid, legible connections.
- **Depth-Based Color Hierarchy**: Automatically styles node levels with a 5-tier harmonious palette, interactive hover states, and SVG drop-shadow filters.
- **Infinite Canvas Pan & Zoom**:
  - Drag to pan across arbitrary canvas dimensions.
  - Trackpad and mouse wheel 2D directional panning.
  - Focal-point cursor zooming via SVG matrix transformations (`getScreenCTM().inverse()`) with scale clamping from `0.2x` to `5.0x`.
- **Multi-Touch Gesture Support**: Native mobile and tablet gestures supporting single-finger panning and dual-touch pinch-to-zoom using Euclidean distance tracking (`Math.hypot`).
- **Granular Node Interaction**:
  - Single-click to toggle individual node expansion.
  - Ctrl + Click to recursively expand or collapse an entire nested subtree.
  - Interactive plus-badge indicators (`AiOutlinePlus`) on collapsed branches.
  - Floating global toggle button for instantaneous "Expand All" / "Collapse All" overview.

---

## Tech Stack

- **Core Library**: [React 18.2.0](https://react.dev/)
- **Build System**: [react-scripts 5.0.1](https://create-react-app.dev/) (Create React App)
- **Vector Graphics & Layout**: Native Scalable Vector Graphics (SVG) + HTML5 Canvas API
- **Iconography**: [React Icons 4.10.1](https://react-icons.github.io/react-icons/) (`react-icons/ai`)
- **Styling**: Vanilla CSS3 + Hardware-accelerated CSS Transitions

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version `16.x`, `18.x`, or `20.x` recommended)
- `npm` (bundled with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AryansDevStudios/MindmapViewer.git
   cd MindmapViewer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the local development server:
   ```bash
   npm start
   ```
   The application will boot at `http://localhost:3000`.

---

## Usage

### Viewing a Mind Map

By default, pass a target JSON file path or URL via the `file` query parameter:

```bash
# Load local test dataset
http://localhost:3000/?file=test.json

# Load remote dataset over HTTP/HTTPS
http://localhost:3000/?file=https://cdn.example.com/curriculum/physics_motion.json
```

### JSON Schema Specification

Mind maps are formatted as nested recursive objects:

```json
{
  "id": 1,
  "label": "Central Concept",
  "children": [
    {
      "id": 2,
      "label": "Subtopic A",
      "children": [
        {
          "id": 3,
          "label": "Detail 1",
          "children": []
        }
      ]
    },
    {
      "id": 4,
      "label": "Subtopic B",
      "children": []
    }
  ]
}
```

### Navigation Controls

| Action | Mouse / Keyboard | Touch Gesture |
|---|---|---|
| **Pan Canvas** | Click & drag empty space / Wheel scroll | Single-finger drag |
| **Zoom In / Out** | `Ctrl` + Mouse Wheel (cursor-centered) | Two-finger pinch / spread |
| **Toggle Node** | Click node box or `+` badge | Tap node |
| **Recursive Subtree Toggle** | `Ctrl` + Click node box | — |
| **Global Reset** | Top-right "Expand All" / "Collapse All" button | Tap button |

---

## Project Structure

```
MindmapViewer/
├── public/
│   ├── index.html         # HTML entry document
│   └── test.json          # CBSE Class 9 History ("Russian Revolution") concept map
├── src/
│   ├── App.jsx            # Top-level application wrapper
│   ├── MindMap.jsx        # SVG tree layout engine & gesture handler
│   ├── index.css          # Baseline styling and layout resets
│   └── index.js           # React DOM client mounting point
├── .gitattributes
├── .gitignore
├── package.json           # Scripts and dependency specifications
└── package-lock.json      # Locked dependency graph
```

---

## Contributing

Contributions to enhance layout algorithms, touch performance, or export features are welcome.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/dynamic-themes`)
3. Commit your changes (`git commit -m "Add dark/light theme toggle"`)
4. Push to the branch (`git push origin feature/dynamic-themes`)
5. Open a Pull Request

---

## License

This repository is maintained by [Aryan Gupta](https://github.com/AryansDevStudios). All rights reserved.
