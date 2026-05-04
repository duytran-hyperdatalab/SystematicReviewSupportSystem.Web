import React, { useMemo, useEffect, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import { GitBranch, BoxSelect, RefreshCw } from "lucide-react";
import type { CitationGraphDto } from "../../../../../../types/studySelection";

// Register fcose layout
cytoscape.use(fcose);

type LayoutMode = "timeline" | "radial";

interface CitationGraphCanvasProps {
  data: CitationGraphDto;
  rootPaperId?: string;
  selectedPaperId?: string | null;
  onNodeClick?: (paperId: string | null) => void;
}

const CitationGraphCanvas: React.FC<CitationGraphCanvasProps> = ({
  data,
  rootPaperId,
  selectedPaperId,
  onNodeClick,
}) => {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("timeline");
  
  // Cache for radial positions to prevent re-calculating on every mode switch
  const radialPositionsRef = useRef<Record<string, cytoscape.Position>>({});

  // Reset cache if data changes
  useEffect(() => {
    radialPositionsRef.current = {};
  }, [data]);

  // Memoize elements with Manual Timeline positions in the data
  // These positions are used exclusively for 'timeline' mode via the preset layout
  const elements = useMemo(() => {
    if (!data.nodes.length) return [];

    const currentYear = new Date().getFullYear();
    const validYears = data.nodes
      .map((n) => n.year)
      .filter((y) => y && y > 0) as number[];
    
    const minYear = validYears.length > 0 ? Math.min(...validYears) : currentYear - 5;
    const maxYear = validYears.length > 0 ? Math.max(...validYears) : currentYear;

    const yearSpacing = 300;
    const ySpacing = 100;
    const yearCountMap: Record<number, number> = {};

    const nodes = data.nodes.map((node) => {
      let year = node.year && node.year > 0 ? node.year : minYear;
      if (node.id === rootPaperId) year = Math.max(year, maxYear);

      const x = (year - minYear) * yearSpacing;
      const stackIndex = yearCountMap[year] || 0;
      yearCountMap[year] = stackIndex + 1;
      const y = stackIndex * ySpacing;

      return {
        data: {
          id: node.id,
          label: `${node.title.length > 30 ? node.title.substring(0, 27) + "..." : node.title}\n(${year})`,
          fullTitle: node.title,
          year: year,
          isRoot: node.id === rootPaperId,
          timelinePos: { x, y } // Store timeline position in scratch data
        },
        // IMPORTANT: We don't set 'position' here to keep the elements object stable.
        // We'll apply positions manually or via layout-specific methods.
      };
    });

    const edges = data.edges.map((edge, index) => ({
      data: {
        id: `e${index}`,
        source: edge.sourcePaperId,
        target: edge.targetPaperId,
        weight: edge.confidenceScore,
      },
    }));

    return [...nodes, ...edges];
  }, [data, rootPaperId]);

  // Stable Stylesheet with conditional classes for edges
  const stylesheet = useMemo<any>(() => [
    {
      selector: "node",
      style: {
        "background-color": "#ffffff",
        "border-width": 2,
        "border-color": "#3b82f6",
        width: 42,
        height: 42,
        label: "data(label)",
        "font-size": "10px",
        "text-valign": "bottom",
        "text-halign": "center",
        "text-margin-y": 8,
        color: "#4b5563",
        "transition-property": "background-color border-color border-width width height opacity",
        "transition-duration": 300,
        "text-wrap": "wrap",
        "text-max-width": "100px",
      },
    },
    {
      selector: "node[?isRoot]",
      style: {
        "background-color": "#2563eb",
        "border-color": "#1d4ed8",
        "border-width": 4,
        width: 58,
        height: 58,
        color: "#111827",
        "font-weight": "bold",
      },
    },
    {
      selector: "node.selected",
      style: {
        "border-width": 6,
        "border-color": "#2563eb",
        "background-color": "#eff6ff",
      },
    },
    {
      selector: "edge",
      style: {
        width: 1.5,
        "line-color": "#cbd5e1",
        opacity: 0.5,
        "curve-style": "bezier", // Default
        "target-arrow-shape": "triangle",
        "target-arrow-color": "#cbd5e1",
        "target-arrow-fill": "filled",
        "arrow-scale": 1,
        "transition-property": "line-color opacity width",
        "transition-duration": 300,
      },
    },
    {
      selector: "edge.timeline-curve",
      style: {
        "curve-style": "taxi",
        "taxi-direction": "horizontal",
        "taxi-turn": 40,
      }
    },
    {
      selector: "node.highlight",
      style: {
        "border-color": "#2563eb",
        "border-width": 3,
      },
    },
    {
      selector: "node.semitransparent",
      style: {
        opacity: 0.15,
      },
    },
    {
      selector: "edge.highlight",
      style: {
        opacity: 1,
        width: 3,
        "line-color": "#3b82f6",
        "target-arrow-color": "#3b82f6",
      },
    },
    {
      selector: "edge.semitransparent",
      style: {
        opacity: 0.05,
      },
    },
  ], []); // No dependencies for maximum stability

  // Centralized Layout Trigger logic
  const triggerLayout = (mode: LayoutMode, forceRegenerateRadial: boolean = false) => {
    const cy = cyRef.current;
    if (!cy) return;

    if (mode === "timeline") {
      cy.edges().removeClass("bezier").addClass("timeline-curve");
      
      cy.layout({
        name: "preset",
        animate: true,
        animationDuration: 800,
        fit: true,
        padding: 100,
        positions: (node: any) => node.data("timelinePos"),
      }).run();
    } else {
      cy.edges().removeClass("timeline-curve");

      const hasCache = Object.keys(radialPositionsRef.current).length > 0;
      
      if (hasCache && !forceRegenerateRadial) {
        // Use cached radial positions
        cy.layout({
          name: "preset",
          animate: true,
          animationDuration: 800,
          fit: true,
          padding: 100,
          positions: (node: any) => radialPositionsRef.current[node.id()],
        }).run();
      } else {
        // Run full fcose engine
        const layout = cy.layout({
          name: "fcose",
          animate: true,
          animationDuration: 1200,
          fit: true,
          padding: 100,
          nodeDimensionsIncludeLabels: true,
          nodeSeparation: 120,
          idealEdgeLength: (edge: any) => 120 / (edge.data("weight") || 0.5),
          randomize: forceRegenerateRadial, // Randomize only on force refresh
        } as any);

        layout.on("layoutstop", () => {
          // Cache the results
          cy.nodes().forEach((node) => {
            radialPositionsRef.current[node.id()] = { ...node.position() };
          });
        });

        layout.run();
      }
    }
  };

  // 1. Initial Load: Apply elements and start in timeline mode
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !elements.length) return;

    cy.elements().remove();
    cy.add(elements);
    
    // Clear cache whenever data truly changes
    radialPositionsRef.current = {};
    
    triggerLayout("timeline");
  }, [elements]);

  // 2. Mode Toggle: Switch positions without re-adding elements
  useEffect(() => {
    triggerLayout(layoutMode);
  }, [layoutMode]);

  // Handle Selection & Highlighting
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().removeClass("semitransparent highlight selected");

    if (selectedPaperId) {
      const selectedNode = cy.getElementById(selectedPaperId);
      if (selectedNode.length > 0) {
        selectedNode.addClass("selected");
        cy.elements().addClass("semitransparent");

        const neighborhood = selectedNode.neighborhood();
        neighborhood.add(selectedNode).removeClass("semitransparent");
        neighborhood.addClass("highlight");
        selectedNode.connectedEdges().removeClass("semitransparent").addClass("highlight");

        cy.animate({
          center: { eles: selectedNode },
          zoom: {
            level: Math.max(cy.zoom(), 0.8),
            position: selectedNode.position()
          },
          duration: 500,
          easing: "ease-in-out-cubic"
        });
      }
    }
  }, [selectedPaperId]);

  const handleCyReady = (cy: cytoscape.Core) => {
    cyRef.current = cy;

    cy.on("tap", "node", (e) => {
      const id = e.target.id();
      if (onNodeClick) onNodeClick(id);
    });

    cy.on("tap", (e) => {
      if (e.target === cy) if (onNodeClick) onNodeClick(null);
    });

    cy.on("mouseover", "node", (e) => {
      if (selectedPaperId) return;
      const node = e.target;
      const neighborhood = node.neighborhood().add(node);
      cy.elements().addClass("semitransparent");
      neighborhood.removeClass("semitransparent");
      node.connectedEdges().removeClass("semitransparent").addClass("highlight");
    });

    cy.on("mouseout", "node", () => {
      if (selectedPaperId) return;
      cy.elements().removeClass("semitransparent highlight");
    });
  };

  return (
    <div className="w-full h-full bg-slate-50 relative group">
      <CytoscapeComponent
        elements={[]}
        style={{ width: "100%", height: "100%" }}
        stylesheet={stylesheet}
        cy={handleCyReady}
        className="transition-opacity duration-500"
      />

      {/* Primary Mode Switcher */}
      <div className="absolute top-4 left-4 flex items-center p-1 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl z-20">
        <button
          onClick={() => setLayoutMode("timeline")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
            layoutMode === "timeline"
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          }`}
        >
          <GitBranch className="h-4 w-4" />
          Timeline Flow
        </button>
        <button
          onClick={() => setLayoutMode("radial")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
            layoutMode === "radial"
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          }`}
        >
          <BoxSelect className="h-4 w-4" />
          Radial Cluster
        </button>
        
        {layoutMode === "radial" && (
          <div className="mx-1 h-4 w-[1px] bg-slate-200" />
        )}
        
        {layoutMode === "radial" && (
          <button
            onClick={() => triggerLayout("radial", true)}
            title="Regenerate Radial Layout"
            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Help Legend - Autohide */}
      <div className="absolute bottom-6 left-6 pointer-events-none transition-all duration-500 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
        <div className="px-4 py-2 bg-slate-900/90 text-white backdrop-blur rounded-xl shadow-2xl flex items-center gap-3 border border-white/10">
          <div className={`w-2 h-2 rounded-full animate-pulse ${layoutMode === 'timeline' ? 'bg-blue-400' : 'bg-purple-400'}`} />
          <span className="text-[11px] font-medium tracking-wide">
            {layoutMode === "timeline" 
              ? "Chronological Mapping: Papers are sorted by publication year (Left to Right)." 
              : "Influence Mapping: Papers are clustered by citation strength and connectivity."}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CitationGraphCanvas;
