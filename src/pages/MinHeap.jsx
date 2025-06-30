import { useState, useEffect } from "react";
import Tree from "react-d3-tree";
import { Button, TextField, Container, Box, Typography } from "@mui/material";
import "./MinHeap.css";

const MinHeap = () => {
  const [heap, setHeap] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [newValue, setNewValue] = useState("");
  const [seacrhValue, setSeacrhValue] = useState("");
  const [highlightPath, setHighlightPath] = useState([]);
  const [seacrhNodes, setSeacrhNodes] = useState([]);
  const [removeValue, setRemoveValue] = useState("");
  const [printResult, setPrintResult] = useState([]);
  const [showPrint, setShowPrint] = useState(false);
  const [showLenght, setShowLenght] = useState(false);

  useEffect(() => {
    const fetchInitialHeap = async () => {
      try {
        const response = await fetch("http://localhost:5000/min-heap/print", {
          method: "GET",
        });
        const result = await response.json();
        setHeap(result.print);
      } catch (error) {
        console.error("Error fetching initial heap:", error);
      }
    };
    fetchInitialHeap();
  }, []);

  const handleClearHeap = async () => {
    try {
      const response = await fetch("http://localhost:5000/min-heap/clear", {
        method: "POST",
      });
      const result = await response.json();
      setHeap([]);
      setSteps([]);
      setCurrentStep(0);
      setPrintResult([]);
      setShowPrint(false);
      setHeap(result.currentHeap);
    } catch (error) {
      console.error("Error clearing heap:", error);
    }
  };

  // видалення ноди
  const handleRemoveNode = async () => {
    if (removeValue !== "") {
      try {
        const response = await fetch("http://localhost:5000/min-heap/remove", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value: parseInt(removeValue) }),
        });
        const result = await response.json();
        setHeap(result.currentHeap);
        setSteps(result.steps);
        setCurrentStep(0);
        setRemoveValue("");
      } catch (error) {
        console.error("Error removing node:", error);
      }
    }
  };

  const renderTreeData = () => {
    if (!heap || heap.length === 0) return { name: "Heap is empty" };

    const buildTree = (index) => {
      if (index >= heap.length) return null;

      const nodeData = {
        name: `${heap[index]}`,
        highlatedClassName: highlightPath.includes(index) ? "highlighted-edge" : "",
      };

      const children = [
        buildTree(2 * index + 1),
        buildTree(2 * index + 2),
      ].filter(Boolean);

      if (children.length > 0) {
        nodeData.children = children;
      }

      return nodeData;
    };

    return buildTree(0);
  };

  const handleSearch = async () => {
    if (seacrhValue !== "") {
      try {
        const response = await fetch("http://localhost:5000/min-healp/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: parseInt(seacrhValue) })
        });

        const result = await response.json();
        if (result.error !== undefined) {
          alert(result.error);
        } else {
          setHighlightPath(result.indices);
          setSeacrhNodes(result.path)
        }
      } catch (error) {
        console.error("Error searching for node:", error);
      }
    }
  };

  const handleAdd = async () => {
    if (newValue !== "") {
      try {
        const response = await fetch("http://localhost:5000/min-heap/insert", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value: parseInt(newValue) }),
        });

        const result = await response.json();
        if (result.error !== undefined) {
          alert(result.error)
          return;
        }

        setHeap(result.currentHeap);
        setSteps(result.steps);
        setCurrentStep(0);
        setNewValue("");
      } catch (error) {
        console.error("Error adding value:", error);
      }
    }
  };

  const handleGetMin = async () => {
    try {
      const response = await fetch("http://localhost:5000/min-heap/get-min", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      setSteps(result.steps);
      setCurrentStep(0);
    } catch (error) {
      console.error("Error getting min:", error);
    }
  }

  const handleExtractMin = async () => {
    try {
      const response = await fetch("http://localhost:5000/min-heap/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      setHeap(result.currentHeap);
      setSteps(result.steps);
      setCurrentStep(0);
    } catch (error) {
      console.error("Error extracting min:", error);
    }
  };

  const handlePrint = async () => {
    try {
      const response = await fetch("http://localhost:5000/min-heap/print", {
        method: "GET",
      });

      const result = await response.json();
      setPrintResult(result.print);
      setShowPrint(true);
    } catch (error) {
      console.error("Error printing heap:", error);
    }
  };

  return (
    <Container className="min-heap-container">
      <div className="main-content">
        <div className="tree-container">
          <Tree
            data={renderTreeData()}
            orientation="vertical"
            pathFunc="straight"
            translate={{ x: 300, y: 50 }}
            separation={{ siblings: 2, nonSiblings: 2.5 }}
            nodeSize={{ x: 100, y: 100 }}
            transitionDuration={300}
            enableLegacyTransitions={true}
            collapsible={false}
            zoomable={true}
            draggable={true}
            pathClassFunc={(link) => `${link.target.data.highlatedClassName}`}
            nodeClassFunc={node => `rd3t-node ${node.data.className}`}
          />
        </div>
        <div className="controls">
          <Box className="form-group">
            <TextField
              label="Enter value"
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              size="small"
            />
            <Button variant="contained" onClick={handleAdd} size="small">
              Add
            </Button>
          </Box>
          <Box className="form-group">
            <TextField
              label="Remove value"
              type="number"
              value={removeValue}
              onChange={(e) => setRemoveValue(e.target.value)}
              size="small"
            />
            <Button variant="contained" color="warning" onClick={handleRemoveNode} size="small">
              Remove
            </Button>
          </Box>
          <Box className="form-group">
            <TextField
              label="Search node"
              type="number"
              value={seacrhValue}
              onChange={(e) => setSeacrhValue(e.target.value)}
            />
            <Button variant="contained" onClick={handleSearch}>
              Seacrh Node
            </Button>
          </Box>
          <Box className="form-group">
            <Button variant="contained" onClick={handleExtractMin} size="small">
              Extract Min
            </Button>
            <Button variant="contained" onClick={handleGetMin} size="small">
              Get Min
            </Button>
            <Button variant="contained" onClick={() => setShowLenght(v => !v)} size="small">
              Get Length
            </Button>
            <Button variant="contained" color="error" onClick={handleClearHeap} size="small">
              Clear
            </Button>
          </Box>
          <Box className="form-group">
            <Button variant="contained" onClick={handlePrint} size="small">
              Print
            </Button>
          </Box>
        </div>
      </div>
      {highlightPath.length > 0 && (
        <Box className="print-result">
          <Typography variant="h6">Search result (in order):</Typography>
          <Typography>
            {seacrhNodes.join(", ")}
          </Typography>
        </Box>
      )}
      {showLenght && heap.length > 0 && (
        <Box className="print-result">
          <Typography>
            Lenght: {heap.length}
          </Typography>
        </Box>
      )}
      {showPrint && printResult.length > 0 && (
        <Box className="print-result">
          <Typography>

            Heap print: {printResult.join(", ")}
          </Typography>
        </Box>
      )}
      {steps[currentStep]?.message && (
        <Typography className="step-message">
          {steps[currentStep].message}
        </Typography>
      )}
    </Container>
  );
};

export default MinHeap;