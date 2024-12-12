import { useState, useRef, useEffect } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";
import { Button, TextField, Container, Box, Paper, Typography } from "@mui/material";
import "./BellmanFord.css";

// лейаут для графа
cytoscape.use(coseBilkent);

const BellmanFord = () => {
  const initialNodes = [
    { data: { id: "S" } },
    { data: { id: "A" } },
    { data: { id: "B" } },
    { data: { id: "C" } },
    { data: { id: "D" } },
    { data: { id: "E" } },
  ];

  const initialEdges = [
    { source: "S", target: "A", weight: 10 },
    { source: "S", target: "E", weight: 8 },
    { source: "A", target: "C", weight: 2 },
    { source: "B", target: "A", weight: 1 },
    { source: "C", target: "B", weight: -2 },
    { source: "D", target: "C", weight: -1 },
    { source: "D", target: "A", weight: -4 },
    { source: "E", target: "D", weight: 1 },
  ];

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [graphElements, setGraphElements] = useState([...initialNodes, ...initialEdges.map(edge => ({ data: { id: `${edge.source}-${edge.target}`, source: edge.source, target: edge.target, weight: edge.weight } }))]);
  const [newNode, setNewNode] = useState("");
  const [newEdge, setNewEdge] = useState({ source: "", target: "", weight: "" });
  const [removeNodeId, setRemoveNodeId] = useState("");
  const [removeEdgeData, setRemoveEdgeData] = useState({ source: "", target: "" });
  const [startNode, setStartNode] = useState("");
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [negativeCycle, setNegativeCycle] = useState(false);
  const cyRef = useRef(null);

  const updateGraph = (step) => {
    if (cyRef.current) {
      cyRef.current.batch(() => {
        cyRef.current.elements().style({
          'line-color': '#000000',
          'target-arrow-color': '#000000',
          'background-color': '#666',
          'border-width': 0,
          'border-color': '#000'
        });

        step.edges.forEach((edge) => {
          const cyEdge = cyRef.current.$(`edge[source="${edge.source}"][target="${edge.target}"]`);
          if (edge.updated) {
            cyEdge.style({
              'line-color': '#ff1100',
              'target-arrow-color': '#ff1100',
              'line-style': 'solid',
              'width': 3,
              'transition-property': 'line-color, target-arrow-color, width',
              'transition-duration': '0.3s'
            });

            cyRef.current.$id(edge.source).style({
              'background-color': '#4CAF50',
              'border-width': 3,
              'border-color': '#45a049',
              'transition-property': 'background-color, border-width, border-color',
              'transition-duration': '0.3s'
            });

            cyRef.current.$id(edge.target).style({
              'background-color': '#2196F3',
              'border-width': 3,
              'border-color': '#1976D2',
              'transition-property': 'background-color, border-width, border-color',
              'transition-duration': '0.3s'
            });
          }
        });
      });
    }
  };


  const resetGraphStyles = () => {
    if (cyRef.current) {
      cyRef.current.elements().style({
        'line-color': '#000000',
        'target-arrow-color': '#000000',
        'background-color': '#666',
        'border-width': 0,
        'border-color': '#000'
      });
    }
  };

  const renderDistances = (step) => {
    if (!step || !step.distances) return null;

    return (
      <Paper elevation={3} className="distances-container">
        <Typography variant="h6">Distances (Step {step.step}):</Typography>
        <Box className="distances-grid">
          {Object.entries(step.distances).map(([node, distance]) => (
            <Box key={node} className="distance-item">
              <Typography>
                {node}: {distance === "Infinity" ? "∞" : distance}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    );
  };

  const addNode = () => {
    if (newNode) {
      const updatedNodes = [...nodes, { data: { id: newNode } }];
      setNodes(updatedNodes);
      setGraphElements([...graphElements, { data: { id: newNode } }]);
      if (cyRef.current) {
        cyRef.current.layout({
          name: 'cose-bilkent',
          animate: true,
          animationDuration: 500,
          randomize: false,
          fit: true
        }).run();
      }
      setNewNode("");
    }
  };

  const addEdge = () => {
    if (newEdge.source && newEdge.target && newEdge.weight) {
      const sourceNodeExists = nodes.some((node) => node.data.id === newEdge.source);
      const targetNodeExists = nodes.some((node) => node.data.id === newEdge.target);
      const edgeExists = edges.some((edge) => edge.source === newEdge.source && edge.target === newEdge.target);

      if (sourceNodeExists && targetNodeExists) {
        if (edgeExists) {
          alert("Edge already exists.");
        } else {
          const updatedEdges = [
            ...edges,
            { source: newEdge.source, target: newEdge.target, weight: newEdge.weight },
          ];
          setEdges(updatedEdges);
          setGraphElements([
            ...graphElements,
            {
              data: {
                id: `${newEdge.source}-${newEdge.target}`,
                source: newEdge.source,
                target: newEdge.target,
                weight: newEdge.weight,
              },
            },
          ]);
          if (cyRef.current) {
            cyRef.current.layout({
              name: 'cose-bilkent',
              animate: true,
              animationDuration: 500,
              randomize: false,
              fit: true
            }).run();
          }
          setNewEdge({ source: "", target: "", weight: "" });
        }
      } else {
        alert("Both source and target nodes must exist.");
      }
    }
  };

  const handleRemoveNode = (nodeId) => {
    const updatedNodes = nodes.filter((node) => node.data.id !== nodeId);
    const updatedEdges = edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setGraphElements([
      ...updatedNodes,
      ...updatedEdges.map(edge => ({ data: { id: `${edge.source}-${edge.target}`, source: edge.source, target: edge.target, weight: edge.weight } }))
    ]);
  };

  const handleRemoveEdge = (source, target) => {
    const updatedEdges = edges.filter((edge) => !(edge.source === source && edge.target === target));
    setEdges(updatedEdges);
    setGraphElements([
      ...nodes,
      ...updatedEdges.map(edge => ({ data: { id: `${edge.source}-${edge.target}`, source: edge.source, target: edge.target, weight: edge.weight } }))
    ]);
  };

  const resetGraph = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setGraphElements([...initialNodes, ...initialEdges.map(edge => ({ data: { id: `${edge.source}-${edge.target}`, source: edge.source, target: edge.target, weight: edge.weight } }))]);
    setNegativeCycle(false);
    setSteps([]);
    setCurrentStep(0);
    resetGraphStyles();
    if (cyRef.current) {
      cyRef.current.layout({
        name: 'cose-bilkent',
        animate: true,
        animationDuration: 500,
        randomize: false,
        fit: true
      }).run();
    }
  };

  const handleStartAlgorithm = async () => {
    try {
      const response = await fetch("http://localhost:5000/bellman-ford", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          edges,
          startNode,
          nodes: nodes.length,
        }),
      });
  
      const result = await response.json();
      if (response.ok) {
        setSteps(result.steps);
        setIsRunning(true);
        setCurrentStep(0);
        updateGraph(result.steps[0]);
        if (result.negativeCycle) {
          setNegativeCycle(true);
          result.negativeCycle.forEach((edge) => {
            const cyEdge = cyRef.current.$(`edge[source="${edge.source}"][target="${edge.target}"]`);
            cyEdge.data('negativeCycle', true);
            cyRef.current.$id(edge.source).data('negativeCycle', true);
            cyRef.current.$id(edge.target).data('negativeCycle', true);
          });
          highlightNegativeCycle();
        }
      } else {
        alert(result.error || "An error occurred");
      }
    } catch (error) {
      console.error("Error running algorithm:", error);
      alert("Unable to run algorithm.");
    }
  };
  
  const highlightNegativeCycle = () => {
    if (cyRef.current && negativeCycle) {
      cyRef.current.elements().forEach((ele) => {
        if (ele.data('negativeCycle')) {
          ele.style({
            'line-color': 'red',
            'target-arrow-color': 'red',
            'background-color': 'red',
            'border-width': 2,
            'border-color': 'red'
          });
        }
      });
    }
  };


  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      updateGraph(steps[currentStep + 1]);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      updateGraph(steps[currentStep - 1]);
    }
  };

  const handleStopSimulation = () => {
    setIsRunning(false);
    resetGraphStyles();
  };

  useEffect(() => {
    if (negativeCycle) {
      highlightNegativeCycle();
    }
  }, [negativeCycle]);

  return (
    <Container className="bellman-ford-container">
      <div className="main-content">
        <div className="cytoscape-container">
          <CytoscapeComponent
            elements={graphElements}
            style={{ width: "100%", height: "100%" }}
            layout={{ name: "cose-bilkent" }}
            cy={(cy) => {
              cyRef.current = cy;
            }}
            stylesheet={[
              {
                selector: "node",
                style: {
                  label: "data(id)",
                  "text-valign": "center",
                  "text-halign": "center",
                },
              },
              {
                selector: "edge",
                style: {
                  label: "data(weight)",
                  "text-rotation": "autorotate",
                  "curve-style": "bezier",
                  "target-arrow-shape": "triangle",
                },
              },
            ]}
          />
        </div>
        <div className="controls">
          <Box className="form-group">
            <TextField
              label="Node ID"
              value={newNode}
              onChange={(e) => setNewNode(e.target.value)}
              size="small"
            />
            <Button variant="contained" onClick={addNode} size="small">
              Add Node
            </Button>
          </Box>
          <Box className="form-group">
            <TextField
              label="Source"
              value={newEdge.source}
              onChange={(e) => setNewEdge({ ...newEdge, source: e.target.value })}
              size="small"
            />
            <TextField
              label="Target"
              value={newEdge.target}
              onChange={(e) => setNewEdge({ ...newEdge, target: e.target.value })}
              size="small"
            />
            <TextField
              label="Weight"
              type="number"
              value={newEdge.weight}
              onChange={(e) => setNewEdge({ ...newEdge, weight: e.target.value })}
              size="small"
            />
            <Button variant="contained" onClick={addEdge} size="small">
              Add Edge
            </Button>
          </Box>
          <Box className="form-group">
            <TextField
              label="Remove Node ID"
              value={removeNodeId}
              onChange={(e) => setRemoveNodeId(e.target.value)}
              size="small"
            />
            <Button variant="contained" color="warning" onClick={() => handleRemoveNode(removeNodeId)} size="small">
              Remove Node
            </Button>
          </Box>
          <Box className="form-group">
            <TextField
              label="Source"
              value={removeEdgeData.source}
              onChange={(e) => setRemoveEdgeData({ ...removeEdgeData, source: e.target.value })}
              size="small"
            />
            <TextField
              label="Target"
              value={removeEdgeData.target}
              onChange={(e) => setRemoveEdgeData({ ...removeEdgeData, target: e.target.value })}
              size="small"
            />
            <Button variant="contained" color="warning" onClick={() => handleRemoveEdge(removeEdgeData.source, removeEdgeData.target)} size="small">
              Remove Edge
            </Button>
          </Box>
          <Box className="form-group">
            <TextField
              label="Start Node"
              value={startNode}
              onChange={(e) => setStartNode(e.target.value)}
              size="small"
            />
            <Button variant="contained" onClick={handleStartAlgorithm} size="small">
              Start
            </Button>
            <Button variant="contained" onClick={handleStopSimulation} disabled={!isRunning} size="small">
              Stop
            </Button>
          </Box>
          <Box className="form-group">
            <Button variant="contained" onClick={handlePreviousStep} disabled={currentStep === 0} size="small">
              Previous
            </Button>
            <Button variant="contained" onClick={handleNextStep} disabled={currentStep === steps.length - 1} size="small">
              Next
            </Button>
          </Box>
          <Box className="form-group">
            <Button variant="contained" color="error" onClick={resetGraph} size="small">
              Reset Graph
            </Button>
          </Box>
        </div>
      </div>
      {renderDistances(steps[currentStep])}
      {negativeCycle && (
        <Typography variant="h6" color="error" className="negative-cycle-message">
          Negative weight cycle detected!
        </Typography>
      )}
    </Container>
  );
};

export default BellmanFord;