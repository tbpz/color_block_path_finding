// Puzzle Master - Pathfinding Game
class PuzzleMaster {
    init() {
        this.gridSize = 8;
        this.gameBoard = document.getElementById('gameBoard');
        this.gameContainer = this.gameBoard.closest('.game-container');
        
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
        this.winningPath = [];
        
        this.isDragging = false;
        this.draggedShape = null;
        this.originalPosition = { startRow: 0, startCol: 0 };
        
        this.pathConnected = false;
        this.numShapes = 10;
        this.shapeDefinitions = this.defineAllShapes();
        
        this.generationOverlay = document.getElementById('generationOverlay');
        
        this.generateAndCheckBoard();
    }
    
    async generateAndCheckBoard() {
        this.generationOverlay.classList.add('show');
        let boardIsValid = false;
        let attempts = 0;
        
        while (!boardIsValid && attempts < 100) { // Increased attempts for stricter validation
            attempts++;
            console.log(`Generation attempt: ${attempts}`);
            
            this.setupNewBoard();
            
            // Check 1: Is it already won?
            const isAlreadyWon = !!this.checkPathExists();
            if (isAlreadyWon) {
                console.log(`Attempt #${attempts} was already solved. Regenerating.`);
                continue; // Board is invalid, try again.
            }

            // Check 2: Is it solvable?
            const isSolvable = this.isSolvable();
            if (!isSolvable) {
                console.log(`Attempt #${attempts} was NOT solvable. Regenerating.`);
                continue; // Board is invalid, try again.
            }

            // If we get here, the board is valid!
            boardIsValid = true;
        }

        if (!boardIsValid) {
            console.error("Failed to generate a valid puzzle after multiple attempts.");
            alert("Could not generate a solvable, non-winning puzzle. Please refresh the page to try again.");
        } else {
            console.log(`Successfully generated a valid board in ${attempts} attempts!`);
        }

        this.generationOverlay.classList.remove('show');
    }
    
    setupNewBoard() {
        this.gameBoard.innerHTML = '';
        this.grid = [];
        this.shapes = [];
        this.gates = [];
        this.moveCount = 0;
        this.winningPath = [];
        this.pathConnected = false;
        this.isDragging = false;
        
        this.createGrid();
        this.createGates();
        this.createRandomShapes();
        
        this.setupButtons();
        this.setupDragAndDrop();
        this.checkPathConnection();
        this.updateUI();
    }
    
    setupButtons() {
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.restartGame());
        }
    }
    
    restartGame() {
        this.gameBoard.innerHTML = '';
        this.clearWinningPathHighlight();
        this.grid = [];
        this.shapes = [];
        this.gates = [];
        this.moveCount = 0;
        this.isDragging = false;
        this.draggedShape = null;
        this.pathConnected = false;
        this.winningPath = [];
        this.generateAndCheckBoard();
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

        const pattern = shape.pattern;
        const patternHeight = pattern.length;
        const patternWidth = pattern[0].length;
        
        const blockCoords = [];
        for (let r = 0; r < patternHeight; r++) {
            for (let c = 0; c < patternWidth; c++) {
                if (pattern[r][c] === 1) {
                    blockCoords.push({ r, c });
                }
            }
        }

        const minR = Math.min(...blockCoords.map(coord => coord.r));
        const maxR = Math.max(...blockCoords.map(coord => coord.r));
        const minC = Math.min(...blockCoords.map(coord => coord.c));
        const maxC = Math.max(...blockCoords.map(coord => coord.c));

        blockCoords.forEach(({ r, c }) => {
            const gridRow = shape.startRow + r;
            const gridCol = shape.startCol + c;

            this.grid[gridRow][gridCol].isEmpty = false;
            this.grid[gridRow][gridCol].shapeId = shape.id;
            
            const block = this.createShapeBlock(shape, gridRow, gridCol);
            
            const shadows = [
                'inset 0 2px 2px rgba(255, 255, 255, 0.3)',
                'inset 0 -2px 2px rgba(0, 0, 0, 0.15)'
            ];

            // Add borders to the outside of the shape
            if (r === 0 || pattern[r - 1][c] === 0) shadows.push('inset 0 2px 0 0 rgba(0, 0, 0, 0.2)');
            if (r === patternHeight - 1 || !pattern[r + 1] || pattern[r + 1][c] === 0) shadows.push('inset 0 -2px 0 0 rgba(0, 0, 0, 0.2)');
            if (c === 0 || pattern[r][c - 1] === 0) shadows.push('inset 2px 0 0 0 rgba(0, 0, 0, 0.2)');
            if (c === patternWidth - 1 || pattern[r][c + 1] === 0) shadows.push('inset -2px 0 0 0 rgba(0, 0, 0, 0.2)');

            block.style.boxShadow = shadows.join(', ');

            // Add orientation and arrow classes
            block.classList.add(shape.orientation);
            if (shape.orientation === 'horizontal') {
                if (c === minC) block.classList.add('shape-start');
                if (c === maxC) block.classList.add('shape-finish');
            } else { // vertical
                if (r === minR) block.classList.add('shape-start');
                if (r === maxR) block.classList.add('shape-finish');
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
        // Mouse Events
        this.gameBoard.addEventListener('mousedown', this.handleDragStart.bind(this));
        document.addEventListener('mousemove', this.handleDragMove.bind(this));
        document.addEventListener('mouseup', this.handleDragEnd.bind(this));

        // Touch Events
        this.gameBoard.addEventListener('touchstart', this.handleDragStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleDragMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleDragEnd.bind(this));
    }

    getEventPosition(e) {
        // Handles both mouse and touch events to get coordinates.
        let touch;
        if (e.type.startsWith('touch')) {
            touch = e.touches[0] || e.changedTouches[0];
        }
        return {
            x: touch ? touch.clientX : e.clientX,
            y: touch ? touch.clientY : e.clientY
        };
    }

    handleDragStart(e) {
        if (this.pathConnected) return; // Lock board on win

        const blockElement = e.target.closest('.shape-block');
        if (!blockElement) return;

        // Prevent default browser actions, like scrolling, on touch devices.
        if (e.type.startsWith('touch')) {
            e.preventDefault();
        }
        
        const shapeId = blockElement.dataset.shapeId;
        const shape = this.shapes.find(s => s.id === shapeId);
        if (!shape) return;

        this.isDragging = true;
        this.draggedShape = shape;
        this.originalPosition = { startRow: shape.startRow, startCol: shape.startCol };
        this.draggedShape.lastGridPosition = { row: shape.startRow, col: shape.startCol };
        this.dragAxis = null; // To lock movement axis after first move

        const boardRect = this.gameBoard.getBoundingClientRect();
        const firstBlockRect = shape.elements[0].getBoundingClientRect();
        const shapePixelLeft = firstBlockRect.left - boardRect.left;
        const shapePixelTop = firstBlockRect.top - boardRect.top;
        const eventPos = this.getEventPosition(e);
        
        this.dragOffset = {
            x: eventPos.x - boardRect.left - shapePixelLeft,
            y: eventPos.y - boardRect.top - shapePixelTop
        };
        
        this.removeShapeFromGrid(shape);

        shape.elements.forEach(el => {
            el.style.zIndex = 1000;
            el.style.transition = 'none';
        });
    }

    handleDragMove(e) {
        if (!this.isDragging || !this.draggedShape) return;
        
        if (e.type.startsWith('touch')) {
            e.preventDefault();
        }

        const boardRect = this.gameBoard.getBoundingClientRect();
        const eventPos = this.getEventPosition(e);
        const mouseX = eventPos.x - boardRect.left;
        const mouseY = eventPos.y - boardRect.top;
        
        const desiredPixelX = mouseX - this.dragOffset.x;
        const desiredPixelY = mouseY - this.dragOffset.y;

        const { row: desiredGridRow, col: desiredGridCol } = this.pixelToGridPosition(desiredPixelX, desiredPixelY);

        const originalGridRow = this.originalPosition.startRow;
        const originalGridCol = this.originalPosition.startCol;
        
        let targetGridRow = this.originalPosition.startRow;
        let targetGridCol = this.originalPosition.startCol;
        
        if (this.draggedShape.orientation === 'horizontal') {
            targetGridRow = originalGridRow; // Row is fixed
            const dCol = desiredGridCol - originalGridCol;
            const step = dCol > 0 ? 1 : -1;
            
            for (let c = originalGridCol + step; (step > 0 ? c <= desiredGridCol : c >= desiredGridCol); c += step) {
                if (this.canPlaceShape(this.draggedShape.pattern, targetGridRow, c)) {
                    targetGridCol = c;
                } else {
                    break;
                }
            }
        } else { // 'vertical'
            targetGridCol = originalGridCol; // Col is fixed
            const dRow = desiredGridRow - originalGridRow;
            const step = dRow > 0 ? 1 : -1;
            
            for (let r = originalGridRow + step; (step > 0 ? r <= desiredGridRow : r >= desiredGridRow); r += step) {
                if (this.canPlaceShape(this.draggedShape.pattern, r, targetGridCol)) {
                    targetGridRow = r;
                } else {
                    break;
                }
            }
        }
        
        this.draggedShape.lastGridPosition = { row: targetGridRow, col: targetGridCol };
        
        const finalPixelX = targetGridCol * (this.cellSize + this.gap) + this.boardPadding;
        const finalPixelY = targetGridRow * (this.cellSize + this.gap) + this.boardPadding;
        
        this.updateShapePixelPosition(finalPixelX, finalPixelY);
        this.updateShapePreview(finalPixelX, finalPixelY);
    }

    handleDragEnd(e) {
        if (!this.isDragging || !this.draggedShape) return;
        this.isDragging = false;
        // this.dragAxis = null; // No longer needed
        
        this.clearShapePreview();

        const finalGridPos = this.draggedShape.lastGridPosition || this.originalPosition;

        if (this.canPlaceShape(this.draggedShape.pattern, finalGridPos.row, finalGridPos.col)) {
            this.draggedShape.startRow = finalGridPos.row;
            this.draggedShape.startCol = finalGridPos.col;
            if(finalGridPos.row !== this.originalPosition.startRow || finalGridPos.col !== this.originalPosition.startCol) {
                this.moveCount++;
            }
        } else {
            this.draggedShape.startRow = this.originalPosition.startRow;
            this.draggedShape.startCol = this.originalPosition.startCol;
        }

        this.placeShapeOnGrid(this.draggedShape);

        this.draggedShape.elements.forEach(el => {
            el.style.zIndex = 100;
            el.style.transition = '';
        });

        this.draggedShape = null;
        this.checkPathConnection();
        this.updateUI();
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
        const { r: firstR, c: firstC } = this.getFirstBlockPatternOffset(shape);
        let currentIndex = 0;
        for (let r = 0; r < shape.pattern.length; r++) {
            for (let c = 0; c < shape.pattern[r].length; c++) {
                if (shape.pattern[r][c] === 1) {
                    if (currentIndex === elementIndex) {
                        return { r: r - firstR, c: c - firstC };
                    }
                    currentIndex++;
                }
            }
        }
        return { r: 0, c: 0 };
    }

    checkPathExists(grid = this.grid) {
        const startGate = this.gates.find(g => g.type === 'start');
        const endGate = this.gates.find(g => g.type === 'end');

        if (!startGate || !endGate) return null;

        const startRow = startGate.edge === 'top' ? 0 : this.gridSize - 1;
        const startCol = startGate.position;
        const endRow = endGate.edge === 'bottom' ? this.gridSize - 1 : 0;
        const endCol = endGate.position;

        // A cell is "walkable" if it is empty.
        const isWalkable = (row, col) => {
            if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) {
                return false;
            }
            // A gate cell is only walkable if it is also empty.
            if (grid[row][col].hasGate) {
                return grid[row][col].isEmpty;
            }
            return grid[row][col].isEmpty;
        };

        // The starting gate must be empty to begin.
        if (!grid[startRow][startCol].isEmpty) {
            return null;
        }

        const queue = [{ row: startRow, col: startCol, path: [{row: startRow, col: startCol}] }];
        const visited = new Set([`${startRow},${startCol}`]);

        while (queue.length > 0) {
            const { row, col, path } = queue.shift();

            if (row === endRow && col === endCol) {
                // The final gate cell must also be empty to win.
                if (grid[row][col].isEmpty) {
                    return path;
                }
                return null;
            }

            const neighbors = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dr, dc] of neighbors) {
                const newRow = row + dr;
                const newCol = col + dc;
                const key = `${newRow},${newCol}`;

                if (isWalkable(newRow, newCol) && !visited.has(key)) {
                    visited.add(key);
                    const newPath = [...path, {row: newRow, col: newCol}];
                    queue.push({ row: newRow, col: newCol, path: newPath });
                }
            }
        }
        return null; // No path found
    }

    checkPathConnection() {
        const foundPath = this.checkPathExists();
        const pathIsNowConnected = !!foundPath;

        if (pathIsNowConnected && !this.pathConnected) {
            this.pathConnected = true;
            this.winningPath = foundPath;
            this.highlightWinningPath();
        } else if (!pathIsNowConnected && this.pathConnected) {
            this.pathConnected = false;
            this.winningPath = [];
            this.clearWinningPathHighlight();
        }
        
        this.updateUI();
    }

    highlightWinningPath() {
        this.gameContainer.classList.add('game-won');
        this.winningPath.forEach(cellPos => {
            this.grid[cellPos.row][cellPos.col].element.classList.add('path-highlight');
        });
    }

    clearWinningPathHighlight() {
        this.gameContainer.classList.remove('game-won');
        document.querySelectorAll('.grid-cell.path-highlight').forEach(el => {
            el.classList.remove('path-highlight');
        });
    }

    updateUI() {
        const pathStatusEl = document.getElementById('pathStatus');
        const winMessageEl = document.getElementById('winMessage');

        if (this.pathConnected) {
            pathStatusEl.style.opacity = '0';
            winMessageEl.style.opacity = '1';
            winMessageEl.style.transform = 'translateY(0)';
        } else {
            pathStatusEl.style.opacity = '1';
            winMessageEl.style.opacity = '0';
            winMessageEl.style.transform = 'translateY(10px)';
        }
    }

    isSolvable() {
        const initialShapes = JSON.parse(JSON.stringify(this.shapes));
        const queue = [initialShapes];
        const visited = new Set([this.getShapesState(initialShapes)]);
        
        let iterations = 0;
        const maxIterations = 8000;

        while (queue.length > 0) {
            iterations++;
            if (iterations > maxIterations) {
                console.warn(`Solvability check timed out after ${maxIterations} iterations.`);
                return false;
            }

            const currentShapes = queue.shift();
            const currentGrid = this.createGridFromShapes(currentShapes);
            
            if (this.checkPathExists(currentGrid)) {
                console.log(`SOLVABLE: Path found after ${iterations} iterations.`);
                return true;
            }
            
            const nextShapeStates = this.getAllPossibleNextShapeStates(currentShapes, currentGrid);
            
            for (const nextShapes of nextShapeStates) {
                const stateString = this.getShapesState(nextShapes);
                if (!visited.has(stateString)) {
                    visited.add(stateString);
                    queue.push(nextShapes);
                }
            }
        }
        console.log(`NOT SOLVABLE: Explored ${visited.size} states and found no solution.`);
        return false;
    }

    getShapesState(shapes) {
        return shapes.sort((a, b) => a.id.localeCompare(b.id))
                     .map(s => `${s.id}:${s.startRow},${s.startCol}`)
                     .join('|');
    }

    createGridFromShapes(shapes) {
        const grid = [];
        for (let row = 0; row < this.gridSize; row++) {
            grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                grid[row][col] = { isEmpty: true, shapeId: null };
            }
        }
        for (const shape of shapes) {
            for (let r = 0; r < shape.pattern.length; r++) {
                for (let c = 0; c < shape.pattern[r].length; c++) {
                    if (shape.pattern[r][c] === 1) {
                        const gridRow = shape.startRow + r;
                        const gridCol = shape.startCol + c;
                        if(grid[gridRow] && grid[gridRow][gridCol]){
                           grid[gridRow][gridCol].isEmpty = false;
                           grid[gridRow][gridCol].shapeId = shape.id;
                        }
                    }
                }
            }
        }
        this.gates.forEach(gate => {
            const gateRow = gate.edge === 'top' ? 0 : this.gridSize - 1;
            if (grid[gateRow] && grid[gateRow][gate.position]) {
                grid[gateRow][gate.position].isEmpty = true;
            }
        });
        return grid;
    }

    getAllPossibleNextShapeStates(shapes, grid) {
        const allNextStates = [];
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            const tempGrid = this.createGridFromShapes(shapes.filter(s => s.id !== shape.id));

            if (shape.orientation === 'horizontal' || shape.orientation === 'single') {
                // Move left
                for (let c = shape.startCol - 1; c >= 0; c--) {
                    if (this.canPlaceShapeInGrid(shape.pattern, shape.startRow, c, tempGrid)) {
                        const newShapes = JSON.parse(JSON.stringify(shapes));
                        newShapes[i].startCol = c;
                        allNextStates.push(newShapes);
                    } else { break; }
                }
                // Move right
                for (let c = shape.startCol + 1; c < this.gridSize; c++) {
                     if (this.canPlaceShapeInGrid(shape.pattern, shape.startRow, c, tempGrid)) {
                        const newShapes = JSON.parse(JSON.stringify(shapes));
                        newShapes[i].startCol = c;
                        allNextStates.push(newShapes);
                    } else { break; }
                }
            }
            
            if (shape.orientation === 'vertical' || shape.orientation === 'single') {
                // Move up
                for (let r = shape.startRow - 1; r >= 0; r--) {
                    if (this.canPlaceShapeInGrid(shape.pattern, r, shape.startCol, tempGrid)) {
                        const newShapes = JSON.parse(JSON.stringify(shapes));
                        newShapes[i].startRow = r;
                        allNextStates.push(newShapes);
                    } else { break; }
                }
                // Move down
                for (let r = shape.startRow + 1; r < this.gridSize; r++) {
                    if (this.canPlaceShapeInGrid(shape.pattern, r, shape.startCol, tempGrid)) {
                        const newShapes = JSON.parse(JSON.stringify(shapes));
                        newShapes[i].startRow = r;
                        allNextStates.push(newShapes);
                    } else { break; }
                }
            }
        }
        return allNextStates;
    }
    
    canPlaceShapeInGrid(pattern, startRow, startCol, grid) {
        for (let r = 0; r < pattern.length; r++) {
            for (let c = 0; c < pattern[r].length; c++) {
                if (pattern[r][c] === 1) {
                    const gridRow = startRow + r;
                    const gridCol = startCol + c;
                    if (gridRow < 0 || gridRow >= this.gridSize || gridCol < 0 || gridCol >= this.gridSize) {
                        return false;
                    }
                    if (!grid[gridRow][gridCol].isEmpty) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new PuzzleMaster();
    game.init();
});
