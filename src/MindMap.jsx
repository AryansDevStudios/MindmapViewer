import React, { useState, useRef, useEffect, useCallback } from "react";
import { AiOutlinePlus } from "react-icons/ai";

const levelColors = [
  "rgb(78, 81, 102)",
  "rgb(66, 75, 84)",
  "rgb(49, 66, 62)",
  "rgb(54, 82, 65)",
  "rgb(80, 99, 65)",
];

export default function MindMap() {
  const [mindMapData, setMindMapData] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState([]);
  const [allExpanded, setAllExpanded] = useState(false);

  const svgRef = useRef(null);
  const gRef = useRef(null);

  const transform = useRef({ x: 0, y: 400, scale: 1 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const pinchData = useRef({ initialDistance: 0, initialScale: 1 });

  // --- Load JSON dynamically from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fileUrl = params.get("file");
    if (!fileUrl) return;

    fetch(fileUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setMindMapData(data);
        setExpandedNodes([data.id]);
      })
      .catch((err) => console.error("Failed to load JSON:", err));
  }, []);

  // --- Apply current transform to <g>
  const applyTransform = () => {
    if (!gRef.current) return;
    const { x, y, scale } = transform.current;
    gRef.current.setAttribute("transform", `translate(${x}, ${y}) scale(${scale})`);
  };

  // --- Mouse events
  const handleMouseDown = (e) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    transform.current.x += dx;
    transform.current.y += dy;
    lastPos.current = { x: e.clientX, y: e.clientY };
    applyTransform();
  };
  const handleMouseUp = () => {
    dragging.current = false;
  };

  // --- Wheel zoom & trackpad pan
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      if (!svgRef.current) return;

      const pt = svgRef.current.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svgRef.current.getScreenCTM();
      if (!ctm) return;
      const cursor = pt.matrixTransform(ctm.inverse());

      if (e.ctrlKey) {
        const factor = e.deltaY < 0 ? 1.05 : 0.95;
        const prev = transform.current.scale;
        const next = Math.max(0.2, Math.min(5, prev * factor));
        transform.current.x = cursor.x - ((cursor.x - transform.current.x) * next) / prev;
        transform.current.y = cursor.y - ((cursor.y - transform.current.y) * next) / prev;
        transform.current.scale = next;
      } else {
        transform.current.x -= e.deltaX;
        transform.current.y -= e.deltaY;
      }
      applyTransform();
    },
    [svgRef]
  );

  useEffect(() => {
    if (!mindMapData || !svgRef.current) return;
    const svg = svgRef.current;
    svg.addEventListener("wheel", handleWheel, { passive: false });
    applyTransform();
    return () => svg.removeEventListener("wheel", handleWheel);
  }, [mindMapData, handleWheel]);

  // --- Touch events
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      dragging.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      dragging.current = false;
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      pinchData.current.initialDistance = Math.hypot(dx, dy);
      pinchData.current.initialScale = transform.current.scale;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && dragging.current) {
      const dx = e.touches[0].clientX - lastPos.current.x;
      const dy = e.touches[0].clientY - lastPos.current.y;
      transform.current.x += dx;
      transform.current.y += dy;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      applyTransform();
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const distance = Math.hypot(dx, dy);
      const factor = distance / pinchData.current.initialDistance;
      transform.current.scale = Math.max(0.2, Math.min(5, pinchData.current.initialScale * factor));
      applyTransform();
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) dragging.current = false;
  };

  // --- Node utilities
  const findNodeById = (node, id) => {
    if (!node) return null;
    if (node.id === id) return node;
    if (node.children) {
      for (let child of node.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const toggleNode = (id, ctrlKey = false, node = mindMapData) => {
    if (!node) return;
    if (!ctrlKey) {
      setExpandedNodes((prev) =>
        prev.includes(id) ? prev.filter((nid) => nid !== id) : [...prev, id]
      );
    } else {
      const collectAllIds = (n) => {
        let ids = [n.id];
        if (n.children) n.children.forEach((c) => (ids = ids.concat(collectAllIds(c))));
        return ids;
      };
      const allIds = collectAllIds(findNodeById(node, id));
      setExpandedNodes((prev) => {
        const shouldExpand = !allIds.every((i) => prev.includes(i));
        return shouldExpand
          ? Array.from(new Set([...prev, ...allIds]))
          : prev.filter((i) => !allIds.includes(i));
      });
    }
  };

  const toggleAllNodes = () => {
    if (!mindMapData) return;
    const collectAllIds = (node) => {
      let ids = [node.id];
      if (node.children) node.children.forEach((c) => (ids = ids.concat(collectAllIds(c))));
      return ids;
    };
    const allIds = collectAllIds(mindMapData);
    setExpandedNodes(allExpanded ? [] : allIds);
    setAllExpanded(!allExpanded);
  };

  const getSubtreeHeight = (node) => {
    if (!node.children || node.children.length === 0 || !expandedNodes.includes(node.id)) return 1;
    return node.children.reduce((sum, child) => sum + getSubtreeHeight(child), 0);
  };

  const measureTextWidth = (text, font = "14px Arial") => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = font;
    return ctx.measureText(text).width;
  };

  const renderNodes = (node, x = 0, y = 0, level = 0) => {
    if (!node) return null;
    const isExpanded = expandedNodes.includes(node.id);
    const gapY = 100;

    let childrenElements = [];
    let childPositions = [];

    const textWidth = measureTextWidth(node.label);
    const rectWidth = Math.max(120, textWidth + 20);
    const rectHeight = 50;
    const gapX = Math.max(180, rectWidth + 200);

    if (isExpanded && node.children && node.children.length > 0) {
      let offsetY = y - ((getSubtreeHeight(node) - 1) * gapY) / 2;

      for (let child of node.children) {
        const childHeight = getSubtreeHeight(child) * gapY;
        const childY = offsetY + (childHeight - gapY) / 2;

        childrenElements.push(renderNodes(child, x + gapX, childY, level + 1));

        childPositions.push({
          parentX: x + rectWidth,
          parentY: y + rectHeight / 2,
          childX: x + gapX,
          childY: childY + rectHeight / 2,
        });

        offsetY += childHeight;
      }
    }

    const connectorLines = childPositions.map((pos, idx) => {
        // --- CHANGE START ---
        // 1. Calculate a dynamic control offset based on the distance between nodes.
        // This makes the curve's shape proportional to its length.
        const controlOffset = (pos.childX - pos.parentX) * 0.5;

        // 2. Create the new path string using the dynamic offset.
        // This defines a smooth, flowing S-shaped curve from parent to child.
        const pathData = `M${pos.parentX},${pos.parentY} C${pos.parentX + controlOffset},${pos.parentY} ${pos.childX - controlOffset},${pos.childY} ${pos.childX},${pos.childY}`;

        return (
            <path
                key={`line-${node.children[idx].id}`}
                d={pathData}
                // 3. Update stroke color and width to better match the example image.
                stroke="rgb(100, 100, 100)" // A neutral gray for the line
                strokeWidth="1"              // A thinner line
                fill="transparent"
                style={{ transition: "all 0.3s ease" }}
            />
        );
        // --- CHANGE END ---
    });

    const expandButton =
      node.children && node.children.length > 0 && !isExpanded ? (
        <g style={{ cursor: "pointer" }} onClick={(e) => toggleNode(node.id, e.ctrlKey)}>
          <circle cx={x + rectWidth + 20} cy={y + rectHeight / 2} r={8} fill="#1976d2" />
          <foreignObject x={x + rectWidth + 14} y={y + rectHeight / 2 - 6} width={12} height={12}>
            <AiOutlinePlus style={{ width: "12px", height: "12px", color: "white" }} />
          </foreignObject>
        </g>
      ) : null;

    const fillColor = levelColors[level % levelColors.length];

    return (
      <g key={node.id} style={{ transition: "all 0.3s ease" }}>
        <rect
          x={x}
          y={y}
          width={rectWidth}
          height={rectHeight}
          rx={12}
          ry={12}
          fill={fillColor}
          style={{
            cursor: "pointer",
            transition: "all 0.3s ease",
            filter: "drop-shadow(2px 2px 5px rgba(0,0,0,0.2))",
          }}
          onClick={(e) => toggleNode(node.id, e.ctrlKey)}
          onMouseEnter={(e) => e.currentTarget.setAttribute("fill", "#1565c0")}
          onMouseLeave={(e) => e.currentTarget.setAttribute("fill", fillColor)}
        />
        <text
          x={x + rectWidth / 2}
          y={y + rectHeight / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ pointerEvents: "none", fontFamily: "Arial", fontSize: "14px", fill: "#FFFFFF" }}
        >
          {node.label}
        </text>
        {expandButton}
        {connectorLines}
        {childrenElements}
      </g>
    );
  };

  if (!mindMapData)
    return <p style={{ color: "#fff", textAlign: "center", marginTop: "2rem" }}>Loading mind map...</p>;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        cursor: dragging.current ? "grabbing" : "grab",
        position: "relative",
        background: "#212121", // Darker background to match the style
        touchAction: "none",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <button
        onClick={toggleAllNodes}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1000,
          padding: "8px 16px",
          backgroundColor: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: "bold",
          boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
        }}
      >
        {allExpanded ? "Collapse All" : "Expand All"}
      </button>

      <svg ref={svgRef} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <g ref={gRef}>{renderNodes(mindMapData, 0, 400)}</g>
      </svg>
    </div>
  );
}