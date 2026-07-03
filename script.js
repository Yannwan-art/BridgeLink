// ============================================================
//  BridgeLink GERT Simulation Engine v1.0
//  Features: GERT network visualization + Monte Carlo simulation + Table + ECharts
//  Interaction: Drag labels to bend edges, layout preserved after simulation
//  Chart: ECharts with horizontal centered x-axis labels
// ============================================================

console.log('🚀 BridgeLink GERT Simulation Engine v1.0 loading...');

// ============================================================
//  1. GERT Network Data
// ============================================================

var graphData = {
    nodes: [
        { id: 'Start', label: '🚀 Start', type: 'start' },
        { id: 'A1', label: '📋 Requirements Analysis', type: 'process' },
        { id: 'A2', label: '📊 Technical Assessment', type: 'process' },
        { id: 'B', label: '🔧 Solution Design', type: 'process' },
        { id: 'C', label: '✅ Main Solution', type: 'process' },
        { id: 'D', label: '🔄 Solution Revision', type: 'process' },
        { id: 'E', label: '⚙️ Integration', type: 'process' },
        { id: 'F', label: '🧪 Unit Testing', type: 'process' },
        { id: 'G', label: '🔬 System Testing', type: 'process' },
        { id: 'H', label: '📝 Quality Review', type: 'process' },
        { id: 'End', label: '🏁 Complete', type: 'end' }
    ],
    edges: [
        { id: 'e1', source: 'Start', target: 'A1', label: 'p=1.00 μ=1.0', prob: 1.0, timeDist: 'const', timeParam: 1, controlPoints: [] },
        { id: 'e2', source: 'A1', target: 'B', label: 'p=0.70 μ=3.0', prob: 0.70, timeDist: 'const', timeParam: 3, controlPoints: [] },
        { id: 'e3', source: 'A1', target: 'A2', label: 'p=0.30 μ=4.0', prob: 0.30, timeDist: 'const', timeParam: 4, controlPoints: [] },
        { id: 'e4', source: 'A2', target: 'H', label: 'p=1.00 μ=5.0', prob: 1.0, timeDist: 'const', timeParam: 5, controlPoints: [] },
        { id: 'e5', source: 'B', target: 'C', label: 'p=1.00 μ=4.0', prob: 1.0, timeDist: 'const', timeParam: 4, controlPoints: [] },
        { id: 'e6', source: 'C', target: 'D', label: 'p=0.35 μ=4.0', prob: 0.35, timeDist: 'exp', timeParam: 4, controlPoints: [] },
        { id: 'e7', source: 'D', target: 'C', label: 'p=0.50 μ=3.0', prob: 0.50, timeDist: 'exp', timeParam: 3, controlPoints: [] },
        { id: 'e8', source: 'D', target: 'B', label: 'p=0.50 μ=5.0', prob: 0.50, timeDist: 'exp', timeParam: 5, controlPoints: [] },
        { id: 'e9', source: 'C', target: 'E', label: 'p=0.65 μ=2.0', prob: 0.65, timeDist: 'const', timeParam: 2, controlPoints: [] },
        { id: 'e10', source: 'E', target: 'F', label: 'p=0.55 μ=7.0', prob: 0.55, timeDist: 'exp', timeParam: 7, controlPoints: [] },
        { id: 'e11', source: 'E', target: 'G', label: 'p=0.45 μ=8.0', prob: 0.45, timeDist: 'exp', timeParam: 8, controlPoints: [] },
        { id: 'e12', source: 'F', target: 'E', label: 'p=0.30 μ=6.0', prob: 0.30, timeDist: 'exp', timeParam: 6, controlPoints: [] },
        { id: 'e13', source: 'G', target: 'E', label: 'p=0.25 μ=7.0', prob: 0.25, timeDist: 'exp', timeParam: 7, controlPoints: [] },
        { id: 'e14', source: 'F', target: 'H', label: 'p=0.70 μ=2.0', prob: 0.70, timeDist: 'const', timeParam: 2, controlPoints: [] },
        { id: 'e15', source: 'G', target: 'H', label: 'p=0.75 μ=2.0', prob: 0.75, timeDist: 'const', timeParam: 2, controlPoints: [] },
        { id: 'e16', source: 'H', target: 'End', label: 'p=0.85 μ=4.0', prob: 0.85, timeDist: 'exp', timeParam: 4, controlPoints: [] },
        { id: 'e17', source: 'H', target: 'B', label: 'p=0.15 μ=6.0', prob: 0.15, timeDist: 'exp', timeParam: 6, controlPoints: [] }
    ]
};

// Save original edge label data (for reset)
var edgeLabelData = {};
graphData.edges.forEach(function(e) {
    edgeLabelData[e.id] = {
        label: e.label,
        prob: e.prob,
        timeParam: e.timeParam,
        timeDist: e.timeDist
    };
});

// Apply styles to edges
graphData.edges.forEach(function(edge) {
    var isFeedback = ['e6', 'e7', 'e8', 'e12', 'e13', 'e17'].indexOf(edge.id) !== -1;
    var isBranch = ['e3', 'e4'].indexOf(edge.id) !== -1;
    var color, lineWidth, lineDash;
    if (!isFeedback && !isBranch) {
        color = '#1677ff';
        lineWidth = 2.0;
        lineDash = [];
    } else if (isBranch) {
        color = '#fa8c16';
        lineWidth = 1.8;
        lineDash = [];
    } else {
        color = '#ff4d4f';
        lineWidth = 1.8;
        lineDash = [6, 4];
    }
    edge.style = { stroke: color, lineWidth: lineWidth, lineDash: lineDash };
});

console.log('📊 graphData loaded: nodes=' + graphData.nodes.length + ', edges=' + graphData.edges.length);

// ============================================================
//  2. Utility Functions
// ============================================================

function getEdgeEndpoints(edgeId) {
    var edge = graphData.edges.find(function(e) { return e.id === edgeId; });
    if (!edge) return null;

    var sourceNode = graphData.nodes.find(function(n) { return n.id === edge.source; });
    var targetNode = graphData.nodes.find(function(n) { return n.id === edge.target; });
    if (!sourceNode || !targetNode) return null;

    var sx = sourceNode.x || 0, sy = sourceNode.y || 0;
    var tx = targetNode.x || 0, ty = targetNode.y || 0;

    if (sx === 0 && sy === 0) {
        try {
            var item = graph.findById(sourceNode.id);
            if (item) {
                var bbox = item.getBBox();
                sx = bbox.centerX;
                sy = bbox.centerY;
            }
        } catch (e) {}
    }
    if (tx === 0 && ty === 0) {
        try {
            var item = graph.findById(targetNode.id);
            if (item) {
                var bbox = item.getBBox();
                tx = bbox.centerX;
                ty = bbox.centerY;
            }
        } catch (e) {}
    }
    return { sx: sx, sy: sy, tx: tx, ty: ty };
}

function getEdgeMidpoint(edgeId) {
    var ep = getEdgeEndpoints(edgeId);
    if (!ep) return null;
    return { x: (ep.sx + ep.tx) / 2, y: (ep.sy + ep.ty) / 2 };
}

function isPointOnLabel(edgeId, px, py) {
    var mid = getEdgeMidpoint(edgeId);
    if (!mid) return false;
    return Math.abs(px - mid.x) < 50 && Math.abs(py - mid.y) < 20;
}

// ============================================================
//  3. G6 Network Graph Rendering
// ============================================================

var graph = null;
var isDraggingLabel = false;
var dragEdgeId = null;
var hoveredEdgeId = null;

function getCleanEdges() {
    return graphData.edges.map(function(e) {
        return {
            id: e.id,
            source: e.source,
            target: e.target,
            prob: e.prob,
            timeDist: e.timeDist,
            timeParam: e.timeParam,
            label: e.label,
            style: e.style || {},
            controlPoints: e.controlPoints || []
        };
    });
}

function initGraph() {
    console.log('🔄 initGraph() called...');
    
    var container = document.getElementById('graph-container');
    if (!container) {
        console.warn('⚠️ graph-container not found');
        return;
    }

    var mask = document.getElementById('loading-mask');
    if (mask) mask.classList.add('hidden');

    if (typeof G6 === 'undefined') {
        console.error('❌ G6 library not loaded');
        var statusEl = document.getElementById('statusText');
        if (statusEl) {
            statusEl.textContent = 'G6 load failed, refresh and retry';
            statusEl.className = 'error';
        }
        return;
    }

    if (graph) {
        graph.destroy();
        graph = null;
    }

    var width = container.clientWidth || 800;
    var height = container.clientHeight || 600;

    console.log('📐 Graph container size: ' + width + 'x' + height);

    try {
        graph = new G6.Graph({
            container: 'graph-container',
            width: width,
            height: height,
            fitView: true,
            fitViewPadding: [40, 60, 40, 60],
            layout: {
                type: 'dagre',
                rankdir: 'LR',
                align: 'UL',
                nodesep: 35,
                ranksep: 55,
                controlPoints: true
            },
            modes: {
                default: ['drag-node', 'drag-canvas', 'zoom-canvas']
            },
            defaultNode: {
                type: 'circle',
                size: 48,
                style: {
                    fill: '#ffffff',
                    stroke: '#1677ff',
                    lineWidth: 2.5,
                    shadowColor: 'rgba(22,119,255,0.10)',
                    shadowBlur: 8
                },
                labelCfg: {
                    style: {
                        fill: '#1d2129',
                        fontSize: 11,
                        fontWeight: 600
                    },
                    position: 'bottom',
                    offset: 8
                }
            },
            defaultEdge: {
                type: 'polyline',
                style: {
                    stroke: '#8c8c8c',
                    lineWidth: 1.8,
                    endArrow: {
                        path: G6.Arrow.triangle(6, 8, 0),
                        fill: '#8c8c8c',
                        stroke: '#8c8c8c',
                        lineWidth: 1.0
                    }
                },
                labelCfg: {
                    style: {
                        fill: '#1d2129',
                        fontSize: 10,
                        fontWeight: 600,
                        background: {
                            fill: '#ffffff',
                            padding: [4, 12, 4, 12],
                            radius: 6,
                            shadowColor: 'rgba(0,0,0,0.06)',
                            shadowBlur: 8
                        },
                        textAlign: 'center',
                        textBaseline: 'middle'
                    },
                    autoRotate: true
                },
                radius: 20
            },
            nodeStateStyles: {
                start: {
                    style: {
                        fill: '#e6f7ff',
                        stroke: '#1677ff',
                        lineWidth: 3,
                        shadowColor: 'rgba(22,119,255,0.20)',
                        shadowBlur: 14
                    }
                },
                end: {
                    style: {
                        fill: '#f6ffed',
                        stroke: '#52c41a',
                        lineWidth: 3,
                        shadowColor: 'rgba(82,196,26,0.20)',
                        shadowBlur: 14
                    }
                }
            }
        });

        graph.data(graphData);
        graph.render();
        graph.fitView();

        document.getElementById('nodeCount').textContent = graphData.nodes.length;
        document.getElementById('edgeCount').textContent = graphData.edges.length;

        var statusEl = document.getElementById('statusText');
        if (statusEl) {
            statusEl.textContent = 'Ready (drag label to bend edge)';
            statusEl.className = '';
        }

        console.log('✅ G6 graph rendered successfully! Nodes: ' + graphData.nodes.length + ', Edges: ' + graphData.edges.length);

        // ============================================================
        //  Interaction: Drag label to bend edge
        // ============================================================

        graph.on('mousedown', function(e) {
            var canvasPoint = graph.getPointByClient(e.clientX, e.clientY);
            if (!canvasPoint) return;

            var mx = canvasPoint.x;
            var my = canvasPoint.y;

            var targetEdgeId = null;
            for (var i = 0; i < graphData.edges.length; i++) {
                var edge = graphData.edges[i];
                if (isPointOnLabel(edge.id, mx, my)) {
                    targetEdgeId = edge.id;
                    break;
                }
            }

            if (targetEdgeId) {
                isDraggingLabel = true;
                dragEdgeId = targetEdgeId;

                var mid = getEdgeMidpoint(dragEdgeId);
                if (mid) {
                    var edgeData = graphData.edges.find(function(ed) { return ed.id === dragEdgeId; });
                    if (edgeData && edgeData.controlPoints.length === 0) {
                        edgeData.controlPoints = [{ x: mid.x, y: mid.y }];
                        graph.updateItem(dragEdgeId, { controlPoints: edgeData.controlPoints });
                        graph.paint();
                    }
                }

                document.getElementById('graph-container').style.cursor = 'grabbing';

                var statusEl = document.getElementById('statusText');
                if (statusEl) {
                    statusEl.textContent = '↗️ Dragging label...';
                    statusEl.className = 'running';
                }

                e.originalEvent.preventDefault();
            }
        });

        graph.on('mousemove', function(e) {
            if (!isDraggingLabel || !dragEdgeId) {
                var canvasPoint = graph.getPointByClient(e.clientX, e.clientY);
                if (canvasPoint) {
                    var found = false;
                    for (var i = 0; i < graphData.edges.length; i++) {
                        if (isPointOnLabel(graphData.edges[i].id, canvasPoint.x, canvasPoint.y)) {
                            found = true;
                            break;
                        }
                    }
                    document.getElementById('graph-container').style.cursor = found ? 'grab' : 'default';
                }
                return;
            }

            var canvasPoint = graph.getPointByClient(e.clientX, e.clientY);
            if (!canvasPoint) return;

            var edgeData = graphData.edges.find(function(ed) { return ed.id === dragEdgeId; });
            if (edgeData) {
                if (edgeData.controlPoints.length === 0) {
                    edgeData.controlPoints = [{ x: canvasPoint.x, y: canvasPoint.y }];
                } else {
                    edgeData.controlPoints[0].x = canvasPoint.x;
                    edgeData.controlPoints[0].y = canvasPoint.y;
                }
                graph.updateItem(dragEdgeId, { controlPoints: edgeData.controlPoints });
                graph.paint();
            }
        });

        graph.on('mouseup', function(e) {
            if (isDraggingLabel && dragEdgeId) {
                var edgeData = graphData.edges.find(function(ed) { return ed.id === dragEdgeId; });
                if (edgeData && edgeData.controlPoints.length > 0) {
                    var cp = edgeData.controlPoints[0];
                    var ep = getEdgeEndpoints(dragEdgeId);
                    if (ep) {
                        var dx = ep.tx - ep.sx;
                        var dy = ep.ty - ep.sy;
                        var len = Math.sqrt(dx * dx + dy * dy);
                        if (len > 0) {
                            var dist = Math.abs((ep.tx - ep.sx) * (ep.sy - cp.y) - (ep.sx - cp.x) * (ep.ty - ep.sy)) / len;
                            if (dist < 10) {
                                edgeData.controlPoints = [];
                                graph.updateItem(dragEdgeId, { controlPoints: [] });
                                graph.paint();
                                var statusEl = document.getElementById('statusText');
                                if (statusEl) {
                                    statusEl.textContent = '↩️ Snapped to straight line';
                                    statusEl.className = 'success';
                                    setTimeout(function() {
                                        statusEl.textContent = 'Ready (drag label to bend edge)';
                                        statusEl.className = '';
                                    }, 1200);
                                }
                                isDraggingLabel = false;
                                dragEdgeId = null;
                                document.getElementById('graph-container').style.cursor = 'default';
                                return;
                            }
                        }
                    }

                    var statusEl = document.getElementById('statusText');
                    if (statusEl) {
                        statusEl.textContent = '✅ Edge bent (double-click to restore straight)';
                        statusEl.className = 'success';
                        setTimeout(function() {
                            statusEl.textContent = 'Ready (drag label to bend edge)';
                            statusEl.className = '';
                        }, 2000);
                    }
                }

                isDraggingLabel = false;
                dragEdgeId = null;
                document.getElementById('graph-container').style.cursor = 'default';
            }
        });

        graph.on('mouseleave', function(e) {
            if (isDraggingLabel) {
                isDraggingLabel = false;
                dragEdgeId = null;
                document.getElementById('graph-container').style.cursor = 'default';
            }
        });

        // ============================================================
        //  Double-click edge: restore straight + popup
        // ============================================================
        graph.on('edge:dblclick', function(e) {
            var model = e.item.getModel();
            var edgeId = model.id;
            var edgeData = graphData.edges.find(function(ed) { return ed.id === edgeId; });

            if (edgeData && edgeData.controlPoints.length > 0) {
                edgeData.controlPoints = [];
                graph.updateItem(edgeId, { controlPoints: [] });
                graph.paint();

                var statusEl = document.getElementById('statusText');
                if (statusEl) {
                    statusEl.textContent = '↩️ Restored to straight line';
                    statusEl.className = 'success';
                    setTimeout(function() {
                        statusEl.textContent = 'Ready (drag label to bend edge)';
                        statusEl.className = '';
                    }, 1500);
                }
            }

            var distMap = { 'const': 'Constant Time', 'exp': 'Exponential Distribution' };
            var distLabel = distMap[model.timeDist] || model.timeDist;
            var paramLabel = (model.timeDist === 'exp') ? 'Mean Duration (μ)' : 'Fixed Value (t)';
            var isBent = (edgeData && edgeData.controlPoints.length > 0) ? '✅ Bent' : '➖ Straight';

            alert(
                '🔗 Edge Info\n\n' +
                'Edge Label: ' + model.label + '\n' +
                'Transition Probability (p): ' + model.prob + '\n' +
                'Time Distribution: ' + distLabel + '\n' +
                paramLabel + ': ' + model.timeParam + '\n\n' +
                '📐 Bend Status: ' + isBent + '\n' +
                '💡 Drag label to bend edge, double-click to restore straight'
            );
        });

        // ============================================================
        //  Node click event
        // ============================================================
        graph.on('node:click', function(e) {
            var model = e.item.getModel();
            var typeMap = { 'start': 'Start', 'end': 'End', 'process': 'Process' };
            alert(
                '📌 Node Info\n\n' +
                'Name: ' + model.label + '\n' +
                'ID: ' + model.id + '\n' +
                'Type: ' + (typeMap[model.type] || 'Process')
            );
        });

        // ============================================================
        //  Window resize handler
        // ============================================================
        var resizeHandler = function() {
            if (graph) {
                var container2 = document.getElementById('graph-container');
                var w = container2.clientWidth;
                var h = container2.clientHeight;
                if (w > 0 && h > 0) {
                    graph.changeSize(w, h);
                    graph.fitView();
                }
            }
        };
        window.addEventListener('resize', resizeHandler);

        console.log('✅ GERT network rendered (label draggable to bend)');

    } catch (error) {
        console.error('❌ G6 render error:', error);
        var statusEl = document.getElementById('statusText');
        if (statusEl) {
            statusEl.textContent = 'Render error: ' + error.message;
            statusEl.className = 'error';
        }
    }
}

// ============================================================
//  4. Monte Carlo Simulation Engine
// ============================================================

function sampleExponential(mean) {
    return -mean * Math.log(1 - Math.random() + 1e-10);
}

function simulateSinglePath(edges) {
    var currentNode = 'Start';
    var totalTime = 0;
    var iter = 0;
    var maxIter = 500;

    while (currentNode !== 'End' && iter < maxIter) {
        iter++;
        var outgoing = edges.filter(function(e) { return e.source === currentNode; });
        if (outgoing.length === 0) break;

        var rand = Math.random();
        var cumulative = 0;
        var selected = outgoing[outgoing.length - 1];
        for (var i = 0; i < outgoing.length; i++) {
            cumulative += outgoing[i].prob;
            if (rand <= cumulative) {
                selected = outgoing[i];
                break;
            }
        }

        var duration = 0;
        if (selected.timeDist === 'exp') {
            duration = sampleExponential(selected.timeParam);
        } else {
            duration = selected.timeParam || 1;
        }
        totalTime += duration;
        currentNode = selected.target;
        if (currentNode === 'End') break;
    }
    return totalTime;
}

function applyScheme(edges, scheme) {
    var e2 = edges.find(function(e) { return e.id === 'e2'; });
    var e3 = edges.find(function(e) { return e.id === 'e3'; });
    var e6 = edges.find(function(e) { return e.id === 'e6'; });
    var e7 = edges.find(function(e) { return e.id === 'e7'; });
    var e12 = edges.find(function(e) { return e.id === 'e12'; });
    var e13 = edges.find(function(e) { return e.id === 'e13'; });
    var e16 = edges.find(function(e) { return e.id === 'e16'; });
    var e17 = edges.find(function(e) { return e.id === 'e17'; });

    switch (scheme) {
        case 'S0': break;
        case 'S1-1':
            if (e2) e2.prob = 0.85;
            if (e3) e3.prob = 0.15;
            break;
        case 'S1-2':
            if (e2) e2.prob = 0.50;
            if (e3) e3.prob = 0.50;
            break;
        case 'S2-1':
            if (e6) e6.timeParam = 2;
            if (e7) e7.timeParam = 2;
            if (e12) e12.timeParam = 3;
            if (e13) e13.timeParam = 3;
            break;
        case 'S2-2':
            if (e6) e6.timeParam = 8;
            if (e7) e7.timeParam = 8;
            if (e12) e12.timeParam = 10;
            if (e13) e13.timeParam = 10;
            break;
        case 'S3-1':
            if (e17) e17.prob = 0.30;
            if (e16) e16.prob = 0.70;
            break;
        case 'S3-2':
            if (e17) e17.prob = 0.05;
            if (e16) e16.prob = 0.95;
            break;
        default: break;
    }

    for (var j = 0; j < edges.length; j++) {
        var edge = edges[j];
        if (edge.prob !== undefined) {
            var pStr = edge.prob.toFixed(2);
            var muStr = edge.timeParam !== undefined ? edge.timeParam.toFixed(1) : '?';
            edge.label = 'p=' + pStr + ' μ=' + muStr;
        }
    }
}

function runMonteCarlo(N, edges, options) {
    var workingEdges = JSON.parse(JSON.stringify(edges));

    if (options && options.scheme) {
        applyScheme(workingEdges, options.scheme);
    }

    var samples = [];
    var batchSize = 100;
    var totalBatches = Math.ceil(N / batchSize);

    for (var batch = 0; batch < totalBatches; batch++) {
        var batchEnd = Math.min((batch + 1) * batchSize, N);
        for (var i = 0; i < batchEnd - batch * batchSize; i++) {
            samples.push(simulateSinglePath(workingEdges));
        }
        var progress = ((batch + 1) / totalBatches * 100);
        updateProgress(progress, 'Simulating ' + Math.round(progress) + '%');
    }

    var sum = 0;
    for (var k = 0; k < samples.length; k++) {
        sum += samples[k];
    }
    var mean = sum / N;

    var sumSq = 0;
    for (var m = 0; m < samples.length; m++) {
        sumSq += (samples[m] - mean) * (samples[m] - mean);
    }
    var std = Math.sqrt(sumSq / N);
    var cv = mean !== 0 ? std / mean : 0;

    return {
        mean: mean,
        std: std,
        cv: cv,
        samples: samples,
        N: N
    };
}

// ============================================================
//  5. UI Control + Table + ECharts
// ============================================================

var echartsInstance = null;
var lastResults = {};

var schemeList = [
    { id: 'S0', label: 'Baseline' },
    { id: 'S1-1', label: 'Main↑' },
    { id: 'S1-2', label: 'Main↓' },
    { id: 'S2-1', label: 'Feed↓' },
    { id: 'S2-2', label: 'Feed↑' },
    { id: 'S3-1', label: 'Rev↑' },
    { id: 'S3-2', label: 'Rev↓' }
];

function updateProgress(pct, text) {
    var bar = document.getElementById('progress-bar');
    var fill = document.getElementById('progressFill');
    var txt = document.getElementById('progressText');
    if (bar) bar.style.display = 'block';
    if (fill) fill.style.width = Math.min(pct, 100) + '%';
    if (txt) txt.textContent = text || Math.round(pct) + '%';
}

function updateTable() {
    var tbody = document.getElementById('tableBody');
    if (!tbody) return;

    var html = '';
    for (var i = 0; i < schemeList.length; i++) {
        var s = schemeList[i];
        var result = lastResults[s.id];
        var meanVal = result ? result.mean.toFixed(2) : '—';
        var stdVal = result ? result.std.toFixed(2) : '—';
        var colorMean = result ? '#1677ff' : '#bfbfbf';
        var colorStd = result ? '#52c41a' : '#bfbfbf';

        html += '<tr>';
        html += '  <td>' + s.label + '</td>';
        html += '  <td style="color:' + colorMean + '; font-weight:600;">' + meanVal + '</td>';
        html += '  <td style="color:' + colorStd + '; font-weight:600;">' + stdVal + '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;

    var statusEl = document.getElementById('chartStatus');
    if (statusEl) {
        var count = 0;
        for (var key in lastResults) { if (lastResults[key]) count++; }
        if (count > 0) {
            statusEl.textContent = '✅ ' + count + ' scheme(s) run, click Generate Chart';
            statusEl.style.color = '#52c41a';
        } else {
            statusEl.textContent = '⏳ Run schemes to populate table data';
            statusEl.style.color = '#8c8c8c';
        }
    }
}

// ============================================================
//  Core Fix: Update only edge labels, do NOT re-render entire graph
// ============================================================

function updateEdgeLabelsOnly() {
    if (!graph) return;

    var edges = graphData.edges;
    for (var j = 0; j < edges.length; j++) {
        var edge = edges[j];
        if (edge.prob !== undefined) {
            var pStr = edge.prob.toFixed(2);
            var muStr = edge.timeParam !== undefined ? edge.timeParam.toFixed(1) : '?';
            var newLabel = 'p=' + pStr + ' μ=' + muStr;
            edge.label = newLabel;

            try {
                var item = graph.findById(edge.id);
                if (item) {
                    item.update({
                        label: newLabel
                    });
                }
            } catch (e) {
                // Edge not found, ignore
            }
        }
    }

    if (graph) {
        graph.paint();
    }

    console.log('✅ Edge labels updated, layout preserved');
}

// ============================================================
//  Run Simulation (no layout reset)
// ============================================================

function runSimulation() {
    var N = parseInt(document.getElementById('simCount').value) || 1000;
    var scheme = document.getElementById('schemeSelect').value;

    var statusEl = document.getElementById('statusText');
    statusEl.textContent = '⏳ Simulation running...';
    statusEl.className = 'running';

    document.getElementById('meanValue').textContent = '...';
    document.getElementById('stdValue').textContent = '...';
    document.getElementById('cvValue').textContent = '...';
    document.getElementById('sampleCount').textContent = '...';
    document.getElementById('resultBadge').style.display = 'none';

    updateProgress(0, 'Initializing simulation...');

    setTimeout(function() {
        try {
            var cleanEdges = getCleanEdges();
            var result = runMonteCarlo(N, cleanEdges, { scheme: scheme });
            lastResults[scheme] = result;

            document.getElementById('meanValue').textContent = result.mean.toFixed(2);
            document.getElementById('stdValue').textContent = result.std.toFixed(2);
            document.getElementById('cvValue').textContent = result.cv.toFixed(4);
            document.getElementById('sampleCount').textContent = result.N;
            document.getElementById('resultBadge').style.display = 'inline';

            statusEl.textContent = '✅ Simulation complete';
            statusEl.className = 'success';

            updateProgress(100, '✅ Simulation complete!');

            setTimeout(function() {
                var bar = document.getElementById('progress-bar');
                if (bar) bar.style.display = 'none';
            }, 1500);

            updateEdgeLabelsOnly();
            updateTable();

        } catch (error) {
            console.error('Simulation error:', error);
            statusEl.textContent = '❌ Simulation error: ' + error.message;
            statusEl.className = 'error';
            updateProgress(0, '❌ Error');
        }
    }, 100);
}

// ============================================================
//  Generate Bar Chart with ECharts (horizontal labels, centered)
// ============================================================

function generateChart() {
    var container = document.getElementById('chart-container');
    var statusEl = document.getElementById('chartStatus');

    if (!container) {
        console.warn('⚠️ chart-container not found');
        if (statusEl) {
            statusEl.textContent = '⚠️ Chart container not found';
            statusEl.style.color = '#ff4d4f';
        }
        return;
    }

    var hasData = false;
    var dataCount = 0;
    for (var i = 0; i < schemeList.length; i++) {
        if (lastResults[schemeList[i].id]) {
            hasData = true;
            dataCount++;
        }
    }

    if (!hasData) {
        if (statusEl) {
            statusEl.textContent = '⚠️ Please run schemes first to populate data';
            statusEl.style.color = '#faad14';
        }
        return;
    }

    if (typeof echarts === 'undefined') {
        console.error('❌ ECharts not loaded');
        if (statusEl) {
            statusEl.textContent = '❌ ECharts library not loaded, please refresh';
            statusEl.style.color = '#ff4d4f';
        }
        return;
    }

    if (echartsInstance) {
        echartsInstance.dispose();
        echartsInstance = null;
    }

    echartsInstance = echarts.init(container);

    var labels = [];
    var means = [];
    var stds = [];

    for (var j = 0; j < schemeList.length; j++) {
        var s = schemeList[j];
        var result = lastResults[s.id];
        labels.push(s.label);
        if (result) {
            means.push(Math.round(result.mean * 10) / 10);
            stds.push(Math.round(result.std * 10) / 10);
        } else {
            means.push(null);
            stds.push(null);
        }
    }

    var option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function(params) {
                var html = '<strong>' + params[0].name + '</strong><br/>';
                for (var k = 0; k < params.length; k++) {
                    var p = params[k];
                    if (p.value !== null && p.value !== undefined) {
                        html += p.marker + ' ' + p.seriesName + ': ' + p.value.toFixed(2) + '<br/>';
                    }
                }
                return html;
            }
        },
        legend: {
            data: ['Mean', 'Std Dev'],
            top: 2,
            right: 0,
            icon: 'roundRect',
            itemWidth: 18,
            itemHeight: 8,
            textStyle: { fontSize: 12, fontWeight: '500' }
        },
        grid: {
            left: 50,
            right: 20,
            top: 45,
            bottom: 60
        },
        xAxis: {
            type: 'category',
            data: labels,
            axisLabel: {
                fontSize: 10,
                fontWeight: '600',
                color: '#1d2129',
                interval: 0,
                rotate: 0,
                margin: 8
            },
            axisLine: { lineStyle: { color: '#e8ecf1' } },
            axisTick: { alignWithLabel: true }
        },
        yAxis: {
            type: 'value',
            name: 'Time (units)',
            nameTextStyle: { fontSize: 11, color: '#8c8c8c' },
            splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
            axisLabel: { fontSize: 11 }
        },
        series: [{
            name: 'Mean',
            type: 'bar',
            data: means,
            barWidth: '28%',
            itemStyle: {
                color: '#1677ff',
                borderRadius: [4, 4, 0, 0]
            },
            label: {
                show: true,
                position: 'top',
                formatter: function(params) {
                    return params.value !== null ? params.value.toFixed(1) : '';
                },
                fontSize: 10,
                color: '#1d2129',
                fontWeight: 600
            }
        }, {
            name: 'Std Dev',
            type: 'bar',
            data: stds,
            barWidth: '28%',
            itemStyle: {
                color: '#52c41a',
                borderRadius: [4, 4, 0, 0]
            },
            label: {
                show: true,
                position: 'top',
                formatter: function(params) {
                    return params.value !== null ? params.value.toFixed(1) : '';
                },
                fontSize: 10,
                color: '#1d2129',
                fontWeight: 600
            }
        }]
    };

    echartsInstance.setOption(option);
    echartsInstance.resize();

    if (statusEl) {
        statusEl.textContent = '✅ Chart generated, labels perfectly centered (data: ' + dataCount + ' schemes)';
        statusEl.style.color = '#52c41a';
    }

    console.log('📊 ECharts chart generated successfully');
}

// ============================================================
//  Clear Chart
// ============================================================

function clearChart() {
    var statusEl = document.getElementById('chartStatus');

    if (echartsInstance) {
        echartsInstance.dispose();
        echartsInstance = null;
    }

    var container = document.getElementById('chart-container');
    if (container) {
        container.innerHTML = '';
    }

    if (statusEl) {
        var count = 0;
        for (var key in lastResults) { if (lastResults[key]) count++; }
        if (count > 0) {
            statusEl.textContent = '✅ Chart cleared, can regenerate (' + count + ' schemes available)';
            statusEl.style.color = '#1677ff';
        } else {
            statusEl.textContent = '⏳ Run schemes to populate table data';
            statusEl.style.color = '#8c8c8c';
        }
    }

    console.log('📊 Chart cleared');
}

// ============================================================
//  Reset Network
// ============================================================

function resetNetwork() {
    graphData.edges.forEach(function(e) {
        e.controlPoints = [];
        var data = edgeLabelData[e.id];
        if (data) {
            e.label = data.label;
            e.prob = data.prob;
            e.timeParam = data.timeParam;
            e.timeDist = data.timeDist;
        }
    });

    lastResults = {};
    document.getElementById('meanValue').textContent = '—';
    document.getElementById('stdValue').textContent = '—';
    document.getElementById('cvValue').textContent = '—';
    document.getElementById('sampleCount').textContent = '—';
    document.getElementById('resultBadge').style.display = 'none';

    var statusEl = document.getElementById('statusText');
    statusEl.textContent = 'Ready (drag label to bend edge)';
    statusEl.className = '';

    document.getElementById('schemeSelect').value = 'S0';

    var bar = document.getElementById('progress-bar');
    if (bar) bar.style.display = 'none';

    if (echartsInstance) {
        echartsInstance.dispose();
        echartsInstance = null;
    }
    var container = document.getElementById('chart-container');
    if (container) {
        container.innerHTML = '';
    }

    var chartStatus = document.getElementById('chartStatus');
    if (chartStatus) {
        chartStatus.textContent = '⏳ Run schemes to populate table data';
        chartStatus.style.color = '#8c8c8c';
    }

    updateTable();

    if (graph) {
        graph.data(graphData);
        graph.render();
        graph.fitView();
    } else {
        initGraph();
    }
}

// ============================================================
//  Update Scheme Options (add S3-1, S3-2)
// ============================================================

function updateSchemeOptions() {
    var select = document.getElementById('schemeSelect');
    if (!select) return;

    var hasS3 = false;
    for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === 'S3-1') {
            hasS3 = true;
            break;
        }
    }

    if (!hasS3) {
        var opt1 = document.createElement('option');
        opt1.value = 'S3-1';
        opt1.text = '🔄 S3-1 - Review Fail Prob ↑';
        select.appendChild(opt1);

        var opt2 = document.createElement('option');
        opt2.value = 'S3-2';
        opt2.text = '✅ S3-2 - Review Fail Prob ↓';
        select.appendChild(opt2);
    }
}

// ============================================================
//  Initialize on page load
// ============================================================

window.addEventListener('load', function() {
    console.log('📄 Page fully loaded, initializing...');
    setTimeout(function() {
        updateSchemeOptions();
        updateTable();
        initGraph();
    }, 500);
});

// ============================================================
//  Handle window resize for ECharts
// ============================================================

window.addEventListener('resize', function() {
    if (echartsInstance) {
        echartsInstance.resize();
    }
});

// ============================================================
//  Global Exports
// ============================================================

window.runSimulation = runSimulation;
window.resetNetwork = resetNetwork;
window.initGraph = initGraph;
window.getCleanEdges = getCleanEdges;
window.generateChart = generateChart;
window.clearChart = clearChart;

console.log('✅ BridgeLink GERT Simulation Engine v1.0 (ECharts) loaded');
console.log('📊 Nodes:', graphData.nodes.length, ' Edges:', graphData.edges.length);
console.log('📐 Interaction: Drag label to bend edge, layout preserved after simulation');
console.log('📊 Chart: ECharts with horizontally centered x-axis labels');