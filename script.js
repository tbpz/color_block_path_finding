// Puzzle Master - Pathfinding Game
class PuzzleMaster {
    constructor() {
        this.gridSize = 8;
        this.gameBoard = document.getElementById('gameBoard');
        this.congratulationOverlay = document.getElementById('congratulationOverlay');
        
        const rootStyle = getComputedStyle(document.documentElement);
        const boardStyle = getComputedStyle(this.gameBoard);
        this.cellSize = parseInt(rootStyle.getPropertyValue('--cell-size')) || 40;
        this.gap = parseInt(rootStyle.getPropertyValue('--gap-size')) || 2;
        this.boardPadding = parseInt(boardStyle.paddingTop) || 10;

        this.grid = [];
        this.shapes = [];
        this.gates = [];
        this.moveCount = 0;
        this.previewElements = [];
        
        this.isDragging = false;
        this.draggedShape = null;
        this.originalPosition = { startRow: 0, startCol: 0 };
        
        this.pathConnected = false;
        this.numShapes = 10;
        this.shapeDefinitions = this.defineAllShapes();
        
        this.init();
        this.setupButtons();
        this.updateUI();
    }
    
    init() {
        this.createGrid();
        this.createGates();
        this.createRandomShapes();
        this.setupDragAndDrop();
        this.checkPathConnection();
    }
    
    setupButtons() {
        const resetBtn = document.getElementById('resetBtn');
        const replayBtn = document.getElementById('replayBtn');
        
        resetBtn.addEventListener('click', () => this.restartGame());
        replayBtn.addEventListener('click', () => this.restartGame());
    }
    
    restartGame() {
        this.gameBoard.innerHTML = '';
        this.grid = [];
        this.shapes = [];
        this.gates = [];
        this.moveCount = 0;
        this.isDragging = false;
        this.draggedShape = null;
        this.pathConnected = false;
        this.congratulationOverlay.classList.remove('show');
        this.init();
        this.updateUI();
    }
    
    createGrid() {
        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                this.gameBoard.appendChild(cell);
                this.grid[row][col] = {
                    element: cell,
                    isEmpty: true,
                    hasShape: false,
                    shapeId: null,
                    hasGate: false,
                };
            }
        }
    }
    
    defineAllShapes() {
        return {
            long2: { patterns: [ [[1, 1]], [[1], [1]] ] },
            long3: { patterns: [ [[1, 1, 1]], [[1], [1], [1]] ] },
            long4: { patterns: [ [[1, 1, 1, 1]], [[1], [1], [1], [1]] ] },
        };
    }
    
    createGates() {
        const gate1 = { edge: 'top', position: Math.floor(Math.random() * this.gridSize), type: 'start' };
        const gate2 = { edge: 'bottom', position: Math.floor(Math.random() * this.gridSize), type: 'end' };
        this.gates = [gate1, gate2];
        this.placeGate(gate1);
        this.placeGate(gate2);
    }

    placeGate(gate) {
        const gateRow = gate.edge === 'top' ? 0 : this.gridSize - 1;
        const cell = this.grid[gateRow][gate.position];
        cell.hasGate = true;
        cell.isEmpty = true; 
        cell.element.classList.add(`gate-${gate.edge}`);
    }
    
    createRandomShapes() {
        const shapeTypes = Object.keys(this.shapeDefinitions);
        for (let i = 0; i < this.numShapes; i++) {
            const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
            const shapeDef = this.shapeDefinitions[shapeType];
            const pattern = shapeDef.patterns[Math.floor(Math.random() * shapeDef.patterns.length)];
            this.placeRandomShape(pattern, `shape_${i}`);
        }
    }

    placeRandomShape(pattern, shapeId) {
        let placed = false;
        for (let attempts = 0; attempts < 100 && !placed; attempts++) {
            const startRow = Math.floor(Math.random() * (this.gridSize - pattern.length + 1));
            const startCol = Math.floor(Math.random() * (this.gridSize - pattern[0].length + 1));
            if (this.canPlaceShape(pattern, startRow, startCol)) {
                const shape = {
                    id: shapeId,
                    pattern: pattern,
                    orientation: pattern.length === 1 ? 'horizontal' : 'vertical',
                    startRow: startRow,
                    startCol: startCol,
                    color: ['red', 'green', 'blue', 'yellow', 'purple', 'orange'][Math.floor(Math.random() * 6)],
                    elements: []
                };
                this.shapes.push(shape);
                this.placeShapeOnGrid(shape);
                placed = true;
            }
        }
    }
    
    canPlaceShape(pattern, startRow, startCol) {
        for (let r = 0; r < pattern.length; r++) {
            for (let c = 0; c < pattern[r].length; c++) {
                if (pattern[r][c] === 1) {
                    const gridRow = startRow + r;
                    const gridCol = startCol + c;
                    if (gridRow < 0 || gridRow >= this.gridSize || gridCol < 0 || gridCol >= this.gridSize) {
                        return false; // Out of bounds
                    }
                    if (!this.grid[gridRow][gridCol].isEmpty) {
                        return false; // Occupied
                    }
                }
            }
        }
        return true;
    }

    placeShapeOnGrid(shape) {
        // Clear old elements and reset styles
        shape.elements.forEach(el => el.remove());
        shape.elements = [];

        const shapeBlocks = [];
        for (let r = 0; r < shape.pattern.length; r++) {
            for (let c = 0; c < shape.pattern[r].length; c++) {
                if (shape.pattern[r][c] === 1) {
                    shapeBlocks.push({ r, c });
                }
            }
        }

        shapeBlocks.forEach((blockInfo, i) => {
            const gridRow = shape.startRow + blockInfo.r;
            const gridCol = shape.startCol + blockInfo.c;
            this.grid[gridRow][gridCol].isEmpty = false;
            this.grid[gridRow][gridCol].shapeId = shape.id;
            const block = this.createShapeBlock(shape, gridRow, gridCol);
            
            block.classList.add(shape.orientation);

            if (i === 0) {
                block.classList.add('shape-start', 'show-indicator');
            }
            if (i === shapeBlocks.length - 1) {
                block.classList.add('shape-finish', 'show-indicator');
            }
            
            shape.elements.push(block);
            this.gameBoard.appendChild(block);
        });
    }

    createShapeBlock(shape, row, col) {
        const block = document.createElement('div');
        block.className = `shape-block shape-${shape.color}`;
        block.dataset.shapeId = shape.id;
        block.style.position = 'absolute';
        block.style.left = `${col * (this.cellSize + this.gap) + this.boardPadding}px`;
        block.style.top = `${row * (this.cellSize + this.gap) + this.boardPadding}px`;
        block.style.width = `${this.cellSize}px`;
        block.style.height = `${this.cellSize}px`;
        return block;
    }

    removeShapeFromGrid(shape) {
        for (let r = 0; r < shape.pattern.length; r++) {
            for (let c = 0; c < shape.pattern[r].length; c++) {
                if (shape.pattern[r][c] === 1) {
                    this.grid[shape.startRow + r][shape.startCol + c].isEmpty = true;
                    this.grid[shape.startRow + r][shape.startCol + c].shapeId = null;
                }
            }
        }
    }

    setupDragAndDrop() {
        this.gameBoard.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    handleMouseDown(e) {
        const blockElement = e.target.closest('.shape-block');
        if (!blockElement) return;
        
        const shapeId = blockElement.dataset.shapeId;
        const shape = this.shapes.find(s => s.id === shapeId);
        if (!shape) return;

        this.isDragging = true;
        this.draggedShape = shape;
        this.originalPosition = { startRow: shape.startRow, startCol: shape.startCol };

        // Determine offset of the cursor within the shape's overall bounding box
        const boardRect = this.gameBoard.getBoundingClientRect();
        const firstBlockRect = shape.elements[0].getBoundingClientRect();
        const shapePixelLeft = firstBlockRect.left - boardRect.left;
        const shapePixelTop = firstBlockRect.top - boardRect.top;

        this.dragOffset = {
            x: e.clientX - boardRect.left - shapePixelLeft,
            y: e.clientY - boardRect.top - shapePixelTop
        };

        this.draggedShape.lastPixelPosition = { x: shapePixelLeft, y: shapePixelTop };

        this.removeShapeFromGrid(shape); // Remove from data grid

        shape.elements.forEach(el => {
            el.style.zIndex = 1000;
            el.style.transition = 'none';
            el.style.opacity = '0.7';
            el.style.pointerEvents = 'none';
        });
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const boardRect = this.gameBoard.getBoundingClientRect();
        const mouseX = e.clientX - boardRect.left;
        const mouseY = e.clientY - boardRect.top;

        const desiredX = mouseX - this.dragOffset.x;
        const desiredY = mouseY - this.dragOffset.y;
        
        const startX = this.draggedShape.lastPixelPosition.x;
        const startY = this.draggedShape.lastPixelPosition.y;

        let lastValidX = startX;
        let lastValidY = startY;

        const stepSize = this.cellSize / 4;

        if (this.draggedShape.orientation === 'horizontal') {
            const dx = desiredX - startX;
            const distance = Math.abs(dx);
            const numSteps = Math.max(1, Math.ceil(distance / stepSize));
            
            for (let i = 1; i <= numSteps; i++) {
                const intermediateX = startX + (dx * i) / numSteps;
                const gridPos = this.pixelToGridPosition(intermediateX, startY);
                if (this.canPlaceShape(this.draggedShape.pattern, gridPos.row, gridPos.col)) {
                    lastValidX = intermediateX;
                } else {
                    break; // Collision
                }
            }
        } else { // 'vertical'
            const dy = desiredY - startY;
            const distance = Math.abs(dy);
            const numSteps = Math.max(1, Math.ceil(distance / stepSize));

            for (let i = 1; i <= numSteps; i++) {
                const intermediateY = startY + (dy * i) / numSteps;
                const gridPos = this.pixelToGridPosition(startX, intermediateY);
                if (this.canPlaceShape(this.draggedShape.pattern, gridPos.row, gridPos.col)) {
                    lastValidY = intermediateY;
                } else {
                    break; // Collision
                }
            }
        }

        this.draggedShape.lastPixelPosition = { x: lastValidX, y: lastValidY };

        this.updateShapePixelPosition(lastValidX, lastValidY);
        this.updateShapePreview(lastValidX, lastValidY);
    }

    handleMouseUp(e) {
        if (!this.isDragging) return;
        this.isDragging = false;

        this.clearShapePreview();

        const finalPixelX = this.draggedShape.lastPixelPosition.x;
        const finalPixelY = this.draggedShape.lastPixelPosition.y;

        const gridPos = this.pixelToGridPosition(finalPixelX, finalPixelY);
        
        if (this.canPlaceShape(this.draggedShape.pattern, gridPos.row, gridPos.col)) {
            this.draggedShape.startRow = gridPos.row;
            this.draggedShape.startCol = gridPos.col;
        } else {
            this.draggedShape.startRow = this.originalPosition.startRow;
            this.draggedShape.startCol = this.originalPosition.startCol;
        }
        
        this.placeShapeOnGrid(this.draggedShape);
        this.checkPathConnection();
        
        this.draggedShape = null;
    }
    
    updateShapePixelPosition(x, y) {
        const firstBlockPatternOffset = this.getFirstBlockPatternOffset(this.draggedShape);
        if (!firstBlockPatternOffset) return;

        this.draggedShape.elements.forEach((el, i) => {
            const blockPatternOffset = this.getBlockPatternOffset(this.draggedShape, i);
            if (!blockPatternOffset) return;

            const xOffset = (blockPatternOffset.c - firstBlockPatternOffset.c) * (this.cellSize + this.gap);
            const yOffset = (blockPatternOffset.r - firstBlockPatternOffset.r) * (this.cellSize + this.gap);
            
            el.style.left = `${x + xOffset}px`;
            el.style.top = `${y + yOffset}px`;
        });
    }

    pixelToGridPosition(pixelX, pixelY) {
        const cellSizeWithGap = this.cellSize + this.gap;

        const droppedCol = Math.round((pixelX - this.boardPadding) / cellSizeWithGap);
        const droppedRow = Math.round((pixelY - this.boardPadding) / cellSizeWithGap);

        const firstBlockPatternOffset = this.getFirstBlockPatternOffset(this.draggedShape);
        if (!firstBlockPatternOffset) return { row: 0, col: 0 };

        // This calculation determines the grid position for the top-left of the shape's pattern array
        const finalRow = droppedRow - firstBlockPatternOffset.r;
        const finalCol = droppedCol - firstBlockPatternOffset.c;
        
        return { row: finalRow, col: finalCol };
    }

    updateShapePreview(shapeX, shapeY) {
        this.clearShapePreview();
    
        const gridPos = this.pixelToGridPosition(shapeX, shapeY);
        const canPlace = this.canPlaceShape(this.draggedShape.pattern, gridPos.row, gridPos.col);
        
        for (let r = 0; r < this.draggedShape.pattern.length; r++) {
            for (let c = 0; c < this.draggedShape.pattern[r].length; c++) {
                if (this.draggedShape.pattern[r][c] === 1) {
                    const previewRow = gridPos.row + r;
                    const previewCol = gridPos.col + c;
    
                    if (previewRow >= 0 && previewRow < this.gridSize && previewCol >= 0 && previewCol < this.gridSize) {
                        const cell = this.grid[previewRow][previewCol].element;
                        const previewBlock = document.createElement('div');
                        previewBlock.className = 'shape-preview';
                        previewBlock.classList.add(canPlace ? 'valid' : 'invalid');
                        
                        cell.appendChild(previewBlock);
                        this.previewElements.push(previewBlock);
                    }
                }
            }
        }
    }

    clearShapePreview() {
        this.previewElements.forEach(el => el.remove());
        this.previewElements = [];
    }

    getFirstBlockPatternOffset(shape) {
        if (!shape || !shape.pattern) return null;
        for (let r = 0; r < shape.pattern.length; r++) {
            for (let c = 0; c < shape.pattern[r].length; c++) {
                if (shape.pattern[r][c] === 1) {
                    return { r, c };
                }
            }
        }
        return { r: 0, c: 0 }; // Fallback
    }

    getBlockPatternOffset(shape, elementIndex) {
        if (!shape || !shape.pattern) return null;
        let currentIndex = 0;
        for (let r = 0; r < shape.pattern.length; r++) {
            for (let c = 0; c < shape.pattern[r].length; c++) {
                if (shape.pattern[r][c] === 1) {
                    if (currentIndex === elementIndex) {
                        return { r, c };
                    }
                    currentIndex++;
                }
            }
        }
        return { r: 0, c: 0 }; // Fallback
    }

    checkPathExists() {
        const startGate = this.gates.find(g => g.type === 'start');
        const endGate = this.gates.find(g => g.type === 'end');
        if (!startGate || !endGate) return false;
        
        const startNode = { row: 0, col: startGate.position };
        const endNode = { row: this.gridSize - 1, col: endGate.position };

        const queue = [startNode];
        const visited = new Set([`${startNode.row},${startNode.col}`]);

        while (queue.length > 0) {
            const { row, col } = queue.shift();
            if (row === endNode.row && col === endNode.col) {
                this.pathConnected = true;
                return true;
            }
            
            [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;
                if (this.grid[newRow]?.[newCol]?.isEmpty && !visited.has(`${newRow},${newCol}`)) {
                    visited.add(`${newRow},${newCol}`);
                    queue.push({ row: newRow, col: newCol });
                }
            });
        }
        this.pathConnected = false;
        return false;
    }
    
    checkPathConnection() {
        if (this.checkPathExists()) {
            this.pathConnected = true;
            this.showCongratulations();
        } else {
            this.pathConnected = false;
        }
        this.updateUI();
    }
    
    showCongratulations() {
        this.congratulationOverlay.classList.add('show');
    }

    // updateUI and other helpers
    updateUI() {
        const pathStatusEl = document.getElementById('pathStatus');
        if (this.pathConnected) {
            pathStatusEl.textContent = 'Connected';
            pathStatusEl.className = 'status-connected';
        } else {
            pathStatusEl.textContent = 'Disconnected';
            pathStatusEl.className = 'status-disconnected';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new PuzzleMaster());
